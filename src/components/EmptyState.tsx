import * as React from "react";
import { LucideIcon } from "lucide-react"; // Assuming you are using lucide-react for icons

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center text-center space-y-4">
    <Icon size={48} className="text-muted-foreground" />
    <h3 className="text-lg font-medium">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default EmptyState; 