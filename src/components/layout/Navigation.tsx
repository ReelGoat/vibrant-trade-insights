
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, BookOpen, Target, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client'; 
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const NavLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
    <Link to={to} className="w-full">
      <Button 
        variant={isActive(to) ? "default" : "ghost"} 
        className="w-full justify-start"
      >
        {icon}
        <span className="ml-2">{label}</span>
      </Button>
    </Link>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full bg-background border-t border-border md:w-64 md:top-0 md:bottom-0 md:border-r md:border-t-0">
      <div className="flex flex-row md:flex-col h-16 md:h-full p-2 md:p-4 md:pt-8 gap-2">
        <NavLink to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
        <NavLink to="/history" icon={<History size={18} />} label="History" />
        <NavLink to="/trades" icon={<BookOpen size={18} />} label="Trades" />
        <NavLink to="/setups" icon={<Target size={18} />} label="Setups" />
        <NavLink to="/rules" icon={<Shield size={18} />} label="Rules" />
        
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100/10 md:mt-auto"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span className="ml-2">Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default Navigation;
