
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface PatientCardProps {
  id: string;
  name: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  lastVisit?: string;
  diagnosis?: string;
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
  className,
  index = 0
}) => {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl glass p-5 shadow-subtle transition-all duration-300 hover:shadow-glass-hover border",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/patient/${id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View {name}'s profile</span>
      </Link>
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <User size={22} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span>{age} yrs</span>
              <span>•</span>
              <span>{sex}</span>
            </div>
          </div>
        </div>
      </div>
      
      {lastVisit && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Calendar size={14} />
          <span>Last visit: {lastVisit}</span>
        </div>
      )}
      
      {diagnosis && (
        <div>
          <div className="inline-block bg-secondary px-2 py-1 rounded-md text-xs font-medium">
            Diagnosis
          </div>
          <p className="mt-1 text-sm line-clamp-2">{diagnosis}</p>
        </div>
      )}
    </motion.div>
  );
};

export default PatientCard;
