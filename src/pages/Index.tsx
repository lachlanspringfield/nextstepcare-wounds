import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { Recommendations } from "@/components/Recommendations";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState("");
  const { toast } = useToast();

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    try {
      // Convert the image to base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      
      const base64 = await base64Promise;
      console.log("Image converted to base64, calling Edge Function...");

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('analyze-wound', {
        body: { image_base64: base64 },
      });

      console.log("Edge Function response:", data, error);

      if (error) throw error;
      if (!data?.analysis) throw new Error('No analysis received');

      setRecommendations(data.analysis);
      
      toast({
        title: "Analysis Complete",
        description: "Wound analysis and recommendations are ready.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
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
              Upload an image of a wound and receive evidence-based care recommendations. <br />
              Our AI-powered analysis compares wounds against validated guidelines to help translate current evidence into practice.
            </p>
          </div>

          <div className="space-y-8">
            <ImageUpload onImageSelect={analyzeImage} />
            <Recommendations
              recommendations={recommendations}
              isLoading={isAnalyzing}
            />
          </div>

          <footer className="mt-16 text-center text-sm text-muted-foreground">
            <p>
              This tool is for limited educational and experimental purposes only.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Index;