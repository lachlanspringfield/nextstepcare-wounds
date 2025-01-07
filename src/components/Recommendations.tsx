import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import html2pdf from "html2pdf.js";
import { format } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

interface RecommendationsProps {
  recommendations: string;
  isLoading: boolean;
}

export const Recommendations = ({ recommendations, isLoading }: RecommendationsProps) => {
  const handleDownload = () => {
    const element = document.getElementById('recommendations');
    
    // Convert current time to Sydney timezone
    const sydneyTime = fromZonedTime(new Date(), 'Australia/Sydney');
    const timestamp = format(sydneyTime, 'dd/MM/yyyy HH:mm (AEST)');
    
    // Create header and footer elements
    const header = document.createElement('div');
    header.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
            <path d="M16 13H8"/>
            <path d="M16 17H8"/>
            <path d="M10 9H8"/>
          </svg>
          <h1 style="color: #000; font-size: 24px; margin: 0; font-family: 'DM Serif Text', serif;">Next Step AI</h1>
        </div>
        <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">Analysis Report</p>
      </div>
    `;
    
    const footer = document.createElement('div');
    footer.innerHTML = `
      <div style="text-align: center; font-size: 12px; color: #666; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
        <p style="margin-bottom: 10px;">Generated on: ${timestamp}</p>
        <p style="font-size: 10px; color: #666; margin-top: 20px; text-align: justify;">
          This tool is intended only for the purpose of providing or supporting a recommendation to a health professional about prevention, diagnosis, curing or alleviating a disease, ailment, defect or injury. It is not intended to replace the clinical judgement of a health care professional to make a clinical diagnosis or treatment decision regarding an individual patient.
        </p>
      </div>
    `;
    
    // Process markdown-style headings in recommendations
    const processedRecommendations = recommendations.replace(/###\s*(.*?)(\n|$)/g, '<h3 style="font-size: 18px; font-weight: bold; margin: 16px 0 8px 0;">$1</h3>');
    
    // Temporarily add header and footer to the recommendations div
    const content = document.getElementById('recommendations');
    if (content) {
      content.innerHTML = header.innerHTML + 
        '<div style="margin: 20px 0;">' + processedRecommendations + '</div>' + 
        footer.innerHTML;
    }
    
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
      // Restore original content after PDF generation
      if (content) {
        content.innerHTML = `<div class="whitespace-pre-wrap">${processedRecommendations}</div>`;
      }
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
  const processedRecommendations = recommendations.replace(
    /###\s*(.*?)(\n|$)/g, 
    '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>'
  );

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
          dangerouslySetInnerHTML={{ __html: processedRecommendations }}
        />
      </div>
    </Card>
  );
};