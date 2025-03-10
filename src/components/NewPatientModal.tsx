import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { X, Camera } from "lucide-react";

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PatientFormData) => void;
}

interface PatientFormData {
  name: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  contact: string;
  diagnosis?: string;
  notes?: string;
  prescriptionImages?: string[];
}

const NewPatientModal = ({ isOpen, onClose, onSave }: NewPatientModalProps) => {
  const { toast } = useToast();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    age: 0,
    sex: 'Male',
    contact: '',
    diagnosis: '',
    notes: '',
    prescriptionImages: [],
  });

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
    
    setFormData({
      name: '',
      age: 0,
      sex: 'Male',
      contact: '',
      diagnosis: '',
      notes: '',
      prescriptionImages: [],
    });
    
    onClose();
  };

  // Add camera capture handler
  const handleCameraCapture = () => {
    // Simulate camera capture with a base64 image
    const simulatedImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM4ODgiPlByZXNjcmlwdGlvbiBJbWFnZTwvdGV4dD48L3N2Zz4=";
    
    setFormData(prev => ({
      ...prev,
      prescriptionImages: [...(prev.prescriptionImages || []), simulatedImage]
    }));
    setIsCameraActive(false);
    
    toast({
      title: "Image Captured",
      description: "Prescription image has been added",
    });
  };

  // Add image removal handler
  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prescriptionImages: prev.prescriptionImages?.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, age: Number(e.target.value) }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sex">Sex *</Label>
              <Select
                value={formData.sex}
                onValueChange={(value) => setFormData(prev => ({ ...prev, sex: value as 'Male' | 'Female' | 'Other' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact Number *</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Initial Diagnosis</Label>
            <Input
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>

          {/* Add Prescription Images section */}
          <div className="space-y-2">
            <Label>Prescription Images</Label>
            <div className="flex flex-wrap gap-3">
              {formData.prescriptionImages?.map((img, idx) => (
                <div 
                  key={idx} 
                  className="relative w-24 h-24 rounded-lg border overflow-hidden"
                >
                  <img 
                    src={img} 
                    alt={`Prescription ${idx + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-background/80 rounded-full hover:bg-background transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              {isCameraActive ? (
                <div className="w-full rounded-lg border p-4">
                  <div className="bg-muted h-[200px] mb-3 rounded-lg flex items-center justify-center">
                    <div className="text-muted-foreground">Camera Preview</div>
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button
                      type="button"
                      onClick={handleCameraCapture}
                    >
                      Capture
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCameraActive(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-24 h-24 flex flex-col items-center justify-center gap-1"
                  onClick={() => setIsCameraActive(true)}
                >
                  <Camera size={20} />
                  <span className="text-xs">Add Image</span>
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Save Patient</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewPatientModal;
