import { QBCDecryptedText, QBCStaticText } from "@/components/QBCDecryptedText";
import qbcImage from "@/assets/images/qbc-encoding.png";
import { motion } from "motion/react";
import { Hexagon, Clock, Radio, GitBranch } from "lucide-react";

const QBCDeepSection = () => {
  const variables = [
    {
      icon: Hexagon,
      title: "Space",
      description: "Multi-dimensional lattice positioning within the geometric structure"
    },
    {
      icon: Clock,
      title: "Time",
      description: "Temporal evolution of the encoding pattern over transmission"
    },
    {
      icon: Radio,
      title: "Spectrum",
      description: "Frequency-domain distribution across available bandwidth"
    },
    {
      icon: GitBranch,
      title: "Fractalization",
      description: "Recursive self-similar patterns at multiple scales"
    }
  ];

  return (
    <section id="qbc-deep" className="relative min-h-screen py-24 overflow-hidden bg-space-void">
      <div className="container px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden glow-cyan">
                <img 
                  src={qbcImage} 
                  alt="QBC Geometric Encoding" 
                  className="w-full h-auto"
                />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <p className="text-primary font-mono text-sm tracking-widest uppercase mb-4">
                  <QBCStaticText glyphHeight="0.875rem">Core Protocol</QBCStaticText>
                </p>
                <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
                  <QBCDecryptedText 
                    text="QBC: Encoding Information"
                    animateOn="view"
                    glyphHeight="2.5rem"
                    className="text-foreground"
                  />
                  <br />
                  <span className="text-primary text-glow-cyan">
                    <QBCDecryptedText 
                      text="as Evolving Geometry"
                      animateOn="view"
                      glyphHeight="2.5rem"
                    />
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  <QBCStaticText glyphHeight="1.125rem">
                    Quantum Bit Code uses Metatrons Cube as the foundational lattice, encoding information not as static bits, but as dynamic geometric transformations that evolve across multiple dimensions.
                  </QBCStaticText>
                </p>
              </div>

              {/* Key Concepts */}
              <div>
                <h3 className="font-display font-bold text-foreground text-lg mb-4">
                  <QBCStaticText glyphHeight="1.125rem">Multi-Dimensional Variables</QBCStaticText>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {variables.map((variable, index) => (
                    <motion.div
                      key={variable.title}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="p-4 bg-card/50 border border-primary/20 rounded-lg"
                    >
                      <variable.icon className="w-6 h-6 text-primary mb-2" />
                      <h4 className="font-display font-bold text-foreground text-sm mb-1">
                        <QBCStaticText glyphHeight="0.875rem">{variable.title}</QBCStaticText>
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        <QBCStaticText glyphHeight="0.75rem">{variable.description}</QBCStaticText>
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Feature highlight */}
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <p className="text-primary font-mono text-sm">
                  <QBCStaticText glyphHeight="0.875rem">
                    LATTICE FOUNDATION: Based on the sacred geometry of Metatrons Cube—13 interconnected vertices creating 78 lines of connection.
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

export default QBCDeepSection;