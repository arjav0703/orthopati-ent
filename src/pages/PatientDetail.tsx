import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  ChevronLeft,
  User,
  Calendar,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  FileText,
  Printer,
} from "lucide-react";
import Layout from "@/components/Layout";
import { usePatients, Visit, Patient } from "@/utils/patientStore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import generatePDF from "@/components/pdfgenerator";

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPatient, updatePatient, deletePatient, addVisit } = usePatients();
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddingVisit, setIsAddingVisit] = useState(false);
  const [editedData, setEditedData] = useState({
    name: "",
    age: 0,
    sex: "Male",
    contact: "",
    diagnosis: "",
    notes: "",
  });

  const [newVisit, setNewVisit] = useState<Omit<Visit, "id">>({
    date: new Date().toISOString().split("T")[0],
    diagnosis: "",
    prescription: "",
    notes: "",
    xrayRequired: false,
    fileData: null,
    fileName: "",
    fileType: "",
  });

  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadPatient() {
      if (id) {
        try {
          const patientData = await getPatient(id);
          setPatient(patientData);
          if (patientData) {
            setEditedData({
              name: patientData.name,
              age: patientData.age,
              sex: patientData.sex,
              contact: patientData.contact || "",
              diagnosis: patientData.diagnosis || "",
              notes: patientData.notes || "",
            });
          }
        } catch (error) {
          console.error("Error loading patient:", error);
          toast({
            title: "Error",
            description: "Failed to load patient data",
            variant: "destructive",
          });
        }
      }
    }
    loadPatient();
  }, [id, getPatient, toast]);

  if (!patient || !id) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto animate-fadeIn text-center">
          <h1 className="text-2xl font-bold mb-4">Patient not found</h1>
          <button
            onClick={() => navigate("/")}
            className="text-primary hover:underline inline-flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Back to home
          </button>
        </div>
      </Layout>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: name === "age" ? Number(value) : value,
    }));
  };

  const handleNewVisitInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type, checked } = e.target;
    setNewVisit((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove data:application/pdf;base64, prefix
        const fileData = base64String.split(",")[1];
        setNewVisit((prev) => ({
          ...prev,
          fileData,
          fileName: file.name,
          fileType: file.type,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = () => {
    if (id) {
      const success = updatePatient(id, editedData);
      if (success) {
        setIsEditMode(false);
        setPatient(getPatient(id));
        toast({
          title: "Success",
          description: "Patient information updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update patient information",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeletePatient = () => {
    if (
      id &&
      window.confirm(
        "Are you sure you want to delete this patient? This action cannot be undone.",
      )
    ) {
      const success = deletePatient(id);
      if (success) {
        toast({
          title: "Success",
          description: "Patient deleted successfully",
        });
        navigate("/");
      } else {
        toast({
          title: "Error",
          description: "Failed to delete patient",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddVisit = () => {
    if (id) {
      // Check if required fields are filled
      if (!newVisit.date) {
        toast({
          title: "Missing Information",
          description: "Please provide a visit date",
          variant: "destructive",
        });
        return;
      }

      const visitId = addVisit(id, newVisit);
      if (visitId) {
        setIsAddingVisit(false);
        setNewVisit({
          date: new Date().toISOString().split("T")[0],
          diagnosis: "",
          prescription: "",
          notes: "",
          xrayRequired: false,
          fileData: null,
          fileName: "",
          fileType: "",
        });
        setPatient(getPatient(id));
        toast({
          title: "Success",
          description: "Visit added successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add visit",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Layout className=" bg-green-100 dark:bg-zinc-800 dark:text-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button and actions */}
        <header className="mb-8 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center hover:text-emerald-700 dark:hover:text-green-400"
          >
            <ChevronLeft size={18} />
            <span className="">Back</span>
          </button>

          <div className="flex gap-2">
            {!isEditMode && (
              <>
                <button
                  onClick={() => generatePDF(patient)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg hover:text-emerald-700 dark:hover:text-green-400"
                >
                  <Printer size={16} />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg hover:text-emerald-700 dark:hover:text-green-400"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDeletePatient}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-destructive hover:text-red-400"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </>
            )}

            {isEditMode && (
              <>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-secondary hover:text-red-400"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg dark:hover:text-green-400 hover:text-emerald-700"
                >
                  <Save size={16} />
                  <span>Save</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Patient info section */}
        <section className="mb-8">
          <div className="glass border rounded-xl p-6 shadow-subtle">
            {isEditMode ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">
                  Edit Patient Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editedData.name}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border border-gray-500 bg-transparent focus:ring-2 focus:ring-green-300 outline-none duration-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Contact</label>
                    <input
                      type="text"
                      name="contact"
                      value={editedData.contact}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border border-gray-500 bg-transparent focus:ring-2 focus:ring-green-300 outline-none duration-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={editedData.age}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border border-gray-500 bg-transparent focus:ring-2 focus:ring-green-300 outline-none duration-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Sex</label>
                    <select
                      name="sex"
                      value={editedData.sex}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border border-gray-500 bg-transparent focus:ring-2 focus:ring-green-300 outline-none duration-200"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Diagnosis</label>
                  <input
                    type="text"
                    name="diagnosis"
                    value={editedData.diagnosis}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border border-gray-500 bg-transparent focus:ring-2 focus:ring-green-300 outline-none duration-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Notes</label>
                  <textarea
                    name="notes"
                    value={editedData.notes}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border border-gray-500 bg-transparent focus:ring-2 focus:ring-green-300 outline-none duration-200 min-h-[100px] resize-y"
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex gap-4 items-center">
                    <div className="/10 p-3 rounded-lg text-primary">
                      <User size={24} />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{patient.name}</h1>
                      <div className="flex items-center gap-">
                        <span>{patient.age} years</span>
                        <span>•</span>
                        <span>{patient.sex}</span>
                        {patient.contact && (
                          <>
                            <span>•</span>
                            <span>{patient.contact}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm dark:text-green-400 text-emerald-700">
                    Patient since{" "}
                    {format(new Date(patient.createdAt), "MMM d, yyyy")}
                  </div>
                </div>

                {(patient.diagnosis || patient.notes) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    {patient.diagnosis && (
                      <div>
                        <h3 className="text-sm uppercase tracking-wide mb-1">
                          Diagnosis
                        </h3>
                        <p>{patient.diagnosis}</p>
                      </div>
                    )}

                    {patient.notes && (
                      <div>
                        <h3 className="text-sm uppercase tracking-wide mb-1">
                          Notes
                        </h3>
                        <p>{patient.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Visits section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Visits History</h2>
            {!isAddingVisit && (
              <button
                onClick={() => setIsAddingVisit(true)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg  text-primary-foreground border dark:hover:text-emerald-400 hover:text-emerald-700"
              >
                <Plus size={16} />
                <span>Add Visit</span>
              </button>
            )}
          </div>

          {/* Add Visit Form */}
          <AnimatePresence>
            {isAddingVisit && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <div className="glass border rounded-xl p-6 shadow-subtle space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">New Visit Record</h3>
                    <button
                      onClick={() => {
                        setIsAddingVisit(false);
                      }}
                      className="p- hover:text-foreground transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={newVisit.date}
                        onChange={handleNewVisitInputChange}
                        className="w-full p-3 rounded-lg border border-gray-500 bg-transparent focus:ring-2 focus:ring-green-300 outline-none duration-200"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Diagnosis</label>
                      <input
                        type="text"
                        name="diagnosis"
                        value={newVisit.diagnosis}
                        onChange={handleNewVisitInputChange}
                        className="w-full p-3 rounded-lg border border-gray-500 bg-transparent focus:ring-2 focus:ring-green-300 outline-none duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Prescription</label>
                    <textarea
                      name="prescription"
                      value={newVisit.prescription}
                      onChange={handleNewVisitInputChange}
                      className="w-full p-3 rounded-lg border border-gray-500 bg-transparent focus:ring-2 focus:ring-green-300 outline-none duration-200 min-h-[100px] resize-y"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Notes</label>
                    <textarea
                      name="notes"
                      value={newVisit.notes}
                      onChange={handleNewVisitInputChange}
                      className="w-full p-3 rounded-lg border border-gray-500 bg-transparent focus:ring-2 focus:ring-green-300 outline-none duration-200 min-h-[80px] resize-y"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      X-ray Required
                    </label>
                    <input
                      type="checkbox"
                      name="xrayRequired"
                      checked={newVisit.xrayRequired}
                      onChange={handleNewVisitInputChange}
                      className="w-4 h-4"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Upload File</label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="w-full p-3 rounded-lg border border-gray-500 bg-transparent focus:ring-2 focus:ring-green-300 outline-none duration-200"
                    />
                    {newVisit.fileName && (
                      <p className="text-s">
                        Selected file: {newVisit.fileName}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => {
                        setIsAddingVisit(false);
                      }}
                      className="px-4 py-2 rounded-lg border hover:text-red-500 "
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddVisit}
                      className="px-4 py-2 rounded-lg dark:border-white border-1 hover:bg-green-300 dark:hover:bg-green-700"
                    >
                      Save Visit
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Visit History List */}
          {patient.visits.length > 0 ? (
            <div className="space-y-4">
              {patient.visits
                .slice()
                .reverse()
                .map((visit, index) => (
                  <motion.div
                    key={visit.id}
                    className={cn("glass border rounded-xl p-5 shadow-subtle")}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg text-primary">
                          <Calendar size={20} />
                        </div>
                        <h3 className="font-medium">
                          {format(new Date(visit.date), "MMMM d, yyyy")}
                        </h3>
                      </div>

                      {visit.diagnosis && (
                        <div className="bg-secondary px-2 py-1 rounded-md text-xs font-medium">
                          {visit.diagnosis}
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {visit.prescription && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="pt-2 space-y-4"
                        >
                          <h4 className="text-sm uppercase tracking-wide mb-1">
                            Prescription
                          </h4>
                          <div className="bg-secondary/50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText
                                size={16}
                                className="text-muted-foreground"
                              />
                              <span className="font-medium">
                                Prescription Details
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-line">
                              {visit.prescription}
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {visit.notes && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="pt-2 space-y-4"
                        >
                          <h4 className="text-sm uppercase tracking-wide mb-1">
                            Notes
                          </h4>
                          <p className="text-sm">{visit.notes}</p>
                        </motion.div>
                      )}

                      {visit.fileName && (
                        <div className="pt-2">
                          <a
                            href={`/api/visits/${visit.id}/file`}
                            download={visit.fileName}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-all-medium"
                          >
                            <FileText size={16} />
                            <span>Download {visit.fileName}</span>
                          </a>
                        </div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
            </div>
          ) : (
            <div className="glass border rounded-xl p-6 shadow-subtle text-center">
              <p className="text-muted-foreground mb-4">No visit records yet</p>
              <button
                onClick={() => setIsAddingVisit(true)}
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline dark:hover:text-green-400 hover:text-emerald-700"
              >
                <Plus size={18} />
                <span>Add first visit record</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default PatientDetail;
