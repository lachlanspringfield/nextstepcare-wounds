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

  const processText = (text: string) => {
    if (!text) return '';
    
    return text.split('\n').map(line => {
      // Handle headings (###)
      if (line.startsWith('### ')) {
        return `<h3 class="text-xl font-serif font-semibold mt-6 mb-3">${line.replace('### ', '')}</h3>`;
      }
      
      // Handle bullet points
      if (line.trim().startsWith('-')) {
        return `<p class="mb-2 pl-4">• ${line.trim().substring(1)}</p>`;
      }
      
      // Handle bold text (**text**)
      let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      return `<p class="mb-2">${processedLine}</p>`;
    }).join('');
  };

  const handleDownload = async () => {
    console.log("Starting PDF generation process...");
    
    try {
      if (!recommendations) {
        console.error("No recommendations available");
        throw new Error("No recommendations available to generate PDF");
      }

      // Create a temporary container
      const element = document.createElement('div');
      element.style.padding = '20px';
      element.style.background = '#ffffff';
      element.style.width = '180mm'; // Reduced from 210mm to ensure content fits
      element.style.margin = '0 auto'; // Center the content
      
      console.log("Processing content for PDF...");
      
      // Process content with explicit styling
      const processedContent = recommendations.split('\n').map(line => {
        if (line.startsWith('### ')) {
          return `<h3 style="color: #000000; font-size: 20px; font-weight: bold; margin: 20px 0 12px 0; font-family: 'Times New Roman', serif;">${line.replace('### ', '')}</h3>`;
        }
        if (line.trim().startsWith('-')) {
          return `<p style="color: #000000; margin: 8px 0 8px 20px; font-family: 'Times New Roman', serif; line-height: 1.5;">• ${line.trim().substring(1)}</p>`;
        }
        let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return `<p style="color: #000000; margin: 8px 0; font-family: 'Times New Roman', serif; line-height: 1.5;">${processedLine}</p>`;
      }).join('');

      element.innerHTML = `
        <div style="font-family: 'Times New Roman', serif; color: #000000; max-width: 160mm; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 20px; width: 100%;">
            <h1 style="color: #000000; font-size: 24px; margin: 0 auto; font-family: 'Times New Roman', serif;">Next Step AI</h1>
            <p style="color: #666666; font-size: 14px; margin: 5px auto 0; font-family: 'Times New Roman', serif;">Wound Care Recommendations</p>
          </div>
          
          <div style="margin: 20px 0;">
            ${processedContent}
          </div>
          
          <div style="text-align: center; font-size: 12px; color: #666666; margin-top: 20px; border-top: 1px solid #eeeeee; padding-top: 10px;">
            <p style="font-size: 10px; color: #666666; margin-top: 20px; text-align: justify; font-family: 'Times New Roman', serif;">
              This tool is intended only for the purpose of providing or supporting a recommendation to a health professional about prevention, diagnosis, curing or alleviating a disease, ailment, defect or injury. It is not intended to replace the clinical judgement of a health care professional to make a clinical diagnosis or treatment decision regarding an individual patient.
            </p>
          </div>
        </div>
      `;

      console.log("HTML content prepared:", element.innerHTML);

      // Configure PDF options
      const opt = {
        margin: [15, 15, 15, 15], // Adjusted margins [top, right, bottom, left]
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

  return (
    <Card className="w-full max-w-xl mx-auto p-6 mt-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-serif font-semibold">Wound Care Recommendations</h3>
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
        className="prose max-w-none font-serif"
        dangerouslySetInnerHTML={{ __html: processText(recommendations) }}
      />
    </Card>
  );
};