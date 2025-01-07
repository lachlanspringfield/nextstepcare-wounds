import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2pdf from "html2pdf.js";
import { format } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

interface RecommendationsProps {
  recommendations: string;
  isLoading: boolean;
}

export const Recommendations = ({ recommendations, isLoading }: RecommendationsProps) => {
  const handleDownload = () => {
    console.log("Starting PDF generation...");
    
    // Create a temporary container
    const element = document.createElement('div');
    
    // Convert current time to Sydney timezone
    const sydneyTime = fromZonedTime(new Date(), 'Australia/Sydney');
    const timestamp = format(sydneyTime, 'dd/MM/yyyy HH:mm (AEST)');
    
    // Process markdown-style headings
    const processedContent = recommendations.split('\n').map(line => {
      if (line.startsWith('### ')) {
        return `<h3 style="font-size: 18px; font-weight: bold; margin: 16px 0 8px 0; color: #000000;">${line.replace('### ', '')}</h3>`;
      }
      return `<p style="margin: 8px 0; color: #000000;">${line}</p>`;
    }).join('');

    // Set the HTML content
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #000000;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #000000; font-size: 24px; margin: 0;">Next Step AI</h1>
          <p style="color: #666666; font-size: 14px; margin: 5px 0 0 0;">Wound Care Recommendations</p>
        </div>
        
        <div style="margin: 20px 0;">
          ${processedContent}
        </div>
        
        <div style="text-align: center; font-size: 12px; color: #666666; margin-top: 20px; border-top: 1px solid #eeeeee; padding-top: 10px;">
          <p style="margin: 0;">Generated on: ${timestamp}</p>
          <p style="font-size: 10px; color: #666666; margin-top: 20px; text-align: justify;">
            This tool is intended only for the purpose of providing or supporting a recommendation to a health professional about prevention, diagnosis, curing or alleviating a disease, ailment, defect or injury. It is not intended to replace the clinical judgement of a health care professional to make a clinical diagnosis or treatment decision regarding an individual patient.
          </p>
        </div>
      </div>
    `;

    // Configure PDF options
    const opt = {
      margin: 1,
      filename: 'wound-care-recommendations.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: true
      },
      jsPDF: { 
        unit: 'cm', 
        format: 'a4', 
        orientation: 'portrait'
      }
    };

    // Generate PDF with logging
    console.log("Generating PDF with options:", opt);
    html2pdf().set(opt).from(element).save()
      .then(() => {
        console.log("PDF generated successfully");
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
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