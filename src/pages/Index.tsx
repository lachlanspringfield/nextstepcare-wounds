import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { Recommendations } from "@/components/Recommendations";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState("");
  const { toast } = useToast();

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    try {
      // TODO: Implement OpenAI API integration
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 2000));
      setRecommendations(
        "Based on the image analysis, here are the recommended wound care steps:\n\n" +
        "1. Clean the wound area with sterile saline solution\n" +
        "2. Apply appropriate dressing based on wound characteristics\n" +
        "3. Monitor for signs of infection\n" +
        "4. Change dressing as recommended\n\n" +
        "Please consult a healthcare professional for personalized medical advice."
      );
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Wound Care Assistant
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload an image of a wound and receive evidence-based care recommendations. <br></br>
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
    </div>
  );
};

export default Index;
