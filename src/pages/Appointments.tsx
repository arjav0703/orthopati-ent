
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '@/components/Layout';
import { usePatients, Patient } from '@/utils/patientStore';
import { useToast } from "@/hooks/use-toast";
import { format, startOfWeek, addDays, isSameDay, getDay, parseISO } from 'date-fns';

interface Appointment {
  id: string;
  patientId: string;
  date: string; // ISO string
  time: string; // HH:MM format
  duration: number; // in minutes
  description?: string;
}

// Times for appointment slots
const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', 
  '16:00', '16:30', '17:00', '17:30'
];

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const storedAppointments = localStorage.getItem('orthopati-ent-appointments');
    return storedAppointments ? JSON.parse(storedAppointments) : [];
  });
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [newAppointment, setNewAppointment] = useState<Omit<Appointment, 'id'>>({
    patientId: '',
    date: format(selectedDate, 'yyyy-MM-dd'),
    time: '09:00',
    duration: 30,
    description: ''
  });
  
  const { patients } = usePatients();
  const { toast } = useToast();
  
  // Save appointments to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('orthopati-ent-appointments', JSON.stringify(appointments));
  }, [appointments]);
  
  // Update date in new appointment form when selected date changes
  React.useEffect(() => {
    setNewAppointment(prev => ({
      ...prev,
      date: format(selectedDate, 'yyyy-MM-dd')
    }));
  }, [selectedDate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAppointment(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Get appointments for the selected date
  const getAppointmentsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return appointments.filter(app => app.date === dateString);
  };
  
  // Get appointment at specific time slot
  const getAppointmentAtTime = (date: Date, time: string) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return appointments.find(app => app.date === dateString && app.time === time);
  };
  
  // Get patient details by ID
  const getPatientDetails = (patientId: string): Patient | undefined => {
    return patients.find(patient => patient.id === patientId);
  };
  
  // Add a new appointment
  const handleAddAppointment = () => {
    // Validate appointment details
    if (!newAppointment.patientId) {
      toast({
        title: "Missing Information",
        description: "Please select a patient",
        variant: "destructive",
      });
      return;
    }
    
    // Check if the time slot is already booked
    const existingAppointment = getAppointmentAtTime(parseISO(newAppointment.date), newAppointment.time);
    if (existingAppointment) {
      toast({
        title: "Time Slot Unavailable",
        description: "This time slot is already booked",
        variant: "destructive",
      });
      return;
    }
    
    // Create new appointment with an ID
    const id = crypto.randomUUID();
    const appointmentToAdd = {
      id,
      ...newAppointment
    };
    
    // Add to appointments list
    setAppointments(prev => [...prev, appointmentToAdd]);
    
    // Close form and reset it
    setIsAddingAppointment(false);
    setNewAppointment({
      patientId: '',
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: '09:00',
      duration: 30,
      description: ''
    });
    
    // Show success message
    toast({
      title: "Success",
      description: "Appointment scheduled successfully",
    });
  };
  
  // Delete an appointment
  const handleDeleteAppointment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      setAppointments(prev => prev.filter(app => app.id !== id));
      
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });
    }
  };
  
  // Navigate to previous day
  const goToPreviousDay = () => {
    setSelectedDate(prevDate => addDays(prevDate, -1));
  };
  
  // Navigate to next day
  const goToNextDay = () => {
    setSelectedDate(prevDate => addDays(prevDate, 1));
  };
  
  // Generate week day headers
  const renderWeekDays = () => {
    const startDate = startOfWeek(selectedDate);
    return Array.from({ length: 7 }).map((_, index) => {
      const day = addDays(startDate, index);
      const isSelected = isSameDay(day, selectedDate);
      
      return (
        <button
          key={index}
          onClick={() => setSelectedDate(day)}
          className={`flex-1 py-2 text-center rounded-lg transition-all-medium ${
            isSelected 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-secondary'
          }`}
        >
          <div className="text-xs uppercase">{format(day, 'EEE')}</div>
          <div className={`text-lg font-medium ${isSelected ? '' : 'text-muted-foreground'}`}>
            {format(day, 'd')}
          </div>
        </button>
      );
    });
  };
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto animate-fadeIn">
        <motion.h1 
          className="text-3xl font-bold mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Appointments
        </motion.h1>
        <motion.p 
          className="text-muted-foreground mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          Manage patient appointments and scheduling
        </motion.p>
        
        {/* Calendar navigation */}
        <div className="glass border rounded-xl shadow-subtle p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon size={20} className="text-primary" />
              <h2 className="text-xl font-semibold">Calendar</h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={goToPreviousDay}
                className="p-2 rounded-lg hover:bg-secondary transition-all-medium"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="font-medium">
                {format(selectedDate, 'MMMM d, yyyy')}
              </div>
              <button 
                onClick={goToNextDay}
                className="p-2 rounded-lg hover:bg-secondary transition-all-medium"
              >
                <ChevronRight size={20} />
              </button>
              <button 
                onClick={() => setSelectedDate(new Date())}
                className="ml-2 px-3 py-1 text-sm rounded-lg bg-secondary hover:bg-secondary/70 transition-all-medium"
              >
                Today
              </button>
            </div>
          </div>
          
          {/* Week day selector */}
          <div className="flex gap-2 mb-4">
            {renderWeekDays()}
          </div>
          
          {/* Add appointment button */}
          <div className="flex justify-end mb-6">
            {!isAddingAppointment && (
              <button 
                onClick={() => setIsAddingAppointment(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow-subtle hover:bg-primary/90 transition-all-medium"
              >
                <Plus size={16} />
                <span>Add Appointment</span>
              </button>
            )}
          </div>
          
          {/* Add appointment form */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: isAddingAppointment ? 1 : 0,
              height: isAddingAppointment ? 'auto' : 0
            }}
            transition={{ duration: 0.3 }}
          >
            {isAddingAppointment && (
              <div className="border rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">New Appointment</h3>
                  <button 
                    onClick={() => setIsAddingAppointment(false)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Patient *</label>
                    <select
                      name="patientId"
                      value={newAppointment.patientId}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-200"
                      required
                    >
                      <option value="">Select Patient</option>
                      {patients.map(patient => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={newAppointment.date}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Time *</label>
                    <select
                      name="time"
                      value={newAppointment.time}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-200"
                      required
                    >
                      {timeSlots.map(time => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Duration (minutes) *</label>
                    <select
                      name="duration"
                      value={newAppointment.duration.toString()}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-200"
                      required
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    name="description"
                    value={newAppointment.description || ''}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-200 min-h-[80px] resize-y"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsAddingAppointment(false)}
                    className="px-4 py-2 rounded-lg border hover:bg-secondary transition-all-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAppointment}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all-medium"
                  >
                    Save Appointment
                  </button>
                </div>
              </div>
            )}
          </motion.div>
          
          {/* Appointments for selected date */}
          <div>
            <h3 className="font-medium mb-3">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            
            <div className="space-y-3">
              {timeSlots.map(time => {
                const appointment = getAppointmentAtTime(selectedDate, time);
                const patient = appointment ? getPatientDetails(appointment.patientId) : undefined;
                
                return (
                  <div
                    key={time}
                    className={`flex border rounded-lg p-3 transition-all-medium ${
                      appointment ? 'bg-primary/5 border-primary/20' : 'hover:bg-secondary/50'
                    }`}
                  >
                    <div className="w-16 text-muted-foreground flex items-center">
                      <Clock size={14} className="mr-1" />
                      {time}
                    </div>
                    
                    {appointment && patient ? (
                      <div className="flex-1 flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>{appointment.duration} min</span>
                            {appointment.description && (
                              <span>• {appointment.description}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 text-muted-foreground text-sm flex items-center">
                        {isAddingAppointment ? (
                          <span>Select a time in the form above</span>
                        ) : (
                          <button
                            onClick={() => {
                              setIsAddingAppointment(true);
                              setNewAppointment(prev => ({
                                ...prev,
                                time
                              }));
                            }}
                            className="text-primary hover:underline"
                          >
                            Available
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Appointments;
