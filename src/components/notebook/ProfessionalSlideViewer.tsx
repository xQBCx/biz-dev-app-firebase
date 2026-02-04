import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Download,
  Play,
  Pause,
  SkipBack,
  SkipForward
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Slide {
  title: string;
  bullets?: string[];
  speakerNotes?: string;
  layout?: "title" | "content" | "two-column" | "image" | "quote" | "stats";
  subtitle?: string;
  keyMessage?: string;
  stats?: { label: string; value: string }[];
}

interface ProfessionalSlideViewerProps {
  slides: Slide[];
  title?: string;
}

export function ProfessionalSlideViewer({ slides, title }: ProfessionalSlideViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const currentSlide = slides[currentIndex];
  const totalSlides = slides.length;
  const progress = ((currentIndex + 1) / totalSlides) * 100;

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(totalSlides - 1, prev + 1));
  }, [totalSlides]);

  const goToFirst = () => setCurrentIndex(0);
  const goToLast = () => setCurrentIndex(totalSlides - 1);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
    if (e.key === "Escape") setIsFullscreen(false);
    if (e.key === "Home") goToFirst();
    if (e.key === "End") goToLast();
    if (e.key === " ") {
      e.preventDefault();
      setIsAutoPlaying(!isAutoPlaying);
    }
  };

  // Auto-play functionality
  useState(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      if (currentIndex < totalSlides - 1) {
        goToNext();
      } else {
        setIsAutoPlaying(false);
      }
    }, 5000);
    return () => clearInterval(interval);
  });

  const exportToPDF = async () => {
    toast.info("Preparing PDF export...");
    // Create a simple text-based export for now
    const content = slides.map((slide, i) => 
      `Slide ${i + 1}: ${slide.title}\n${slide.bullets?.join('\n• ') || ''}\n${slide.speakerNotes ? `Notes: ${slide.speakerNotes}` : ''}\n`
    ).join('\n---\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'presentation'}-slides.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Slides exported!");
  };

  const renderSlideContent = () => {
    if (!currentSlide) return null;

    // Title slide (first slide)
    if (currentIndex === 0) {
      return (
        <div className="text-center space-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="space-y-2">
            <div className="inline-block px-4 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
              Presentation
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                {title || currentSlide.title}
              </span>
            </h1>
          </div>
          {currentSlide.subtitle && (
            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto">
              {currentSlide.subtitle}
            </p>
          )}
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <span>Press</span>
            <kbd className="px-2 py-1 bg-slate-800 rounded text-xs">→</kbd>
            <span>to continue</span>
          </div>
        </div>
      );
    }

    // Stats slide layout
    if (currentSlide.layout === "stats" && currentSlide.stats) {
      return (
        <div className="space-y-8 animate-in fade-in-0 slide-in-from-right-4 duration-500">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            {currentSlide.title}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {currentSlide.stats.map((stat, i) => (
              <div 
                key={i} 
                className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Quote slide layout
    if (currentSlide.layout === "quote") {
      return (
        <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in-0 zoom-in-95 duration-500">
          <div className="text-6xl text-primary/30">"</div>
          <blockquote className="text-2xl md:text-3xl lg:text-4xl font-medium text-white max-w-4xl leading-relaxed">
            {currentSlide.keyMessage || currentSlide.bullets?.[0]}
          </blockquote>
          <div className="text-6xl text-primary/30">"</div>
        </div>
      );
    }

    // Default content slide
    return (
      <div className="space-y-8 animate-in fade-in-0 slide-in-from-right-4 duration-500">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            {currentSlide.title}
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
        </div>

        {currentSlide.keyMessage && (
          <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
            <p className="text-lg md:text-xl text-primary font-medium italic">
              {currentSlide.keyMessage}
            </p>
          </div>
        )}

        {currentSlide.bullets && currentSlide.bullets.length > 0 && (
          <ul className="space-y-4">
            {currentSlide.bullets.map((bullet, i) => (
              <li
                key={i}
                className="flex items-start gap-4 text-lg md:text-xl text-slate-200 animate-in fade-in-0 slide-in-from-left-2"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="mt-2 w-3 h-3 rounded-full bg-gradient-to-r from-primary to-blue-500 flex-shrink-0 shadow-lg shadow-primary/30" />
                <span className="leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col",
        isFullscreen && "fixed inset-0 z-50 bg-slate-950 p-4"
      )}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Progress Bar */}
      <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-2">
        <div 
          className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Slide Display */}
      <Card className={cn("flex-1 overflow-hidden border-slate-800", isFullscreen && "h-full")}>
        <CardContent className="h-full p-0">
          <div
            className={cn(
              "relative h-full",
              "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
              "text-white p-8 md:p-12 lg:p-16 flex flex-col",
              isFullscreen ? "aspect-auto min-h-[600px]" : "aspect-video"
            )}
          >
            {/* Slide Number Badge */}
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-800/80 backdrop-blur text-sm text-slate-300 font-medium">
                {currentIndex + 1} / {totalSlides}
              </span>
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/10 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-blue-500/10 via-transparent to-transparent" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl" />
              {/* Grid pattern */}
              <div 
                className="absolute inset-0 opacity-[0.02]"
                style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                  backgroundSize: '50px 50px'
                }}
              />
            </div>

            {/* Slide Content */}
            <div className="flex-1 flex flex-col justify-center relative z-10 max-w-5xl mx-auto w-full">
              {renderSlideContent()}
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between mt-4 gap-4 flex-wrap">
        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={goToFirst}
            disabled={currentIndex === 0}
            className="h-9 w-9"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="h-9 w-9"
          >
            {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            disabled={currentIndex === totalSlides - 1}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToLast}
            disabled={currentIndex === totalSlides - 1}
            className="h-9 w-9"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Slide Thumbnails */}
        <div className="flex-1 overflow-x-auto hidden md:block">
          <div className="flex gap-2 justify-center">
            {slides.map((slide, index) => (
              <button
                key={index}
                className={cn(
                  "w-20 h-12 rounded-lg flex-shrink-0 text-xs p-2 overflow-hidden transition-all",
                  "bg-gradient-to-br from-slate-800 to-slate-900 text-white",
                  index === currentIndex
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                    : "opacity-60 hover:opacity-100 hover:scale-105"
                )}
                onClick={() => setCurrentIndex(index)}
              >
                <span className="line-clamp-2 leading-tight font-medium">
                  {slide.title.substring(0, 25)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
            className="hidden sm:flex"
          >
            {showNotes ? "Hide Notes" : "Notes"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToPDF}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-9 w-9"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Speaker Notes */}
      {showNotes && currentSlide?.speakerNotes && (
        <Card className="mt-4 border-slate-800 bg-slate-900/50">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Speaker Notes
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">{currentSlide.speakerNotes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
