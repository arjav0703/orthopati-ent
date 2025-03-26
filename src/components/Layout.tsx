import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Home, Search, Calendar, User, Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={20} /> },
    { path: '/search', label: 'Search', icon: <Search size={20} /> },
    { path: '/appointments', label: 'Appointments', icon: <Calendar size={20} /> },
  ];

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className={cn("px-4 sm:px-6 pb-8", className)}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
