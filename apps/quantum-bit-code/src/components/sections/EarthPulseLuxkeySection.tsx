import { QBCDecryptedText, QBCStaticText } from "@/components/QBCDecryptedText";
import earthpulseImage from "@/assets/images/signal-sovereignty.png";
import luxkeyImage from "@/assets/images/luxkey.png";
import { motion } from "motion/react";
import { Globe, Key, Brain, Shield, Fingerprint, Lock } from "lucide-react";

const EarthPulseLuxkeySection = () => {
  return (
    <section id="earthpulse-deep" className="relative min-h-screen py-24 overflow-hidden bg-space-void">
      <div className="container px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-quantum-green font-mono text-sm tracking-widest uppercase mb-4">
              <QBCStaticText glyphHeight="0.875rem">Intelligence and Identity Layers</QBCStaticText>
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-bold">
              <QBCDecryptedText 
                text="The Foundation of Trust"
                animateOn="view"
                glyphHeight="2.5rem"
                className="text-foreground"
              />
            </h2>
          </motion.div>

          {/* Two Columns */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* EarthPulse */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="relative rounded-2xl overflow-hidden border border-quantum-green/30">
                <img 
                  src={earthpulseImage} 
                  alt="EarthPulse Intelligence Layer" 
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <Globe className="w-8 h-8 text-quantum-green" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
                  <span className="text-quantum-green">
                    <QBCStaticText glyphHeight="1.5rem">EarthPulse</QBCStaticText>
                  </span>
                </h3>
                <p className="text-quantum-green/80 font-mono text-sm mb-4">
                  <QBCStaticText glyphHeight="0.875rem">The Intelligence Layer</QBCStaticText>
                </p>
                <p className="text-muted-foreground">
                  <QBCStaticText glyphHeight="1rem">
                    EarthPulse provides real-time intelligence about the physical signal environment—monitoring electromagnetic conditions, seismic activity, and atmospheric states to optimize routing and detect anomalies.
                  </QBCStaticText>
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-quantum-green/10 border border-quantum-green/20 rounded-lg">
                  <Brain className="w-5 h-5 text-quantum-green shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground text-sm">
                      <QBCStaticText glyphHeight="0.875rem">Environmental Awareness</QBCStaticText>
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      <QBCStaticText glyphHeight="0.75rem">Continuous monitoring of signal propagation conditions</QBCStaticText>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-quantum-green/10 border border-quantum-green/20 rounded-lg">
                  <Shield className="w-5 h-5 text-quantum-green shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground text-sm">
                      <QBCStaticText glyphHeight="0.875rem">Threat Detection</QBCStaticText>
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      <QBCStaticText glyphHeight="0.75rem">Identification of jamming, interception, and manipulation attempts</QBCStaticText>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* LUXKEY */}
            <motion.div
              id="luxkey-deep"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="relative rounded-2xl overflow-hidden border border-quantum-orange/30">
                <img 
                  src={luxkeyImage} 
                  alt="LUXKEY Identity Layer" 
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <Key className="w-8 h-8 text-quantum-orange" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
                  <span className="text-quantum-orange">
                    <QBCStaticText glyphHeight="1.5rem">LUXKEY</QBCStaticText>
                  </span>
                </h3>
                <p className="text-quantum-orange/80 font-mono text-sm mb-4">
                  <QBCStaticText glyphHeight="0.875rem">The Identity Layer</QBCStaticText>
                </p>
                <p className="text-muted-foreground">
                  <QBCStaticText glyphHeight="1rem">
                    LUXKEY binds identity to the physical characteristics of the signal path itself—creating authentication that cannot be forged, replayed, or stolen because it is embedded in the laws of physics.
                  </QBCStaticText>
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-quantum-orange/10 border border-quantum-orange/20 rounded-lg">
                  <Fingerprint className="w-5 h-5 text-quantum-orange shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground text-sm">
                      <QBCStaticText glyphHeight="0.875rem">Physical Binding</QBCStaticText>
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      <QBCStaticText glyphHeight="0.75rem">Identity tied to immutable signal path characteristics</QBCStaticText>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-quantum-orange/10 border border-quantum-orange/20 rounded-lg">
                  <Lock className="w-5 h-5 text-quantum-orange shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground text-sm">
                      <QBCStaticText glyphHeight="0.875rem">Unclonable Authentication</QBCStaticText>
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      <QBCStaticText glyphHeight="0.75rem">Credentials that exist only in the moment of transmission</QBCStaticText>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EarthPulseLuxkeySection;