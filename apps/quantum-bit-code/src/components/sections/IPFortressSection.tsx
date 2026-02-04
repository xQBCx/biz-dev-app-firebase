import { QBCDecryptedText, QBCStaticText } from "@/components/QBCDecryptedText";
import ipImage from "@/assets/images/ip-fortress.png";
import { motion } from "motion/react";
import { Shield, FileText, Award } from "lucide-react";

const IPFortressSection = () => {
  const patents = [
    "Geometric Information Encoding System",
    "Multi-Medium Signal Propagation Method", 
    "Physical Layer Authentication Protocol",
    "Quantum-Classical Bridge Architecture",
    "Fractal-Based Authentication System"
  ];

  const trademarks = ["Signal Sovereignty", "Quantum Bit Code", "MESH 34", "EarthPulse", "LUXKEY", "FractalPulse"];

  return (
    <section id="ip" className="relative min-h-screen py-24 overflow-hidden bg-space-deep">
      <div className="container px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img src={ipImage} alt="IP Fortress" className="w-full h-auto rounded-2xl" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <p className="text-primary font-mono text-sm uppercase mb-4">
                  <QBCStaticText glyphHeight="0.875rem">Intellectual Property</QBCStaticText>
                </p>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  <QBCDecryptedText text="The IP Fortress" animateOn="view" glyphHeight="2rem" className="text-foreground" />
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-foreground">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-bold">
                    <QBCStaticText glyphHeight="1rem">10 Provisional Patent Claims</QBCStaticText>
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {patents.map((patent) => (
                    <div key={patent} className="p-3 bg-card/50 border border-primary/20 rounded-lg text-sm text-muted-foreground">
                      <QBCStaticText glyphHeight="0.875rem">{patent}</QBCStaticText>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-foreground">
                  <Award className="w-5 h-5 text-quantum-orange" />
                  <span className="font-bold">
                    <QBCStaticText glyphHeight="1rem">Registered Trademarks</QBCStaticText>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trademarks.map((tm) => (
                    <span key={tm} className="px-3 py-1 bg-quantum-orange/10 border border-quantum-orange/30 rounded-full text-xs font-mono text-quantum-orange">
                      <QBCStaticText glyphHeight="0.75rem">{tm}</QBCStaticText>
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IPFortressSection;