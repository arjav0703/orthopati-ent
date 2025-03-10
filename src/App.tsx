
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PatientProvider } from "./utils/patientStore";
import { useEffect, useState } from "react";
import { initDatabase } from "./utils/database";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Appointments from "./pages/Appointments";
import PatientDetail from "./pages/PatientDetail";
import NotFound from "./pages/NotFound";
import { toast } from "./components/ui/use-toast";

const queryClient = new QueryClient();

const App = () => {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        const result = await initDatabase();
        setDbInitialized(result);
        
        if (result) {
          toast({
            title: "Database connected",
            description: "Successfully connected to MySQL database",
          });
        } else {
          toast({
            title: "Database connection failed",
            description: "Using local storage as fallback",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Database initialization error:", error);
        toast({
          title: "Database connection failed",
          description: "Using local storage as fallback",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">Connecting to database...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PatientProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<Search />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/patient/:id" element={<PatientDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PatientProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
