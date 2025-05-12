
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, FileText, Settings, ListChecks } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'History', path: '/history', icon: History },
    { name: 'Trades', path: '/trades', icon: FileText },
    { name: 'Setups', path: '/setups', icon: Settings },
    { name: 'Rules', path: '/rules', icon: ListChecks },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-background border-t border-border py-2 px-4 z-10">
      <div className="max-w-lg mx-auto flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = 
            (item.path === '/' && currentPath === '/') || 
            (item.path !== '/' && currentPath.startsWith(item.path));
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center p-1 ${
                isActive
                  ? 'text-profit'
                  : 'text-muted-foreground hover:text-foreground'
              } transition-colors`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
