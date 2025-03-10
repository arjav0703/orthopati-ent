import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '@/components/Layout';
import { usePatients, Patient } from '@/utils/patientStore';
import { useToast } from "@/hooks/use-toast";
import { format, startOfWeek, addDays, isSameDay, getDay, parseISO } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Appointments</h1>
            <p className="text-muted-foreground mt-1">
              Manage your patient appointments
            </p>
          </div>
          <Button onClick={() => setIsAddingAppointment(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          <Card>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Appointments for {format(selectedDate, "MMMM d, yyyy")}
            </h2>

            {isAddingAppointment && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">New Appointment</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsAddingAppointment(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Patient</Label>
                      <Select
                        value={newAppointment.patientId}
                        onValueChange={(value) =>
                          setNewAppointment({ ...newAppointment, patientId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Select
                        value={newAppointment.time}
                        onValueChange={(value) =>
                          setNewAppointment({ ...newAppointment, time: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Duration (minutes)</Label>
                      <Select
                        value={String(newAppointment.duration)}
                        onValueChange={(value) =>
                          setNewAppointment({
                            ...newAppointment,
                            duration: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      name="description"
                      value={newAppointment.description}
                      onChange={handleInputChange}
                      placeholder="Add appointment details..."
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingAppointment(false)}
                    >
                      Cancel
                    </Button>
                    <Button>Save Appointment</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-4">
                      {/* Appointment details */}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center p-8 border rounded-lg">
                  <p className="text-muted-foreground">
                    No appointments scheduled for this day
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Appointments;
