
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patientData: PatientFormData) => void;
}

interface PatientFormData {
  name: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  contact: string;
  diagnosis?: string;
  notes?: string;
}

const NewPatientModal: React.FC<NewPatientModalProps> = ({ isOpen, onClose, onSave }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    age: 0,
    sex: 'Male',
    contact: '',
    diagnosis: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.age || !formData.sex || !formData.contact) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    onSave(formData);
    toast({
      title: "Success",
      description: "Patient information saved successfully",
    });
    
    // Reset form
    setFormData({
      name: '',
      age: 0,
      sex: 'Male',
      contact: '',
      diagnosis: '',
      notes: '',
    });
    
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="relative w-full max-w-lg max-h-[90vh] overflow-auto glass shadow-glass border rounded-xl p-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">New Patient</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-secondary transition-all-medium"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-200"
                  placeholder="Full Name"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age || ''}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-200"
                    min="0"
                    max="150"
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Sex *</label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-200"
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Contact Number *</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-200"
                  placeholder="Phone number"
                  required
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Initial Diagnosis</label>
                <input
                  type="text"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-200"
                  placeholder="Initial diagnosis if available"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-200 min-h-[100px] resize-y"
                  placeholder="Additional notes..."
                />
              </div>
              
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border hover:bg-secondary transition-all-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all-medium"
                >
                  Save Patient
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewPatientModal;
