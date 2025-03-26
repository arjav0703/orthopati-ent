import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ChevronRight, Calendar, Search as SearchIcon } from "lucide-react";
import Layout from "@/components/Layout";
import PatientCard from "@/components/PatientCard";
import NewPatientModal from "@/components/NewPatientModal";
import { usePatients } from "@/utils/patientStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const navigate = useNavigate();
  const { patients, addPatient } = usePatients();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get recent patients (last 6)
  const recentPatients = [...patients]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  // Get upcoming appointments (next 3)
  const upcomingAppointments = []; // TODO: Implement appointments logic

  const handleAddPatient = async (patientData: any) => {
    await addPatient(patientData);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your patients and appointments
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Patient
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{patients.length}</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer" onClick={() => navigate('/search')}>
            <CardHeader>
              <CardTitle className="text-lg">Search Patients</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center text-muted-foreground">
              <SearchIcon className="mr-2" size={20} />
              <span>Quick search...</span>
            </CardContent>
          </Card>
          <Card className="cursor-pointer" onClick={() => navigate('/appointments')}>
            <CardHeader>
              <CardTitle className="text-lg">Appointments</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center text-muted-foreground">
              <Calendar className="mr-2" size={20} />
              <span>View schedule</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="patients" className="space-y-4">
          <TabsList>
            <TabsTrigger value="patients">Recent Patients</TabsTrigger>
            <TabsTrigger value="appointments">Upcoming Appointments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="patients" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Patients</h2>
              <Button variant="ghost" onClick={() => navigate('/search')}>
                View all
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
            
            {recentPatients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    xrayRequired={patient.visits.some(visit => visit.xrayRequired)}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <motion.div 
                className="text-center p-8 border rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-muted-foreground mb-4">No patients added yet</p>
                <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first patient
                </Button>
              </motion.div>
            )}
          </TabsContent>
          
          <TabsContent value="appointments">
            {/* TODO: Implement appointments view */}
            <div className="text-center p-8 border rounded-lg">
              <p className="text-muted-foreground">No upcoming appointments</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <NewPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddPatient}
      />
    </Layout>
  );
};

export default Index;
