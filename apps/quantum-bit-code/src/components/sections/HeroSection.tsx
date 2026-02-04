import { QBCDecryptedText, QBCStaticText } from "@/components/QBCDecryptedText";
import heroImage from "@/assets/images/hero-earth-network.png";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";

const HeroSection = () => {
  const scrollToNext = () => {
    document.getElementById("threat")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Earth with geometric network" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container px-6 text-center max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <p className="text-primary font-mono text-sm tracking-widest uppercase">
            <QBCStaticText glyphHeight="1.25rem">Signal Sovereignty</QBCStaticText>
          </p>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
            <QBCDecryptedText 
              text="The Nature of Conflict is Shifting" 
              animateOn="view"
              speed={30}
              className="text-foreground"
              glyphHeight="4rem"
            />
            <br />
            <span className="text-primary text-glow-cyan">
              <QBCDecryptedText 
                text="from the Digital to the Physical" 
                animateOn="view"
                speed={30}
                glyphHeight="4rem"
              />
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            <QBCDecryptedText 
              text="Securing Global Infrastructure in the Post Quantum Era"
              animateOn="view"
              speed={20}
              glyphHeight="2rem"
            />
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-8">
            <span className="px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-mono">
              <QBCStaticText glyphHeight="1.25rem">Quantum Bit Code</QBCStaticText>
            </span>
            <span className="px-4 py-2 rounded-full border border-quantum-purple/30 bg-quantum-purple/10 text-quantum-purple text-sm font-mono">
              <QBCStaticText glyphHeight="1.25rem">MESH</QBCStaticText>
            </span>
            <span className="px-4 py-2 rounded-full border border-quantum-green/30 bg-quantum-green/10 text-quantum-green text-sm font-mono">
              <QBCStaticText glyphHeight="1.25rem">EarthPulse</QBCStaticText>
            </span>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.button
          onClick={scrollToNext}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary hover:text-primary/80 transition-colors"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8" />
        </motion.button>
      </div>
    </section>
  );
};

export default HeroSection;
