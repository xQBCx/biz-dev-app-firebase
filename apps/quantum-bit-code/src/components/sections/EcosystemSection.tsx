import { QBCDecryptedText, QBCStaticText } from "@/components/QBCDecryptedText";
import { motion } from "motion/react";
import { Hexagon, Layers, Globe, Key, Fingerprint, ArrowLeftRight } from "lucide-react";

interface ModuleProps {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  delay: number;
}

const EcosystemSection = () => {
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  const modules: ModuleProps[] = [
    {
      id: "qbc-deep",
      title: "QBC",
      subtitle: "Geometric Encoding",
      icon: Hexagon,
      color: "primary",
      delay: 0
    },
    {
      id: "mesh34-deep",
      title: "MESH 34",
      subtitle: "Hybrid Transport",
      icon: Layers,
      color: "quantum-blue",
      delay: 0.1
    },
    {
      id: "earthpulse-deep",
      title: "EarthPulse",
      subtitle: "Intelligence Layer",
      icon: Globe,
      color: "quantum-green",
      delay: 0.2
    },
    {
      id: "luxkey-deep",
      title: "LUXKEY",
      subtitle: "Identity Layer",
      icon: Key,
      color: "quantum-orange",
      delay: 0.3
    },
    {
      id: "fractalpulse-deep",
      title: "FractalPulse",
      subtitle: "Authentication",
      icon: Fingerprint,
      color: "quantum-purple",
      delay: 0.4
    },
    {
      id: "bridge-deep",
      title: "Bridge",
      subtitle: "Quantum-Classical",
      icon: ArrowLeftRight,
      color: "primary",
      delay: 0.5
    }
  ];

  return (
    <section id="ecosystem" className="relative min-h-screen py-24 overflow-hidden bg-space-deep">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      <div className="relative z-10 container px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-primary font-mono text-sm tracking-widest uppercase mb-4">
              <QBCStaticText glyphHeight="0.875rem">The QBC Ecosystem</QBCStaticText>
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              <QBCDecryptedText 
                text="Signal Sovereignty"
                animateOn="view"
                glyphHeight="2.5rem"
                className="text-foreground"
              />
              <br />
              <span className="text-primary text-glow-cyan">
                <QBCDecryptedText 
                  text="Technology Stack"
                  animateOn="view"
                  glyphHeight="2.5rem"
                />
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              <QBCStaticText glyphHeight="1.125rem">
                Click any module to explore its capabilities. Each component works together to create an impenetrable security framework.
              </QBCStaticText>
            </p>
          </motion.div>

          {/* Central Hub Visualization */}
          <div className="relative">
            {/* Center Hub */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex justify-center mb-12"
            >
              <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-quantum-purple/20 border border-primary/40 flex items-center justify-center shadow-quantum">
                <div className="text-center">
                  <Hexagon className="w-12 h-12 text-primary mx-auto mb-2" />
                  <span className="text-sm font-mono text-primary">
                    <QBCStaticText glyphHeight="0.875rem">SIGNAL</QBCStaticText>
                  </span>
                  <span className="block text-xs font-mono text-primary/60">
                    <QBCStaticText glyphHeight="0.75rem">SOVEREIGNTY</QBCStaticText>
                  </span>
                </div>
                
                {/* Pulse rings */}
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-[-10px] rounded-full border border-primary/10 animate-ping" style={{ animationDuration: '4s' }} />
              </div>
            </motion.div>

            {/* Module Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {modules.map((module) => (
                <motion.button
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: module.delay }}
                  onClick={() => scrollToSection(module.id)}
                  className={`group relative p-6 bg-card/80 backdrop-blur-sm border border-${module.color}/30 rounded-xl 
                    hover:border-${module.color}/60 hover:shadow-lg hover:shadow-${module.color}/10 
                    transition-all duration-300 text-left`}
                >
                  <module.icon className={`w-10 h-10 text-${module.color} mb-4 group-hover:scale-110 transition-transform`} />
                  <h3 className="font-display font-bold text-lg text-foreground mb-1">
                    <QBCStaticText glyphHeight="1.125rem">{module.title}</QBCStaticText>
                  </h3>
                  <p className={`text-sm text-${module.color}/80`}>
                    <QBCStaticText glyphHeight="0.875rem">{module.subtitle}</QBCStaticText>
                  </p>
                  
                  {/* Hover arrow */}
                  <div className={`absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-${module.color}`}>
                    →
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EcosystemSection;