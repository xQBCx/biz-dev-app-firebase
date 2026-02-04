import { useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Copy, Download, Check, Menu, X, FileText, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Navigation from "@/components/Navigation";
import WhitePaperNav from "@/components/whitepaper/WhitePaperNav";
import QBCModule from "@/components/whitepaper/modules/QBCModule";
import MESH34Module from "@/components/whitepaper/modules/MESH34Module";
import LUXKEYModule from "@/components/whitepaper/modules/LUXKEYModule";
import EarthPulseModule from "@/components/whitepaper/modules/EarthPulseModule";
import FractalPulseModule from "@/components/whitepaper/modules/FractalPulseModule";
import BridgeModule from "@/components/whitepaper/modules/BridgeModule";
import DoctrineModule from "@/components/whitepaper/modules/DoctrineModule";
import LEXIEModule from "@/components/whitepaper/modules/LEXIEModule";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const WhitePaper = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const moduleParam = searchParams.get("module");
  const [activeModule, setActiveModule] = useState<string | null>(moduleParam);
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const plainTextRef = useRef<HTMLDivElement>(null);

  const handleModuleChange = (module: string | null) => {
    setActiveModule(module);
    if (module) {
      setSearchParams({ module });
    } else {
      setSearchParams({});
    }
    setMobileNavOpen(false);
  };

  const handleCopy = async () => {
    if (!contentRef.current) return;
    const text = contentRef.current.innerText;
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success("Content copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadColorPdf = async () => {
    if (!contentRef.current) return;
    setIsGeneratingPdf(true);
    toast.info("Generating full-color PDF...");

    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#0a0a0f",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      const fileName = activeModule 
        ? `QBC-WhitePaper-${activeModule.toUpperCase()}-COLOR.pdf`
        : "QBC-Master-WhitePaper-COLOR.pdf";
      pdf.save(fileName);
      toast.success("Full-color PDF downloaded successfully");
    } catch (error) {
      toast.error("Failed to generate PDF");
      console.error(error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPlainTextPdf = async () => {
    if (!contentRef.current) return;
    setIsGeneratingPdf(true);
    toast.info("Generating plain text PDF...");

    try {
      const text = contentRef.current.innerText;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      const lineHeight = 5;
      let y = margin;

      // Header
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("QUANTUM BIT CODE", margin, y);
      y += 8;

      pdf.setFontSize(14);
      pdf.text(getTitle(), margin, y);
      y += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, y);
      pdf.text("Classification: UNCLASSIFIED // FOUO", margin + 60, y);
      y += 10;

      // Divider line
      pdf.setDrawColor(100, 100, 100);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Content
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      
      const lines = text.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (!trimmedLine) {
          y += lineHeight / 2;
          continue;
        }

        // Check for headers (all caps or specific patterns)
        const isHeader = trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 3 && trimmedLine.length < 60;
        const isModuleHeader = trimmedLine.startsWith("Module") || /^[A-Z]{2,}:/.test(trimmedLine);
        
        if (isHeader || isModuleHeader) {
          y += 5;
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(11);
        } else {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
        }

        const splitLines = pdf.splitTextToSize(trimmedLine, maxWidth);
        
        for (const splitLine of splitLines) {
          if (y > pageHeight - margin) {
            pdf.addPage();
            y = margin;
          }
          pdf.text(splitLine, margin, y);
          y += lineHeight;
        }

        if (isHeader || isModuleHeader) {
          y += 2;
        }
      }

      // Footer on each page
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          `© ${new Date().getFullYear()} Quantum Bit Code | Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      const fileName = activeModule 
        ? `QBC-WhitePaper-${activeModule.toUpperCase()}-PLAINTEXT.pdf`
        : "QBC-Master-WhitePaper-PLAINTEXT.pdf";
      pdf.save(fileName);
      toast.success("Plain text PDF downloaded successfully");
    } catch (error) {
      toast.error("Failed to generate PDF");
      console.error(error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getTitle = () => {
    if (!activeModule) return "Master White Paper";
    const titles: Record<string, string> = {
      qbc: "QBC Encoding",
      mesh34: "MESH 34 Transport",
      luxkey: "LUXKEY Identity",
      earthpulse: "EarthPulse Intelligence",
      fractalpulse: "FractalPulse Authentication",
      bridge: "Quantum-Classical Bridge",
      doctrine: "Signal Sovereignty Doctrine",
      lexie: "LEXIE Intelligence Platform",
    };
    return titles[activeModule] || "White Paper";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-border bg-card/50 min-h-[calc(100vh-4rem)] sticky top-16">
          <div className="p-4">
            <WhitePaperNav activeModule={activeModule} onModuleChange={handleModuleChange} />
          </div>
        </aside>

        {/* Mobile Nav Toggle */}
        <div className="lg:hidden fixed bottom-4 left-4 z-50">
          <Button
            variant="default"
            size="icon"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="rounded-full shadow-lg"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Nav Overlay */}
        {mobileNavOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm pt-20 px-4">
            <WhitePaperNav activeModule={activeModule} onModuleChange={handleModuleChange} />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="container max-w-4xl py-4 px-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-primary uppercase tracking-wider">
                  Quantum Bit Code
                </p>
                <h1 className="text-xl font-display font-bold text-foreground">
                  {getTitle()}
                </h1>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isCopied ? "Copied" : "Copy"}</span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      disabled={isGeneratingPdf}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">{isGeneratingPdf ? "Generating..." : "Download PDF"}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border">
                    <DropdownMenuItem 
                      onClick={handleDownloadColorPdf}
                      className="gap-3 cursor-pointer"
                    >
                      <Palette className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium">Full Color Design</p>
                        <p className="text-xs text-muted-foreground">Rich visuals, larger file size</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleDownloadPlainTextPdf}
                      className="gap-3 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Plain Text</p>
                        <p className="text-xs text-muted-foreground">Black & white, smaller file size</p>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className="container max-w-4xl py-8 px-6">
            <div ref={contentRef} className="prose prose-invert max-w-none">
              {!activeModule && (
                <>
                  {/* Cover Page for Complete Document */}
                  <div className="text-center mb-16 pb-16 border-b border-border">
                    <p className="text-primary font-mono text-sm tracking-widest uppercase mb-4">
                      Quantum Bit Code
                    </p>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
                      Signal Sovereignty
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-display text-muted-foreground mb-8">
                      The Post-Quantum Doctrine
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      A comprehensive technical framework for achieving absolute control over 
                      information pathways in an era of quantum-capable adversaries.
                    </p>
                    <div className="mt-8 flex justify-center gap-4 text-sm text-muted-foreground">
                      <span>Version 2.0</span>
                      <span>•</span>
                      <span>UNCLASSIFIED // FOUO</span>
                    </div>
                  </div>
                  
                  <QBCModule />
                  <hr className="my-16 border-border" />
                  <MESH34Module />
                  <hr className="my-16 border-border" />
                  <LUXKEYModule />
                  <hr className="my-16 border-border" />
                  <EarthPulseModule />
                  <hr className="my-16 border-border" />
                  <FractalPulseModule />
                  <hr className="my-16 border-border" />
                  <BridgeModule />
                  <hr className="my-16 border-border" />
                  <DoctrineModule />
                  <hr className="my-16 border-border" />
                  <LEXIEModule />
                </>
              )}

              {activeModule === "qbc" && <QBCModule />}
              {activeModule === "mesh34" && <MESH34Module />}
              {activeModule === "luxkey" && <LUXKEYModule />}
              {activeModule === "earthpulse" && <EarthPulseModule />}
              {activeModule === "fractalpulse" && <FractalPulseModule />}
              {activeModule === "bridge" && <BridgeModule />}
              {activeModule === "doctrine" && <DoctrineModule />}
              {activeModule === "lexie" && <LEXIEModule />}
            </div>

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-border text-center text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} Quantum Bit Code. All rights reserved.</p>
              <p className="mt-2">Contact: bill@quantumbitcode.com</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WhitePaper;