import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";

interface AdminMetrics {
  session_id: string;
  started_at: string;
  ended_at: string | null;
  total_interactions: number;
  features_used: string;
  error_count: number;
}

const Admin = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['adminMetrics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_metrics');
      if (error) throw error;
      return data as AdminMetrics[];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  const chartData = metrics?.map(session => ({
    date: format(new Date(session.started_at), 'MM/dd'),
    interactions: session.total_interactions,
    errors: session.error_count
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Sessions</h3>
            <p className="text-3xl font-bold">{metrics?.length || 0}</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Interactions</h3>
            <p className="text-3xl font-bold">
              {metrics?.reduce((sum, session) => sum + session.total_interactions, 0) || 0}
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Errors</h3>
            <p className="text-3xl font-bold">
              {metrics?.reduce((sum, session) => sum + session.error_count, 0) || 0}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Interactions Over Time</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="interactions" fill="#0284c7" name="Interactions" />
                <Bar dataKey="errors" fill="#ef4444" name="Errors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Admin;