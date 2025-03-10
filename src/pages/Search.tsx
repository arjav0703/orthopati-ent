
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import SearchBar from '@/components/SearchBar';
import PatientCard from '@/components/PatientCard';
import { usePatients } from '@/utils/patientStore';
import { Patient } from '@/utils/patientStore';
import { Filter, Search as SearchIcon } from 'lucide-react';

const Search = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sex: 'all',
    ageMin: '',
    ageMax: '',
    sortBy: 'name',
  });
  
  const { patients, searchPatients } = usePatients();
  
  useEffect(() => {
    if (initialQuery) {
      setFilteredPatients(searchPatients(initialQuery));
    } else {
      setFilteredPatients(patients);
    }
  }, [initialQuery, patients, searchPatients]);
  
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery) {
      setFilteredPatients(searchPatients(searchQuery));
    } else {
      setFilteredPatients(patients);
    }
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const applyFilters = () => {
    let results = query ? searchPatients(query) : [...patients];
    
    // Filter by sex
    if (filters.sex !== 'all') {
      results = results.filter(patient => patient.sex === filters.sex);
    }
    
    // Filter by age range
    if (filters.ageMin) {
      results = results.filter(patient => patient.age >= Number(filters.ageMin));
    }
    
    if (filters.ageMax) {
      results = results.filter(patient => patient.age <= Number(filters.ageMax));
    }
    
    // Sort results
    results.sort((a, b) => {
      if (filters.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (filters.sortBy === 'age') {
        return a.age - b.age;
      } else if (filters.sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
    
    setFilteredPatients(results);
  };
  
  useEffect(() => {
    applyFilters();
  }, [filters, query, patients]);
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto animate-fadeIn">
        <section className="mb-8">
          <motion.h1 
            className="text-3xl font-bold mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Search Patients
          </motion.h1>
          
          <div className="mb-6">
            <SearchBar 
              onSearch={handleSearch} 
              placeholder="Search by name, diagnosis, or notes..." 
              className="mb-4"
            />
            
            <div className="flex justify-between items-center">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <Filter size={16} />
                {showFilters ? 'Hide filters' : 'Show filters'}
              </button>
              <p className="text-sm text-muted-foreground">
                {filteredPatients.length} {filteredPatients.length === 1 ? 'result' : 'results'}
              </p>
            </div>
            
            {showFilters && (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4 p-4 glass rounded-xl border"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Sex</label>
                  <select 
                    name="sex" 
                    value={filters.sex}
                    onChange={handleFilterChange}
                    className="w-full p-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-200"
                  >
                    <option value="all">All</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Min Age</label>
                  <input 
                    type="number" 
                    name="ageMin"
                    value={filters.ageMin}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    min="0"
                    className="w-full p-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Max Age</label>
                  <input 
                    type="number" 
                    name="ageMax"
                    value={filters.ageMax}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    min="0"
                    className="w-full p-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Sort By</label>
                  <select 
                    name="sortBy" 
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                    className="w-full p-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-200"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="age">Age</option>
                    <option value="recent">Most Recent</option>
                  </select>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Search results */}
          {filteredPatients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPatients.map((patient, index) => (
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
              <div className="flex justify-center mb-4 text-muted-foreground">
                <SearchIcon size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-medium mb-2">No patients found</h3>
              <p className="text-muted-foreground">
                {query 
                  ? `No results match "${query}"` 
                  : "Please enter a search term or adjust your filters"}
              </p>
            </motion.div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Search;
