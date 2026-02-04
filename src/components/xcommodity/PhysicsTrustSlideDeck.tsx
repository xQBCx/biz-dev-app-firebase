import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause,
  Maximize2,
  Minimize2,
  Presentation
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface Slide {
  id: number;
  title: string;
  description: string;
  imagePath: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "The Fracture of the Monetary Order",
    description: "Systemic vulnerability of SWIFT, sovereign reactions with mBridge, and the irreversible shift toward de-dollarization as a survival mechanism.",
    imagePath: "/slides/xcommodity/slide-01.jpg"
  },
  {
    id: 2,
    title: "The Trillion-Dollar Trust Vacuum",
    description: "The digital-physical mismatch: 2025-grade financial rails with 1975-era paper verification methods creating counterparty risk.",
    imagePath: "/slides/xcommodity/slide-02.jpg"
  },
  {
    id: 3,
    title: "The Thesis of the Physical Oracle",
    description: "Anchoring trust in physics: replacing subjective reports with objective sensor readings. Payment follows proof.",
    imagePath: "/slides/xcommodity/slide-03.jpg"
  },
  {
    id: 4,
    title: "Okari GX: The Hardware of Truth",
    description: "Coriolis mass flow measurement, density fingerprinting, and physics-based verification replacing reports.",
    imagePath: "/slides/xcommodity/slide-04.jpg"
  },
  {
    id: 5,
    title: "The Unbribable Sentinel",
    description: "Edge AI anomaly detection, FIPS 140-3 secure enclave with suicide circuit, and vibration signature analysis for tamper detection.",
    imagePath: "/slides/xcommodity/slide-05.jpg"
  },
  {
    id: 6,
    title: "Cryptographically Signed Reality",
    description: "Transaction-based state machine with immutable event sequences. Tri-path connectivity via Starlink, LoRaWAN, and Iridium.",
    imagePath: "/slides/xcommodity/slide-06.jpg"
  },
  {
    id: 7,
    title: "XODIAK: The Sovereign Operating System",
    description: "Federated sovereignty architecture with zero-knowledge synchronization. The Switzerland of data for untrusting nations.",
    imagePath: "/slides/xcommodity/slide-07.jpg"
  },
  {
    id: 8,
    title: "The ISO 20022 Injection",
    description: "Proof-of-delivery embedded in payment messages. Automating compliance for central banks against trade-based money laundering.",
    imagePath: "/slides/xcommodity/slide-08.jpg"
  },
  {
    id: 9,
    title: "The Strategy: Activating mBridge",
    description: "XODIAK as middleware for multi-CBDC trade. Atomic Commodity Swaps eliminating the 'who goes first?' dilemma.",
    imagePath: "/slides/xcommodity/slide-09.jpg"
  },
  {
    id: 10,
    title: "The National Blueprint: BOST Ghana",
    description: "National-scale transparency with self-verifying tanker trucks. Automated revenue capture and real-time digital oversight.",
    imagePath: "/slides/xcommodity/slide-10.jpg"
  },
  {
    id: 11,
    title: "The Engine of Adoption: Smart Mandate",
    description: "Immutable commission protection for brokers. Smart Mandate Links hard-code commissions into deal contracts.",
    imagePath: "/slides/xcommodity/slide-11.jpg"
  },
  {
    id: 12,
    title: "The Vision: The Internet of Materials",
    description: "Beyond hydrocarbons: commodity-agnostic protocol for oil, gold, rare earth metals, agricultural products, and water.",
    imagePath: "/slides/xcommodity/slide-12.jpg"
  },
  {
    id: 13,
    title: "A Strategic Asset for a Multipolar World",
    description: "Dual-Stack compliance for Western (SWIFT) and BRICS (mBridge) markets. Physical lock-in creating strategic value.",
    imagePath: "/slides/xcommodity/slide-13.jpg"
  },
  {
    id: 14,
    title: "The Invitation: Architect the Future",
    description: "Seeking strategic government partners and founding consortium members to capitalize global infrastructure deployment.",
    imagePath: "/slides/xcommodity/slide-14.jpg"
  }
];

interface PhysicsTrustSlideDeckProps {
  compact?: boolean;
}

export function PhysicsTrustSlideDeck({ compact = false }: PhysicsTrustSlideDeckProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-play functionality
  useState(() => {
    if (isPlaying) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  });

  const slide = slides[currentSlide];

  if (compact) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:border-primary/50 transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Presentation className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Physics, Trust & Global Trade</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                The comprehensive vision for xCOMMODITYx, XODIAK, and Okari GX infrastructure.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{slides.length} slides</Badge>
                <span className="text-xs text-muted-foreground">By: Bill Mercer</span>
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-6xl h-[90vh]">
          <SlideViewer 
            slide={slide} 
            currentSlide={currentSlide}
            totalSlides={slides.length}
            onNext={nextSlide}
            onPrev={prevSlide}
            onGoTo={goToSlide}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Presentation className="h-5 w-5 text-primary" />
            <CardTitle>Physics, Trust & Global Trade</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground">By: Bill Mercer</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <SlideViewer 
          slide={slide} 
          currentSlide={currentSlide}
          totalSlides={slides.length}
          onNext={nextSlide}
          onPrev={prevSlide}
          onGoTo={goToSlide}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
        />
      </CardContent>
    </Card>
  );
}

interface SlideViewerProps {
  slide: Slide;
  currentSlide: number;
  totalSlides: number;
  onNext: () => void;
  onPrev: () => void;
  onGoTo: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

function SlideViewer({ 
  slide, 
  currentSlide, 
  totalSlides, 
  onNext, 
  onPrev, 
  onGoTo,
  isPlaying,
  onTogglePlay 
}: SlideViewerProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Slide Image */}
      <div className="relative flex-1 bg-foreground flex items-center justify-center min-h-[400px]">
        <img 
          src={slide.imagePath} 
          alt={slide.title}
          className="max-h-full max-w-full object-contain"
        />
        
        {/* Navigation Overlays */}
        <button 
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button 
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slide Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-background/80 text-sm">
          {currentSlide + 1} / {totalSlides}
        </div>
      </div>

      {/* Slide Info & Controls */}
      <div className="p-4 border-t bg-card">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-semibold text-lg">{slide.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{slide.description}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="icon" onClick={onTogglePlay}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Thumbnail Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {slides.map((s, index) => (
            <button
              key={s.id}
              onClick={() => onGoTo(index)}
              className={`flex-shrink-0 w-16 h-10 rounded overflow-hidden border-2 transition-all ${
                index === currentSlide 
                  ? 'border-primary' 
                  : 'border-transparent hover:border-muted-foreground/50'
              }`}
            >
              <img 
                src={s.imagePath} 
                alt={s.title}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Attribution */}
        <div className="mt-3 pt-3 border-t text-center">
          <span className="text-sm text-muted-foreground">By: Bill Mercer</span>
        </div>
      </div>
    </div>
  );
}

export default PhysicsTrustSlideDeck;
