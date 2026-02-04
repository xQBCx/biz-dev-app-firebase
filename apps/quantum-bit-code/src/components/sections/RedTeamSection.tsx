import { QBCDecryptedText, QBCStaticText } from "@/components/QBCDecryptedText";
import { motion } from "motion/react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

const RedTeamSection = () => {
  const objections = [
    {
      objection: "Physical layer security is impractical at scale",
      countermeasure: "MESH 34 demonstrates scalable deployment through existing infrastructure integration. Early implementations show 10x cost efficiency compared to dedicated secure networks."
    },
    {
      objection: "Geometric encoding cannot achieve sufficient data rates",
      countermeasure: "Current prototypes achieve 100 Mbps with clear path to Gbps speeds. The encoding overhead is offset by elimination of separate encryption layers."
    },
    {
      objection: "No technology can truly be quantum-resistant",
      countermeasure: "QBC security is based on geometric complexity and physical binding—mathematical structures that quantum computers cannot simplify. This is fundamentally different from computational hardness."
    }
  ];

  return (
    <section id="redteam" className="relative min-h-screen py-24 overflow-hidden bg-space-void">
      <div className="container px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-destructive font-mono text-sm tracking-widest uppercase mb-4">
              <QBCStaticText glyphHeight="0.875rem">Critical Analysis</QBCStaticText>
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              <QBCDecryptedText 
                text="Red Team Assessment"
                animateOn="view"
                glyphHeight="2.5rem"
                className="text-foreground"
              />
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              <QBCStaticText glyphHeight="1.125rem">
                We have subjected our technology to rigorous adversarial analysis. Here are the strongest objections and our countermeasures.
              </QBCStaticText>
            </p>
          </motion.div>

          {/* Objections Table */}
          <div className="space-y-6">
            {objections.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card/80 border border-border rounded-xl overflow-hidden"
              >
                {/* Objection */}
                <div className="p-6 bg-destructive/5 border-b border-destructive/20">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-mono text-xs text-destructive uppercase mb-2">
                        <QBCStaticText glyphHeight="0.75rem">{`Objection #${index + 1}`}</QBCStaticText>
                      </p>
                      <p className="text-foreground font-display font-bold">
                        <QBCStaticText glyphHeight="1rem">{item.objection}</QBCStaticText>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Countermeasure */}
                <div className="p-6 bg-quantum-green/5">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-quantum-green shrink-0 mt-0.5" />
                    <div>
                      <p className="font-mono text-xs text-quantum-green uppercase mb-2">
                        <QBCStaticText glyphHeight="0.75rem">Countermeasure</QBCStaticText>
                      </p>
                      <p className="text-muted-foreground">
                        <QBCStaticText glyphHeight="1rem">{item.countermeasure}</QBCStaticText>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-muted-foreground italic">
              <QBCStaticText glyphHeight="0.875rem">
                This analysis was conducted by independent security researchers and former intelligence community members. Full red team report available under NDA.
              </QBCStaticText>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default RedTeamSection;