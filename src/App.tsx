import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PatientProvider } from "./utils/patientStore";
import { useEffect, useState } from "react";
import { toast } from "./components/ui/use-toast";
import Index from "./pages/Index";
import Search from "./pages/Search";
import PatientDetail from "./pages/PatientDetail";
import NotFound from "./pages/NotFound";
import { Spinner } from "@/components/ui/spinner";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the server is reachable
    const checkServerConnection = async () => {
      try {
        const response = await fetch("/api/patients");
        if (response.ok) {
          toast({
            title: "Connected to server",
            description: "Successfully connected to the API server",
          });
        } else {
          toast({
            title: "Server connection issue",
            description: "Using local storage as fallback",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Server connection error:", error);
        toast({
          title: "Server connection failed",
          description: "Using local storage as fallback",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkServerConnection();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg font-medium">Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PatientProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<Search />} />
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
