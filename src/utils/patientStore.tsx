
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
  images?: string[]; // Base64 encoded images
}

interface PatientContextType {
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'visits'>) => string;
  getPatient: (id: string) => Patient | undefined;
  updatePatient: (id: string, data: Partial<Omit<Patient, 'id' | 'createdAt' | 'visits'>>) => boolean;
  deletePatient: (id: string) => boolean;
  addVisit: (patientId: string, visit: Omit<Visit, 'id'>) => string | null;
  searchPatients: (query: string) => Patient[];
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

// Provider component
export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Load data from localStorage on initial render
  useEffect(() => {
    const storedPatients = localStorage.getItem('orthopati-ent-patients');
    if (storedPatients) {
      try {
        setPatients(JSON.parse(storedPatients));
      } catch (error) {
        console.error('Failed to parse stored patients data:', error);
        // If parsing fails, initialize with empty array
        setPatients([]);
      }
    }
  }, []);
  
  // Save to localStorage whenever patients change
  useEffect(() => {
    localStorage.setItem('orthopati-ent-patients', JSON.stringify(patients));
  }, [patients]);
  
  // Add a new patient
  const addPatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'visits'>): string => {
    const id = uuidv4();
    const newPatient: Patient = {
      ...patientData,
      id,
      createdAt: new Date().toISOString(),
      visits: []
    };
    
    setPatients(prevPatients => [...prevPatients, newPatient]);
    return id;
  };
  
  // Get a patient by ID
  const getPatient = (id: string): Patient | undefined => {
    return patients.find(patient => patient.id === id);
  };
  
  // Update a patient
  const updatePatient = (id: string, data: Partial<Omit<Patient, 'id' | 'createdAt' | 'visits'>>): boolean => {
    const index = patients.findIndex(patient => patient.id === id);
    if (index === -1) return false;
    
    const updatedPatients = [...patients];
    updatedPatients[index] = {
      ...updatedPatients[index],
      ...data
    };
    
    setPatients(updatedPatients);
    return true;
  };
  
  // Delete a patient
  const deletePatient = (id: string): boolean => {
    const index = patients.findIndex(patient => patient.id === id);
    if (index === -1) return false;
    
    const updatedPatients = patients.filter(patient => patient.id !== id);
    setPatients(updatedPatients);
    return true;
  };
  
  // Add a visit to a patient
  const addVisit = (patientId: string, visitData: Omit<Visit, 'id'>): string | null => {
    const patientIndex = patients.findIndex(patient => patient.id === patientId);
    if (patientIndex === -1) return null;
    
    const visitId = uuidv4();
    const newVisit: Visit = {
      ...visitData,
      id: visitId
    };
    
    const updatedPatients = [...patients];
    updatedPatients[patientIndex].visits = [
      ...updatedPatients[patientIndex].visits,
      newVisit
    ];
    
    setPatients(updatedPatients);
    return visitId;
  };
  
  // Search patients by query
  const searchPatients = (query: string): Patient[] => {
    if (!query.trim()) return [];
    
    const lowercaseQuery = query.toLowerCase();
    return patients.filter(patient =>
      patient.name.toLowerCase().includes(lowercaseQuery) ||
      patient.diagnosis?.toLowerCase().includes(lowercaseQuery) ||
      patient.notes?.toLowerCase().includes(lowercaseQuery)
    );
  };
  
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
