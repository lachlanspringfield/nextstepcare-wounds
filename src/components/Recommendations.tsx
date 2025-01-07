import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2pdf from "html2pdf.js";
import { useToast } from "@/hooks/use-toast";

interface RecommendationsProps {
  recommendations: string;
  isLoading: boolean;
}

export const Recommendations = ({ recommendations, isLoading }: RecommendationsProps) => {
  const { toast } = useToast();

  const handleDownload = async () => {
    console.log("Starting PDF generation process...");
    console.log("Recommendations content:", recommendations);
    
    try {
      if (!recommendations) {
        console.error("No recommendations available");
        throw new Error("No recommendations available to generate PDF");
      }

      // Create a temporary container
      const element = document.createElement('div');
      element.style.padding = '20px';
      element.style.background = '#ffffff';
      element.style.width = '210mm'; // A4 width
      
      console.log("Processing content for PDF...");
      
      // Process content with explicit styling
      const processedContent = recommendations.split('\n').map(line => {
        if (line.startsWith('### ')) {
          return `<h3 style="color: #000000; font-size: 18px; font-weight: bold; margin: 16px 0 8px 0; font-family: Arial, sans-serif;">${line.replace('### ', '')}</h3>`;
        }
        return `<p style="color: #000000; margin: 8px 0; font-family: Arial, sans-serif; line-height: 1.5;">${line}</p>`;
      }).join('');

      element.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #000000;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #000000; font-size: 24px; margin: 0; font-family: Arial, sans-serif;">Next Step AI</h1>
            <p style="color: #666666; font-size: 14px; margin: 5px 0 0 0; font-family: Arial, sans-serif;">Wound Care Recommendations</p>
          </div>
          
          <div style="margin: 20px 0;">
            ${processedContent}
          </div>
          
          <div style="text-align: center; font-size: 12px; color: #666666; margin-top: 20px; border-top: 1px solid #eeeeee; padding-top: 10px;">
            <p style="font-size: 10px; color: #666666; margin-top: 20px; text-align: justify; font-family: Arial, sans-serif;">
              This tool is intended only for the purpose of providing or supporting a recommendation to a health professional about prevention, diagnosis, curing or alleviating a disease, ailment, defect or injury. It is not intended to replace the clinical judgement of a health care professional to make a clinical diagnosis or treatment decision regarding an individual patient.
            </p>
          </div>
        </div>
      `;

      console.log("HTML content prepared:", element.innerHTML);

      // Configure PDF options
      const opt = {
        margin: 10,
        filename: 'wound-care-recommendations.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      };

      console.log("PDF generation options:", opt);

      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your PDF...",
      });

      // Generate PDF with Promise chain for better error handling
      await html2pdf()
        .from(element)
        .set(opt)
        .save()
        .then(() => {
          console.log("PDF generation completed successfully");
          toast({
            title: "Success",
            description: "PDF has been generated and should start downloading.",
          });
        })
        .catch((error) => {
          console.error("Error in PDF generation promise chain:", error);
          throw error;
        });

    } catch (error) {
      console.error("Detailed error in PDF generation:", error);
      
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-xl mx-auto p-6 mt-6 animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
      </Card>
    );
  }

  if (!recommendations) return null;

  // Process markdown-style headings for display
  const processedRecommendations = recommendations.split('\n').map(line => {
    if (line.startsWith('### ')) {
      return `<h3 class="text-lg font-semibold mt-4 mb-2">${line.replace('### ', '')}</h3>`;
    }
    return `<p class="mb-2">${line}</p>`;
  }).join('');

  return (
    <Card className="w-full max-w-xl mx-auto p-6 mt-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">Wound Care Recommendations</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: processedRecommendations }}
      />
    </Card>
  );
};