import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';

interface PatientCardProps {
  id: string;
  name: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  lastVisit?: string;
  diagnosis?: string;
  priority?: 'low' | 'medium' | 'high';
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
  priority = 'low',
  className,
  index = 0
}) => {
  const priorityColors = {
    low: 'bg-green-500/10 text-green-500',
    medium: 'bg-yellow-500/10 text-yellow-500',
    high: 'bg-red-500/10 text-red-500'
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <motion.div
      className={cn(
        "group relative rounded-lg border bg-card p-4 transition-all hover:shadow-md",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link to={`/patient/${id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View patient details</span>
      </Link>

      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{name}</h3>
            <Badge variant="outline" className={cn("text-xs", priorityColors[priority])}>
              {priority}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
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
            <p className="text-sm line-clamp-1 text-muted-foreground">
              {diagnosis}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PatientCard;
