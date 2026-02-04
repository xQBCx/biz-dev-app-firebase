import { QBCDecryptedText, QBCStaticText } from "@/components/QBCDecryptedText";
import { motion } from "motion/react";
import { Hexagon } from "lucide-react";

const ClosingSection = () => {
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="closing" className="relative min-h-screen py-24 overflow-hidden bg-space-void flex items-center">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      <div className="relative z-10 container px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Hexagon className="w-20 h-20 text-primary mx-auto mb-8 animate-pulse-glow" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
              <QBCDecryptedText 
                text="Information is Not Just Data."
                animateOn="view"
                glyphHeight="3rem"
                className="text-foreground"
              />
              <br />
              <span className="text-primary text-glow-cyan">
                <QBCDecryptedText 
                  text="It is Structure Embedded in Reality."
                  animateOn="view"
                  glyphHeight="3rem"
                />
              </span>
            </h2>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              <QBCStaticText glyphHeight="1.25rem">
                The future of secure communications is not about building better walls. It is about encoding information into the fabric of the physical world itself.
              </QBCStaticText>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <button
              onClick={scrollToContact}
              className="px-8 py-4 bg-primary text-primary-foreground font-display font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-quantum"
            >
              <QBCStaticText glyphHeight="1rem">Request Access</QBCStaticText>
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-primary font-mono text-lg"
          >
            <QBCStaticText glyphHeight="1.125rem">
              Quantum Bit Code: The Foundation of Signal Sovereignty
            </QBCStaticText>
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default ClosingSection;