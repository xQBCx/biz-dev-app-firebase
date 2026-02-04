import { QBCDecryptedText, QBCStaticText } from "@/components/QBCDecryptedText";
import threatImage from "@/assets/images/threat-infrastructure.png";
import { motion } from "motion/react";
import { AlertTriangle, Zap, Shield } from "lucide-react";

const ThreatSection = () => {
  return (
    <section id="threat" className="relative min-h-screen py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={threatImage} 
          alt="Infrastructure under threat" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      </div>

      <div className="relative z-10 container px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mb-16"
          >
            <p className="text-destructive font-mono text-sm tracking-widest uppercase mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <QBCStaticText glyphHeight="0.875rem">Critical Vulnerability</QBCStaticText>
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              <QBCDecryptedText 
                text="The Unseen Threat Vector:" 
                animateOn="view"
                glyphHeight="2.5rem"
                className="text-foreground"
              />
              <br />
              <span className="text-destructive">
                <QBCDecryptedText 
                  text="Exploiting the Physical Signal Layer"
                  animateOn="view"
                  glyphHeight="2.5rem"
                />
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              <QBCStaticText glyphHeight="1.125rem">
                Modern adversaries have discovered a critical blind spot in global security: the physical infrastructure that carries our digital communications.
              </QBCStaticText>
            </p>
          </motion.div>

          {/* Threat Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card/80 backdrop-blur-sm border border-destructive/20 rounded-lg p-8"
            >
              <Zap className="w-10 h-10 text-destructive mb-4" />
              <h3 className="text-xl font-display font-bold mb-3 text-foreground">
                <QBCStaticText glyphHeight="1.25rem">Infrastructure Hijacking</QBCStaticText>
              </h3>
              <p className="text-muted-foreground">
                <QBCStaticText glyphHeight="1rem">
                  State actors can intercept, manipulate, or destroy communications at the physical layer—undersea cables, power grids, and satellite links—bypassing all software-based security.
                </QBCStaticText>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  <QBCStaticText glyphHeight="0.875rem">Undersea cable tapping</QBCStaticText>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  <QBCStaticText glyphHeight="0.875rem">Power grid infiltration</QBCStaticText>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  <QBCStaticText glyphHeight="0.875rem">Satellite signal jamming</QBCStaticText>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-card/80 backdrop-blur-sm border border-quantum-orange/20 rounded-lg p-8"
            >
              <Shield className="w-10 h-10 text-quantum-orange mb-4" />
              <h3 className="text-xl font-display font-bold mb-3 text-foreground">
                <QBCStaticText glyphHeight="1.25rem">Hybrid Breaches</QBCStaticText>
              </h3>
              <p className="text-muted-foreground">
                <QBCStaticText glyphHeight="1rem">
                  Combined cyber-physical attacks target the convergence point where digital systems meet physical infrastructure, creating cascading failures.
                </QBCStaticText>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-quantum-orange" />
                  <QBCStaticText glyphHeight="0.875rem">SCADA/ICS exploitation</QBCStaticText>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-quantum-orange" />
                  <QBCStaticText glyphHeight="0.875rem">Supply chain compromise</QBCStaticText>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-quantum-orange" />
                  <QBCStaticText glyphHeight="0.875rem">Electromagnetic interference</QBCStaticText>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThreatSection;