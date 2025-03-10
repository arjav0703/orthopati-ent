
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronRight, Users, Calendar, Clock } from 'lucide-react';
import Layout from '@/components/Layout';
import SearchBar from '@/components/SearchBar';
import PatientCard from '@/components/PatientCard';
import NewPatientModal from '@/components/NewPatientModal';
import { usePatients } from '@/utils/patientStore';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { patients, addPatient } = usePatients();
  const navigate = useNavigate();
  
  const recentPatients = patients.slice(0, 5);
  
  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };
  
  const handleAddPatient = (patientData: any) => {
    addPatient(patientData);
  };
  
  // Statistics data
  const stats = [
    { label: 'Total Patients', value: patients.length, icon: <Users size={20} /> },
    { label: 'Upcoming Visits', value: 0, icon: <Calendar size={20} /> },
    { label: 'Recent Visits', value: 0, icon: <Clock size={20} /> },
  ];
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto animate-fadeIn">
        {/* Welcome section */}
        <section className="mb-8">
          <motion.h1 
            className="text-3xl font-bold mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Welcome to OrthoPatient
          </motion.h1>
          <motion.p 
            className="text-muted-foreground mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Manage your patient records efficiently and securely
          </motion.p>
          
          <SearchBar onSearch={handleSearch} className="mb-6" />
          
          {/* Action buttons */}
          <div className="flex gap-4">
            <motion.button
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium shadow-subtle hover:bg-primary/90 transition-all-medium"
              onClick={() => setIsModalOpen(true)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              whileHover={{ y: -2 }}
            >
              <Plus size={20} />
              <span>Add New Patient</span>
            </motion.button>
          </div>
        </section>
        
        {/* Stats cards */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="glass border p-5 rounded-xl shadow-subtle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    {stat.icon}
                  </div>
                  <h3 className="text-lg font-medium">{stat.label}</h3>
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* Recent patients */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Patients</h2>
            <button 
              onClick={() => navigate('/search')}
              className="flex items-center text-primary text-sm font-medium hover:underline"
            >
              View all 
              <ChevronRight size={16} />
            </button>
          </div>
          
          {recentPatients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentPatients.map((patient, index) => (
                <PatientCard
                  key={patient.id}
                  id={patient.id}
                  name={patient.name}
                  age={patient.age}
                  sex={patient.sex}
                  diagnosis={patient.diagnosis}
                  lastVisit={patient.visits.length > 0 ? 
                    new Date(patient.visits[patient.visits.length - 1].date).toLocaleDateString() : 
                    new Date(patient.createdAt).toLocaleDateString()
                  }
                  index={index}
                />
              ))}
            </div>
          ) : (
            <motion.div 
              className="glass border p-8 rounded-xl text-center shadow-subtle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-muted-foreground mb-4">No patients added yet</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
              >
                <Plus size={18} />
                <span>Add your first patient</span>
              </button>
            </motion.div>
          )}
        </section>
      </div>
      
      {/* New Patient Modal */}
      <NewPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddPatient}
      />
    </Layout>
  );
};

export default Index;
