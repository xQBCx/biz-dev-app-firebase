import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Slide {
  title: string;
  bullets?: string[];
  speakerNotes?: string;
  layout?: "title" | "content" | "two-column" | "image";
  subtitle?: string;
  keyMessage?: string;
}

interface ProfessionalSlideViewerProps {
  slides: Slide[];
  title?: string;
}

export function ProfessionalSlideViewer({ slides, title }: ProfessionalSlideViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const currentSlide = slides[currentIndex];
  const totalSlides = slides.length;

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(totalSlides - 1, prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
    if (e.key === "Escape") setIsFullscreen(false);
  };

  return (
    <div
      className={cn(
        "flex flex-col",
        isFullscreen && "fixed inset-0 z-50 bg-background p-4"
      )}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Main Slide Display */}
      <Card className={cn("flex-1 overflow-hidden", isFullscreen && "h-full")}>
        <CardContent className="h-full p-0">
          <div
            className={cn(
              "relative h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
              "text-white p-8 flex flex-col",
              isFullscreen ? "aspect-auto" : "aspect-video"
            )}
          >
            {/* Slide Number */}
            <div className="absolute top-4 right-4 text-sm text-slate-400">
              {currentIndex + 1} / {totalSlides}
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-tr-full" />

            {/* Slide Content */}
            <div className="flex-1 flex flex-col justify-center relative z-10">
              {/* Title Slide Layout */}
              {currentIndex === 0 && (
                <div className="text-center space-y-4">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    {title || currentSlide.title}
                  </h1>
                  {currentSlide.subtitle && (
                    <p className="text-xl text-slate-300">{currentSlide.subtitle}</p>
                  )}
                </div>
              )}

              {/* Content Slide Layout */}
              {currentIndex > 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-white border-l-4 border-primary pl-4">
                    {currentSlide.title}
                  </h2>

                  {currentSlide.keyMessage && (
                    <p className="text-lg text-primary font-medium italic">
                      "{currentSlide.keyMessage}"
                    </p>
                  )}

                  {currentSlide.bullets && currentSlide.bullets.length > 0 && (
                    <ul className="space-y-3">
                      {currentSlide.bullets.map((bullet, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-lg text-slate-200"
                        >
                          <span className="mt-2 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between mt-4 gap-4">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            disabled={currentIndex === totalSlides - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Slide Thumbnails */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-2 justify-center">
            {slides.map((slide, index) => (
              <button
                key={index}
                className={cn(
                  "w-16 h-10 rounded border-2 flex-shrink-0 text-xs p-1 overflow-hidden",
                  "bg-slate-800 text-white transition-all",
                  index === currentIndex
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-slate-600 hover:border-slate-400"
                )}
                onClick={() => setCurrentIndex(index)}
              >
                <span className="line-clamp-2 leading-tight">
                  {slide.title.substring(0, 20)}
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
          >
            {showNotes ? "Hide Notes" : "Show Notes"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
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
      {showNotes && currentSlide.speakerNotes && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Speaker Notes
            </h4>
            <p className="text-sm">{currentSlide.speakerNotes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
