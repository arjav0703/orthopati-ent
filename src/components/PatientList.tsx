import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import PatientCard from './PatientCard';
import { Patient } from '@/utils/patientStore';

interface PatientListProps {
  patients: Patient[];
  containerClassName?: string;
}

const PatientList: React.FC<PatientListProps> = ({ patients, containerClassName }) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: patients.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated height of each patient card
    overscan: 5
  });

  return (
    <div
      ref={parentRef}
      className={containerClassName}
      style={{
        height: '100%',
        overflow: 'auto'
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const patient = patients[virtualItem.index];
          return (
            <div
              key={patient.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`
              }}
            >
              <PatientCard
                id={patient.id}
                name={patient.name}
                age={patient.age}
                sex={patient.sex}
                diagnosis={patient.diagnosis}
                lastVisit={patient.visits.length > 0 ? 
                  new Date(patient.visits[patient.visits.length - 1].date).toLocaleDateString() : 
                  new Date(patient.createdAt).toLocaleDateString()
                }
                index={virtualItem.index}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PatientList; 