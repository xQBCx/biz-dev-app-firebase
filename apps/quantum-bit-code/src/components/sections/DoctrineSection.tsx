import { QBCDecryptedText, QBCStaticText } from "@/components/QBCDecryptedText";
import signalImage from "@/assets/images/signal-sovereignty.png";
import { motion } from "motion/react";
import { Hexagon, Layers, Fingerprint } from "lucide-react";

const DoctrineSection = () => {
  const tenets = [
    {
      icon: Hexagon,
      title: "Geometric Security",
      description: "Information encoded as evolving geometric structures that cannot be reverse-engineered.",
      color: "primary"
    },
    {
      icon: Layers,
      title: "Pan-Medium Transport",
      description: "Signals that traverse earth, water, atmosphere, and space as a unified medium.",
      color: "quantum-green"
    },
    {
      icon: Fingerprint,
      title: "Physically-Bound Identity",
      description: "Authentication tied to immutable physical characteristics of the signal path.",
      color: "quantum-orange"
    }
  ];

  return (
    <section id="doctrine" className="relative min-h-screen py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-space" />
      </div>

      <div className="relative z-10 container px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-quantum">
                <img 
                  src={signalImage} 
                  alt="Earth cross-section with signal networks" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8 order-1 lg:order-2"
            >
              <div>
                <p className="text-primary font-mono text-sm tracking-widest uppercase mb-4">
                  <QBCStaticText glyphHeight="0.875rem">A New Doctrine</QBCStaticText>
                </p>
                <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
                  <QBCDecryptedText 
                    text="Signal Sovereignty:"
                    animateOn="view"
                    glyphHeight="2.5rem"
                    className="text-foreground"
                  />
                  <br />
                  <span className="text-primary text-glow-cyan">
                    <QBCDecryptedText 
                      text="A New Battlespace"
                      animateOn="view"
                      glyphHeight="2.5rem"
                    />
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  <QBCStaticText glyphHeight="1.125rem">
                    Signal Sovereignty is the doctrine that a nation or organization must have absolute control over its information pathways—from the physical substrate to the mathematical encoding.
                  </QBCStaticText>
                </p>
              </div>

              {/* Core Tenets */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-foreground text-lg">
                  <QBCStaticText glyphHeight="1.125rem">Core Tenets</QBCStaticText>
                </h3>
                {tenets.map((tenet, index) => (
                  <motion.div
                    key={tenet.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`flex gap-4 p-4 bg-card/50 border border-${tenet.color}/20 rounded-lg hover:border-${tenet.color}/40 transition-colors`}
                  >
                    <tenet.icon className={`w-6 h-6 text-${tenet.color} shrink-0 mt-1`} />
                    <div>
                      <h4 className="font-display font-bold text-foreground mb-1">
                        <QBCStaticText glyphHeight="1rem">{tenet.title}</QBCStaticText>
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        <QBCStaticText glyphHeight="0.875rem">{tenet.description}</QBCStaticText>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DoctrineSection;