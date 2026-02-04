import { QBCDecryptedText, QBCStaticText } from "@/components/QBCDecryptedText";
import { motion } from "motion/react";
import { Shield, Lock, Eye, Command } from "lucide-react";

const CapabilitiesSection = () => {
  const capabilities = [
    {
      icon: Shield,
      title: "Unparalleled Resilience",
      description: "Infrastructure that adapts and survives physical attacks, jamming, and natural disasters through multi-path redundancy.",
      color: "primary"
    },
    {
      icon: Lock,
      title: "Inherent Post-Quantum Security",
      description: "Cryptographic protection based on geometric complexity rather than computational hardness—immune to quantum attack.",
      color: "quantum-purple"
    },
    {
      icon: Eye,
      title: "Multi-Domain Stealth & Intelligence",
      description: "Signals that blend into natural phenomena, providing covert communications and environmental awareness.",
      color: "quantum-green"
    },
    {
      icon: Command,
      title: "Sovereign Command & Control",
      description: "Complete independence from foreign infrastructure, third-party networks, or externally-controlled satellites.",
      color: "quantum-orange"
    }
  ];

  return (
    <section id="capabilities" className="relative min-h-screen py-24 overflow-hidden bg-space-void">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

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
              <QBCStaticText glyphHeight="0.875rem">Strategic Advantage</QBCStaticText>
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              <QBCDecryptedText 
                text="Full-Spectrum Capabilities"
                animateOn="view"
                glyphHeight="2.5rem"
                className="text-foreground"
              />
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              <QBCStaticText glyphHeight="1.125rem">
                The QBC ecosystem delivers unprecedented capabilities across all domains of operation.
              </QBCStaticText>
            </p>
          </motion.div>

          {/* Capabilities Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {capabilities.map((capability, index) => (
              <motion.div
                key={capability.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative p-8 bg-card/80 backdrop-blur-sm border border-${capability.color}/30 rounded-xl overflow-hidden group hover:border-${capability.color}/60 transition-all duration-300`}
              >
                {/* Background glow */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-${capability.color}/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-${capability.color}/10 transition-colors`} />
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-xl bg-${capability.color}/10 border border-${capability.color}/30 flex items-center justify-center mb-6`}>
                    <capability.icon className={`w-8 h-8 text-${capability.color}`} />
                  </div>
                  
                  <h3 className="text-xl font-display font-bold text-foreground mb-3">
                    <QBCStaticText glyphHeight="1.25rem">{capability.title}</QBCStaticText>
                  </h3>
                  
                  <p className="text-muted-foreground">
                    <QBCStaticText glyphHeight="1rem">{capability.description}</QBCStaticText>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 border border-primary/30 rounded-full">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-primary font-mono text-sm">
                <QBCStaticText glyphHeight="0.875rem">
                  These capabilities are not theoretical—they are protected by granted and pending patents
                </QBCStaticText>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesSection;