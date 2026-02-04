import { QBCDecryptedText, QBCStaticText } from "@/components/QBCDecryptedText";
import quantumImage from "@/assets/images/quantum-checkmate.png";
import { motion } from "motion/react";
import { Clock, Skull, Ban } from "lucide-react";

const QuantumCheckmateSection = () => {
  const threats = [
    {
      icon: Skull,
      title: "Existential Threat",
      description: "Quantum computers will break RSA, ECC, and all current public-key cryptography within this decade."
    },
    {
      icon: Clock,
      title: "Systemic Collapse",
      description: "Every encrypted communication, financial transaction, and military secret becomes vulnerable simultaneously."
    },
    {
      icon: Ban,
      title: "No Patch Available",
      description: "Unlike software vulnerabilities, there is no update that can protect legacy cryptographic systems."
    }
  ];

  return (
    <section id="quantum-checkmate" className="relative min-h-screen py-24 overflow-hidden bg-space-void">
      <div className="container px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <p className="text-quantum-purple font-mono text-sm tracking-widest uppercase mb-4">
                  <QBCStaticText glyphHeight="0.875rem">The Quantum Threat</QBCStaticText>
                </p>
                <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
                  <QBCDecryptedText 
                    text="Quantum Checkmate:"
                    animateOn="view"
                    glyphHeight="2.5rem"
                    className="text-foreground"
                  />
                  <br />
                  <span className="text-quantum-purple text-glow-purple">
                    <QBCDecryptedText 
                      text="The End of Classical Security"
                      animateOn="view"
                      glyphHeight="2.5rem"
                    />
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  <QBCStaticText glyphHeight="1.125rem">
                    The arrival of cryptographically-relevant quantum computers represents a discontinuity in the history of information security. Current defenses will fail completely.
                  </QBCStaticText>
                </p>
              </div>

              {/* Threat Cards */}
              <div className="space-y-4">
                {threats.map((threat, index) => (
                  <motion.div
                    key={threat.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex gap-4 p-4 bg-card/50 border border-quantum-purple/20 rounded-lg"
                  >
                    <threat.icon className="w-6 h-6 text-quantum-purple shrink-0 mt-1" />
                    <div>
                      <h3 className="font-display font-bold text-foreground mb-1">
                        <QBCStaticText glyphHeight="1rem">{threat.title}</QBCStaticText>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        <QBCStaticText glyphHeight="0.875rem">{threat.description}</QBCStaticText>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Timeline hint */}
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <p className="text-destructive font-mono text-sm">
                  <QBCStaticText glyphHeight="0.875rem">
                    HARVEST NOW, DECRYPT LATER: Adversaries are already collecting encrypted data to decrypt once quantum computers arrive.
                  </QBCStaticText>
                </p>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden">
                <img 
                  src={quantumImage} 
                  alt="Shattering chess king - quantum supremacy" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>
              
              {/* Overlay text */}
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-sm font-mono text-quantum-purple/80">
                  <QBCStaticText glyphHeight="0.875rem">
                    Classical cryptography shatters under quantum supremacy
                  </QBCStaticText>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuantumCheckmateSection;