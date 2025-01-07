import { useState, useEffect } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { Recommendations } from "@/components/Recommendations";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState("");
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const startSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data, error } = await supabase
            .from('user_sessions')
            .insert([{ user_id: session.user.id }])
            .select()
            .single();

          if (error) throw error;
          setSessionId(data.id);
          console.log("Session started:", data.id);
        }
      } catch (error) {
        console.error("Error starting session:", error);
      }
    };

    startSession();

    return () => {
      // End session when component unmounts
      if (sessionId) {
        supabase
          .from('user_sessions')
          .update({ ended_at: new Date().toISOString() })
          .eq('id', sessionId)
          .then(({ error }) => {
            if (error) console.error("Error ending session:", error);
          });
      }
    };
  }, []);

  const logInteraction = async (type: string, feature?: string, error?: string) => {
    if (sessionId) {
      try {
        const { error: logError } = await supabase
          .from('user_interactions')
          .insert([{
            session_id: sessionId,
            interaction_type: type,
            feature_accessed: feature,
            error_message: error
          }]);

        if (logError) throw logError;
      } catch (error) {
        console.error("Error logging interaction:", error);
      }
    }
  };

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    try {
      await logInteraction('analyze_image_start', 'wound_analysis');
      const startTime = Date.now();

      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      
      const base64 = await base64Promise;
      console.log("Image converted to base64, calling Edge Function...");

      const { data, error } = await supabase.functions.invoke('analyze-wound', {
        body: { image_base64: base64 },
      });

      console.log("Edge Function response:", data, error);

      if (error) throw error;
      if (!data?.analysis) throw new Error('No analysis received');

      // Format the analysis text with proper HTML tags
      const formattedAnalysis = data.analysis
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/•\s(.*?)(?=(?:\n|$))/g, '<li>$1</li>')
        .split(/<li>/)
        .map((section, index) => {
          if (index === 0) return section;
          return section.includes('</li>') 
            ? `<ul><li>${section}</ul>` 
            : section;
        })
        .join('');

      setRecommendations(formattedAnalysis);
      
      const duration = Date.now() - startTime;
      await logInteraction('analyze_image_complete', 'wound_analysis', null);

      toast({
        title: "Analysis Complete",
        description: "Wound analysis and recommendations are ready.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      await logInteraction('analyze_image_error', 'wound_analysis', error.message);
      toast({
        title: "Analysis Failed",
        description: error.message || "There was an error analyzing the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12 px-4 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Wound Analysis
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Receive evidence-based care recommendations from our AI-powered tool, comparing wounds against validated guidelines.
            </p>
          </div>

          <div className="space-y-8">
            <ImageUpload onImageSelect={analyzeImage} />
            <Recommendations
              recommendations={recommendations}
              isLoading={isAnalyzing}
            />
          </div>

          <footer className="mt-16 text-center text-sm text-muted-foreground space-y-4">
            <p>
              This tool is for limited educational and experimental purposes only.
            </p>
            <p className="max-w-3xl mx-auto">
              This tool is intended only for the purpose of providing or supporting a recommendation to a health professional about prevention, diagnosis, curing or alleviating a disease, ailment, defect or injury. It is not intended to replace the clinical judgement of a health care professional to make a clinical diagnosis or treatment decision regarding an individual patient.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Index;
