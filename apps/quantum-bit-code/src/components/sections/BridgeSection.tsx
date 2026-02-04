import { QBCDecryptedText, QBCStaticText } from "@/components/QBCDecryptedText";
import bridgeImage from "@/assets/images/quantum-bridge.png";
import fractalImage from "@/assets/images/fractalpulse.png";
import { motion } from "motion/react";
import { ArrowLeftRight, Fingerprint, Radio, Shield, Cpu, Lock } from "lucide-react";

const BridgeSection = () => {
  const bridgeModules = [
    {
      icon: Radio,
      title: "Hybrid Communication Framework",
      description: "Seamless translation between quantum and classical protocols"
    },
    {
      icon: Cpu,
      title: "Quantum-Aware Spectrum Allocation",
      description: "Intelligent bandwidth management for hybrid networks"
    },
    {
      icon: Shield,
      title: "Hybrid Quantum Error Correction",
      description: "Resilient encoding that survives both classical and quantum noise"
    },
    {
      icon: Lock,
      title: "Quantum-Classical Security Protocols",
      description: "Defense-in-depth across both computational paradigms"
    }
  ];

  return (
    <section id="bridge-deep" className="relative min-h-screen py-24 overflow-hidden bg-space-deep">
      <div className="container px-6">
        <div className="max-w-6xl mx-auto">
          {/* FractalPulse Section */}
          <div id="fractalpulse-deep" className="mb-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div>
                  <p className="text-quantum-purple font-mono text-sm tracking-widest uppercase mb-4">
                    <QBCStaticText glyphHeight="0.875rem">Authentication Layer</QBCStaticText>
                  </p>
                  <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                    <span className="text-quantum-purple">
                      <QBCDecryptedText text="FractalPulse" animateOn="view" glyphHeight="2rem" />
                    </span>
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    <QBCStaticText glyphHeight="1.125rem">
                      FractalPulse uses recursive, self-similar patterns to create authentication signatures that are mathematically verifiable yet computationally impossible to forge—even with quantum computers.
                    </QBCStaticText>
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-quantum-purple/10 border border-quantum-purple/20 rounded-lg">
                    <Fingerprint className="w-6 h-6 text-quantum-purple" />
                    <div>
                      <h4 className="font-bold text-foreground">
                        <QBCStaticText glyphHeight="1rem">Recursive Verification</QBCStaticText>
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        <QBCStaticText glyphHeight="0.875rem">Authentication at infinite scales of resolution</QBCStaticText>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-quantum-purple/10 border border-quantum-purple/20 rounded-lg">
                    <Shield className="w-6 h-6 text-quantum-purple" />
                    <div>
                      <h4 className="font-bold text-foreground">
                        <QBCStaticText glyphHeight="1rem">Quantum-Resistant</QBCStaticText>
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        <QBCStaticText glyphHeight="0.875rem">Security based on geometric complexity, not prime factorization</QBCStaticText>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="relative rounded-2xl overflow-hidden border border-quantum-purple/30 glow-purple">
                  <img 
                    src={fractalImage} 
                    alt="FractalPulse Authentication" 
                    className="w-full h-auto"
                  />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Quantum-Classical Bridge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="text-primary font-mono text-sm tracking-widest uppercase mb-4">
              <QBCStaticText glyphHeight="0.875rem">Patented Technology</QBCStaticText>
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              <QBCDecryptedText 
                text="The Quantum-Classical Bridge"
                animateOn="view"
                glyphHeight="2.5rem"
                className="text-foreground"
              />
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              <QBCStaticText glyphHeight="1.125rem">
                Our patented Foundational Bridge enables seamless integration between existing classical infrastructure and emerging quantum systems.
              </QBCStaticText>
            </p>
          </motion.div>

          {/* Bridge Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="relative rounded-2xl overflow-hidden border border-primary/30">
              <img 
                src={bridgeImage} 
                alt="Quantum-Classical Bridge" 
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>
          </motion.div>

          {/* Bridge Modules Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {bridgeModules.map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-4 p-6 bg-card/80 border border-primary/20 rounded-lg hover:border-primary/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <module.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground mb-2">
                    <QBCStaticText glyphHeight="1rem">{module.title}</QBCStaticText>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    <QBCStaticText glyphHeight="0.875rem">{module.description}</QBCStaticText>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Patent Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-muted-foreground font-mono">
              <ArrowLeftRight className="w-4 h-4 inline-block mr-2 text-primary" />
              <QBCStaticText glyphHeight="0.875rem">
                Protected by 10 provisional patent claims covering quantum-classical interoperability
              </QBCStaticText>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BridgeSection;