import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Header = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(data?.is_admin || false);
      }
    };

    checkAdminStatus();
  }, []);

  return (
    <header className="w-full border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-serif flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Next Step AI
        </Link>
        {isAdmin && (
          <Link 
            to="/admin" 
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Admin Dashboard
          </Link>
        )}
      </div>
    </header>
  );
};