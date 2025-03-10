
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Home, Search, Calendar, User, Menu } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top header */}
      <header className="flex justify-between items-center p-4 border-b glass shadow-subtle">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-full hover:bg-secondary transition-all-medium"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-xl font-medium">
            OrthoPatient
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-secondary transition-all-medium">
            <User size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          className={cn(
            "h-full border-r glass shadow-subtle z-10",
            "md:max-w-[250px] md:flex md:flex-col",
            isSidebarOpen ? "w-64" : "w-0 md:w-16",
            "transition-all duration-300 ease-in-out"
          )}
        >
          <div className="p-4 flex flex-col gap-4 h-full">
            <div className="space-y-2 mt-4">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-all-medium",
                    location.pathname === item.path 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-secondary/80"
                  )}
                >
                  <span>{item.icon}</span>
                  <span className={cn(
                    "whitespace-nowrap",
                    !isSidebarOpen && "md:hidden"
                  )}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </motion.aside>

        {/* Main content */}
        <motion.main 
          className="flex-1 overflow-auto p-6"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;
