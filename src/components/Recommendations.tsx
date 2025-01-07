import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2pdf from "html2pdf.js";

interface RecommendationsProps {
  recommendations: string;
  isLoading: boolean;
}

export const Recommendations = ({ recommendations, isLoading }: RecommendationsProps) => {
  const handleDownload = () => {
    const element = document.getElementById('recommendations');
    const timestamp = new Date().toLocaleString();
    
    // Create header and footer elements
    const header = document.createElement('div');
    header.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #000; font-size: 24px; margin: 0;">Wound Care Assistant</h1>
        <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">Analysis Report</p>
      </div>
    `;
    
    const footer = document.createElement('div');
    footer.innerHTML = `
      <div style="text-align: center; font-size: 12px; color: #666; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
        Generated on: ${timestamp}
      </div>
    `;
    
    // Temporarily add header and footer to the recommendations div
    const content = document.getElementById('recommendations');
    content?.insertBefore(header, content.firstChild);
    content?.appendChild(footer);
    
    const opt = {
      margin: [0.75, 0.75, 0.75, 0.75],
      filename: 'wound-care-recommendations.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait'
      },
      pagebreak: { mode: 'avoid-all' }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
      // Remove the temporary header and footer after PDF generation
      content?.removeChild(header);
      content?.removeChild(footer);
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

  return (
    <Card className="w-full max-w-xl mx-auto p-6 mt-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">Wound Care Recommendations</h3>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>
      <div id="recommendations" className="prose max-w-none text-black bg-white">
        <div 
          className="whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: recommendations }}
        />
      </div>
    </Card>
  );
};