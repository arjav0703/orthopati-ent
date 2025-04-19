"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const medicationOptions = [
  {
    value: "Paracetamol",
    label: "Paracetamol",
  },
  {
    value: "Aspirin",
    label: "Aspirin",
  },
  {
    value: "Ibuprofen",
    label: "Ibuprofen",
  },
  {
    value: "Acetaminophen",
    label: "Acetaminophen",
  },
  {
    value: "Pantacid",
    label: "Pantacid",
  },
  {
    value: "Panadol",
    label: "Panadol",
  },
];

interface MedicationProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export default function Medication({ value, onChange }: MedicationProps) {
  const [open, setOpen] = React.useState(false);

  const toggleMedication = (medication: string) => {
    if (value.includes(medication)) {
      // Remove medication if already selected
      onChange(value.filter((item) => item !== medication));
    } else {
      // Add medication if not already selected
      onChange([...value, medication]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value.length > 0
            ? value
                .map(
                  (med) =>
                    medicationOptions.find((m) => m.value === med)?.label,
                )
                .join(", ")
            : "Select medications..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 bg-green-300 dark:bg-zinc-700 dark:text-white">
        <Command>
          <CommandInput placeholder="Search medications..." className="h-9" />
          <CommandList>
            <CommandEmpty>No medications found.</CommandEmpty>
            <CommandGroup>
              {medicationOptions.map((medication) => (
                <CommandItem
                  key={medication.value}
                  value={medication.value}
                  onSelect={() => toggleMedication(medication.value)}
                >
                  {medication.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value.includes(medication.value)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
