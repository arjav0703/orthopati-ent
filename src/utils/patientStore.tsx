import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

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
  xrayRequired: boolean;
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
  
  // Load patients from API
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const response = await fetch('/api/patients');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPatients(data);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to load patients from API:', error);
        // Fallback to localStorage
        loadFromLocalStorage();
      }
    };
    
    loadPatients();
  }, []);
  
  // Fallback to localStorage if API fails
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
    setIsInitialized(true);
  };
  
  // Add a new patient
  const addPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'visits'>): Promise<string> => {
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const { id } = await response.json();
      
      // Update local state
      const newPatient: Patient = {
        ...patientData,
        id,
        createdAt: new Date().toISOString(),
        visits: []
      };
      
      setPatients(prevPatients => [...prevPatients, newPatient]);
      return id;
    } catch (error) {
      console.error('Failed to add patient via API:', error);
      
      // Fallback to client-side only
      const id = uuidv4();
      const newPatient: Patient = {
        ...patientData,
        id,
        createdAt: new Date().toISOString(),
        visits: []
      };
      
      setPatients(prevPatients => [...prevPatients, newPatient]);
      return id;
    }
  };
  
  // Get a patient by ID
  const getPatient = async (id: string): Promise<Patient | undefined> => {
    try {
      const response = await fetch(`/api/patients/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return undefined;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get patient via API:', error);
      // Fallback to in-memory state
      return patients.find(patient => patient.id === id);
    }
  };
  
  // Update a patient
  const updatePatient = async (id: string, data: Partial<Omit<Patient, 'id' | 'createdAt' | 'visits'>>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
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
      console.error('Failed to update patient via API:', error);
      
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
      const response = await fetch(`/api/patients/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Update local state
      setPatients(prevPatients => prevPatients.filter(patient => patient.id !== id));
      
      return true;
    } catch (error) {
      console.error('Failed to delete patient via API:', error);
      
      // Fallback to updating in-memory state only
      setPatients(prevPatients => prevPatients.filter(patient => patient.id !== id));
      
      return true;
    }
  };
  
  // Add a visit to a patient
  const addVisit = async (patientId: string, visitData: Omit<Visit, 'id'>): Promise<string | null> => {
    try {
      const response = await fetch(`/api/patients/${patientId}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const { id } = await response.json();
      
      // Update local state
      setPatients(prevPatients => {
        const patientIndex = prevPatients.findIndex(patient => patient.id === patientId);
        if (patientIndex === -1) return prevPatients;
        
        const newVisit: Visit = {
          ...visitData,
          id
        };
        
        const updatedPatients = [...prevPatients];
        updatedPatients[patientIndex].visits = [
          ...updatedPatients[patientIndex].visits,
          newVisit
        ];
        
        return updatedPatients;
      });
      
      return id;
    } catch (error) {
      console.error('Failed to add visit via API:', error);
      
      // Fallback to updating in-memory state only
      const visitId = uuidv4();
      
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
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to search patients via API:', error);
      
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
