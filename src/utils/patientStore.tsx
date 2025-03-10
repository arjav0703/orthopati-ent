
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { initDatabase, executeQuery } from './database';

// Type definitions
export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  contact: string;
  diagnosis?: string;
  notes?: string;
  createdAt: string;
  visits: Visit[];
}

export interface Visit {
  id: string;
  date: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  images?: string[]; // Base64 encoded images
}

interface PatientContextType {
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'visits'>) => Promise<string>;
  getPatient: (id: string) => Promise<Patient | undefined>;
  updatePatient: (id: string, data: Partial<Omit<Patient, 'id' | 'createdAt' | 'visits'>>) => Promise<boolean>;
  deletePatient: (id: string) => Promise<boolean>;
  addVisit: (patientId: string, visit: Omit<Visit, 'id'>) => Promise<string | null>;
  searchPatients: (query: string) => Promise<Patient[]>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

// Provider component
export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize database and load patients
  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
        await loadPatients();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Fallback to localStorage if database connection fails
        loadFromLocalStorage();
      }
    };
    
    initialize();
  }, []);
  
  // Fallback to localStorage if database connection fails
  const loadFromLocalStorage = () => {
    const storedPatients = localStorage.getItem('orthopati-ent-patients');
    if (storedPatients) {
      try {
        setPatients(JSON.parse(storedPatients));
      } catch (error) {
        console.error('Failed to parse stored patients data:', error);
        setPatients([]);
      }
    }
  };
  
  // Load patients from database
  const loadPatients = async () => {
    try {
      const patientsResult = await executeQuery('SELECT * FROM patients');
      
      const loadedPatients: Patient[] = [];
      
      for (const patient of patientsResult as any[]) {
        // Load visits for each patient
        const visitsResult = await executeQuery(
          'SELECT v.* FROM visits v WHERE v.patientId = ?',
          [patient.id]
        );
        
        const visits: Visit[] = [];
        
        for (const visit of visitsResult as any[]) {
          // Load images for each visit
          const imagesResult = await executeQuery(
            'SELECT * FROM visit_images WHERE visitId = ?',
            [visit.id]
          );
          
          const images = (imagesResult as any[]).map(img => img.imageData);
          
          visits.push({
            id: visit.id,
            date: new Date(visit.date).toISOString(),
            diagnosis: visit.diagnosis,
            prescription: visit.prescription,
            notes: visit.notes,
            images: images.length > 0 ? images : undefined
          });
        }
        
        loadedPatients.push({
          id: patient.id,
          name: patient.name,
          age: patient.age,
          sex: patient.sex as 'Male' | 'Female' | 'Other',
          contact: patient.contact,
          diagnosis: patient.diagnosis,
          notes: patient.notes,
          createdAt: new Date(patient.createdAt).toISOString(),
          visits
        });
      }
      
      setPatients(loadedPatients);
    } catch (error) {
      console.error('Failed to load patients from database:', error);
      loadFromLocalStorage();
    }
  };
  
  // Add a new patient
  const addPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'visits'>): Promise<string> => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    try {
      await executeQuery(
        'INSERT INTO patients (id, name, age, sex, contact, diagnosis, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, patientData.name, patientData.age, patientData.sex, patientData.contact, patientData.diagnosis || null, patientData.notes || null, now]
      );
      
      const newPatient: Patient = {
        ...patientData,
        id,
        createdAt: now,
        visits: []
      };
      
      setPatients(prevPatients => [...prevPatients, newPatient]);
      return id;
    } catch (error) {
      console.error('Failed to add patient to database:', error);
      // Fallback to memory-only storage
      const newPatient: Patient = {
        ...patientData,
        id,
        createdAt: now,
        visits: []
      };
      
      setPatients(prevPatients => [...prevPatients, newPatient]);
      return id;
    }
  };
  
  // Get a patient by ID
  const getPatient = async (id: string): Promise<Patient | undefined> => {
    try {
      const result = await executeQuery('SELECT * FROM patients WHERE id = ?', [id]);
      const patientRows = result as any[];
      
      if (patientRows.length === 0) {
        return undefined;
      }
      
      const patient = patientRows[0];
      
      // Load visits
      const visitsResult = await executeQuery('SELECT * FROM visits WHERE patientId = ?', [id]);
      const visits: Visit[] = [];
      
      for (const visit of visitsResult as any[]) {
        // Load images
        const imagesResult = await executeQuery('SELECT * FROM visit_images WHERE visitId = ?', [visit.id]);
        const images = (imagesResult as any[]).map(img => img.imageData);
        
        visits.push({
          id: visit.id,
          date: new Date(visit.date).toISOString(),
          diagnosis: visit.diagnosis,
          prescription: visit.prescription,
          notes: visit.notes,
          images: images.length > 0 ? images : undefined
        });
      }
      
      return {
        id: patient.id,
        name: patient.name,
        age: patient.age,
        sex: patient.sex,
        contact: patient.contact,
        diagnosis: patient.diagnosis,
        notes: patient.notes,
        createdAt: new Date(patient.createdAt).toISOString(),
        visits
      };
    } catch (error) {
      console.error('Failed to get patient from database:', error);
      // Fallback to in-memory state
      return patients.find(patient => patient.id === id);
    }
  };
  
  // Update a patient
  const updatePatient = async (id: string, data: Partial<Omit<Patient, 'id' | 'createdAt' | 'visits'>>): Promise<boolean> => {
    try {
      const setClause = Object.keys(data)
        .map(key => `${key} = ?`)
        .join(', ');
      
      const values = Object.values(data);
      
      if (values.length === 0) {
        return false;
      }
      
      await executeQuery(`UPDATE patients SET ${setClause} WHERE id = ?`, [...values, id]);
      
      // Update local state
      setPatients(prevPatients => {
        const index = prevPatients.findIndex(patient => patient.id === id);
        if (index === -1) return prevPatients;
        
        const updatedPatients = [...prevPatients];
        updatedPatients[index] = {
          ...updatedPatients[index],
          ...data
        };
        
        return updatedPatients;
      });
      
      return true;
    } catch (error) {
      console.error('Failed to update patient in database:', error);
      
      // Fallback to updating in-memory state only
      setPatients(prevPatients => {
        const index = prevPatients.findIndex(patient => patient.id === id);
        if (index === -1) return prevPatients;
        
        const updatedPatients = [...prevPatients];
        updatedPatients[index] = {
          ...updatedPatients[index],
          ...data
        };
        
        return updatedPatients;
      });
      
      return true;
    }
  };
  
  // Delete a patient
  const deletePatient = async (id: string): Promise<boolean> => {
    try {
      await executeQuery('DELETE FROM patients WHERE id = ?', [id]);
      
      // Update local state
      setPatients(prevPatients => prevPatients.filter(patient => patient.id !== id));
      
      return true;
    } catch (error) {
      console.error('Failed to delete patient from database:', error);
      
      // Fallback to updating in-memory state only
      setPatients(prevPatients => prevPatients.filter(patient => patient.id !== id));
      
      return true;
    }
  };
  
  // Add a visit to a patient
  const addVisit = async (patientId: string, visitData: Omit<Visit, 'id'>): Promise<string | null> => {
    const visitId = uuidv4();
    
    try {
      await executeQuery(
        'INSERT INTO visits (id, patientId, date, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [
          visitId,
          patientId,
          new Date(visitData.date), // Convert ISO string to Date for MySQL
          visitData.diagnosis || null,
          visitData.prescription || null,
          visitData.notes || null
        ]
      );
      
      // Add images if present
      if (visitData.images && visitData.images.length > 0) {
        for (const imageData of visitData.images) {
          await executeQuery(
            'INSERT INTO visit_images (id, visitId, imageData) VALUES (?, ?, ?)',
            [uuidv4(), visitId, imageData]
          );
        }
      }
      
      // Update local state
      setPatients(prevPatients => {
        const patientIndex = prevPatients.findIndex(patient => patient.id === patientId);
        if (patientIndex === -1) return prevPatients;
        
        const newVisit: Visit = {
          ...visitData,
          id: visitId
        };
        
        const updatedPatients = [...prevPatients];
        updatedPatients[patientIndex].visits = [
          ...updatedPatients[patientIndex].visits,
          newVisit
        ];
        
        return updatedPatients;
      });
      
      return visitId;
    } catch (error) {
      console.error('Failed to add visit to database:', error);
      
      // Fallback to updating in-memory state only
      setPatients(prevPatients => {
        const patientIndex = prevPatients.findIndex(patient => patient.id === patientId);
        if (patientIndex === -1) return prevPatients;
        
        const newVisit: Visit = {
          ...visitData,
          id: visitId
        };
        
        const updatedPatients = [...prevPatients];
        updatedPatients[patientIndex].visits = [
          ...updatedPatients[patientIndex].visits,
          newVisit
        ];
        
        return updatedPatients;
      });
      
      return visitId;
    }
  };
  
  // Search patients by query
  const searchPatients = async (query: string): Promise<Patient[]> => {
    if (!query.trim()) return [];
    
    try {
      const searchQuery = `%${query.toLowerCase()}%`;
      
      const result = await executeQuery(
        'SELECT * FROM patients WHERE LOWER(name) LIKE ? OR LOWER(diagnosis) LIKE ? OR LOWER(notes) LIKE ?', 
        [searchQuery, searchQuery, searchQuery]
      );
      
      const matchedPatients: Patient[] = [];
      
      for (const patient of result as any[]) {
        // Load visits for each matched patient
        const visitsResult = await executeQuery('SELECT * FROM visits WHERE patientId = ?', [patient.id]);
        const visits: Visit[] = [];
        
        for (const visit of visitsResult as any[]) {
          // Load images
          const imagesResult = await executeQuery('SELECT * FROM visit_images WHERE visitId = ?', [visit.id]);
          const images = (imagesResult as any[]).map(img => img.imageData);
          
          visits.push({
            id: visit.id,
            date: new Date(visit.date).toISOString(),
            diagnosis: visit.diagnosis,
            prescription: visit.prescription,
            notes: visit.notes,
            images: images.length > 0 ? images : undefined
          });
        }
        
        matchedPatients.push({
          id: patient.id,
          name: patient.name,
          age: patient.age,
          sex: patient.sex,
          contact: patient.contact,
          diagnosis: patient.diagnosis,
          notes: patient.notes,
          createdAt: new Date(patient.createdAt).toISOString(),
          visits
        });
      }
      
      return matchedPatients;
    } catch (error) {
      console.error('Failed to search patients in database:', error);
      
      // Fallback to in-memory search
      const lowercaseQuery = query.toLowerCase();
      return patients.filter(patient =>
        patient.name.toLowerCase().includes(lowercaseQuery) ||
        patient.diagnosis?.toLowerCase().includes(lowercaseQuery) ||
        patient.notes?.toLowerCase().includes(lowercaseQuery)
      );
    }
  };
  
  // Save to localStorage as a backup when patients change
  useEffect(() => {
    if (patients.length > 0) {
      localStorage.setItem('orthopati-ent-patients', JSON.stringify(patients));
    }
  }, [patients]);
  
  const value = {
    patients,
    addPatient,
    getPatient,
    updatePatient,
    deletePatient,
    addVisit,
    searchPatients
  };
  
  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};

// Custom hook for using the patient context
export const usePatients = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
};
