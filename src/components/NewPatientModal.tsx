import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { X } from "lucide-react";

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PatientFormData) => void;
}

interface PatientFormData {
  name: string;
  age: number;
  sex: "Male" | "Female" | "Other";
  contact: string;
  diagnosis?: string;
  notes?: string;
}

const NewPatientModal = ({ isOpen, onClose, onSave }: NewPatientModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    age: 0,
    sex: "Male",
    contact: "",
    diagnosis: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.age || !formData.sex) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
    toast({
      title: "Success",
      description: "Patient information saved successfully",
    });

    setFormData({
      name: "",
      age: 0,
      sex: "Male",
      contact: "",
      diagnosis: "",
      notes: "",
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] dark:text-white dark:bg-black bg-white">
        <DialogHeader>
          <DialogTitle className="text-green-600 dark:text-green-200">
            Add New Patient
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              className="dark:bg-zinc-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    age: Number(e.target.value),
                  }))
                }
                required
                className="dark:bg-zinc-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sex">Sex *</Label>
              <Select
                value={formData.sex}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    sex: value as "Male" | "Female" | "Other",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder="Select sex"
                    className="dark:bg-zinc-800 dark:text-white"
                  />
                </SelectTrigger>
                <SelectContent
                  className="dark:bg-zinc-800 dark:text-white
                  "
                >
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact Number</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, contact: e.target.value }))
              }
              className="dark:bg-zinc-800"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, diagnosis: e.target.value }))
              }
              className="dark:bg-zinc-800"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Patient history</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="min-h-[100px] dark:bg-zinc-800"
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="border bg-green-700 hover:brightness-125"
            >
              Save Patient
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewPatientModal;
