import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  ChevronRight,
  Calendar,
  Search as SearchIcon,
} from "lucide-react";
import Layout from "@/components/Layout";
import PatientCard from "@/components/PatientCard";
import NewPatientModal from "@/components/NewPatientModal";
import { usePatients } from "@/utils/patientStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModeToggle } from "@/components/mode-toggle";

const Index = () => {
  const navigate = useNavigate();
  const { patients, addPatient } = usePatients();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get recent patients (last 6)
  const recentPatients = [...patients]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);

  const handleAddPatient = async (patientData: any) => {
    await addPatient(patientData);
  };

  return (
    <Layout className="dark:bg-zinc-800 min-h-screen bg-green-100 ">
      <div className="max-w-7xl mx-auto space-y-6 pt-4 sm:pt-6 dark:bg-zinc-800 dark:text-white">
        {/* Header Section - More compact on mobile */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <nav className="flex justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Manage your patients and appointments
              </p>
            </div>
            <div className="sm:hidden">
              <ModeToggle />
            </div>
          </nav>
          <span className="flex gap-2">
            <div className="hidden md:block">
              <ModeToggle />
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto border dark:hover:bg-green-800 hover:bg-green-400"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Patient
            </Button>
          </span>
        </div>

        {/* Quick Actions - Stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">
                Total Patients
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-2xl sm:text-3xl font-bold">
                {patients.length}
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer" onClick={() => navigate("/search")}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">
                Search Patients
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 flex items-center text-muted-foreground">
              <SearchIcon className="mr-2" size={18} />
              <span className="text-sm sm:text-base">Quick search...</span>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}

        <div className="flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold">Recent Patients</h2>
          <Button
            variant="ghost"
            onClick={() => navigate("/search")}
            className="text-sm sm:text-base hover:underline hover:text-green-600"
          >
            View all
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>

        {/* Patient Cards Grid */}
        {recentPatients.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 ">
            {recentPatients.map((patient, index) => (
              <PatientCard
                key={patient.id}
                id={patient.id}
                name={patient.name}
                age={patient.age}
                sex={patient.sex}
                diagnosis={patient.diagnosis}
                lastVisit={
                  patient.visits.length > 0
                    ? new Date(
                        patient.visits[patient.visits.length - 1].date,
                      ).toLocaleDateString()
                    : new Date(patient.createdAt).toLocaleDateString()
                }
                xrayRequired={patient.visits.some(
                  (visit) => visit.xrayRequired,
                )}
                index={index}
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="text-center p-6 sm:p-8 border rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              No patients added yet
            </p>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              className="text-sm sm:text-base"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add your first patient
            </Button>
          </motion.div>
        )}
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
