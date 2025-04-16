import React from "react";
import { motion } from "framer-motion";
import { Calendar, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface PatientCardProps {
  id: string;
  name: string;
  age: number;
  sex: "Male" | "Female" | "Other";
  lastVisit?: string;
  diagnosis?: string;
  xrayRequired?: boolean;
  className?: string;
  index?: number;
}

const PatientCard: React.FC<PatientCardProps> = ({
  id,
  name,
  age,
  sex,
  lastVisit,
  diagnosis,
  xrayRequired,
  className,
  index = 0,
}) => {
  return (
    <motion.div
      className={cn(
        "group relative rounded-lg border dark:border-zinc-500 bg-card p-3 sm:p-4 transition-all hover:shadow-md text-zinc-800 dark:text-zinc-300",
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link to={`/patient/${id}`} className="absolute">
        <span className="sr-only">View patient details</span>
      </Link>

      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm sm:text-base text-black dark:text-white">
              {name}
            </h3>
          </div>

          <div className="flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User size={12} />
              {age} yrs • {sex}
            </span>
            {lastVisit && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                Last: {lastVisit}
              </span>
            )}
          </div>

          {diagnosis && (
            <p className="text-xs sm:text-sm line-clamp-1 text-muted-foreground">
              {diagnosis}
            </p>
          )}
        </div>
        {xrayRequired && (
          <span className="px-2 py-0.5 sm:py-1 text-xs font-medium text-white bg-blue-500 rounded-full whitespace-nowrap">
            X-ray
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default PatientCard;
