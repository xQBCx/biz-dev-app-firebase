import { QBCDecryptedText, QBCStaticText } from "@/components/QBCDecryptedText";
import meshImage from "@/assets/images/mesh34-earth.png";
import { motion } from "motion/react";
import { Mountain, Droplets, Cloud, Wifi, Layers } from "lucide-react";
import { useState } from "react";

const MESH34DeepSection = () => {
  const [activeTab, setActiveTab] = useState("earth");

  const media = [
    { id: "earth", icon: Mountain, label: "Earth", description: "Seismic and electromagnetic propagation through geological strata" },
    { id: "water", icon: Droplets, label: "Water", description: "Acoustic and low-frequency transmission through oceanic pathways" },
    { id: "vapor", icon: Cloud, label: "Vapor/Atmosphere", description: "Ionospheric and tropospheric signal propagation" },
    { id: "classical", icon: Wifi, label: "Classical Infrastructure", description: "Integration with existing fiber, satellite, and radio networks" }
  ];

  return (
    <section id="mesh34-deep" className="relative min-h-screen py-24 overflow-hidden bg-space-deep">
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
            <p className="text-quantum-blue font-mono text-sm tracking-widest uppercase mb-4">
              <QBCStaticText glyphHeight="0.875rem">Hybrid Transport Protocol</QBCStaticText>
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              <QBCDecryptedText 
                text="MESH 34:"
                animateOn="view"
                glyphHeight="2.5rem"
                className="text-foreground"
              />
              <span className="text-quantum-blue"> </span>
              <span className="text-quantum-blue">
                <QBCDecryptedText 
                  text="Pan-Medium Connectivity"
                  animateOn="view"
                  glyphHeight="2.5rem"
                />
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              <QBCStaticText glyphHeight="1.125rem">
                MESH 34 enables QBC-encoded signals to traverse any physical medium—creating a truly sovereign communication infrastructure independent of any single pathway.
              </QBCStaticText>
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Interactive Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden border border-quantum-blue/30">
                <img 
                  src={meshImage} 
                  alt="MESH 34 Earth Signal Routing" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              </div>
              
              {/* Legend */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-quantum-blue/20 border border-quantum-blue/40 rounded-full text-xs font-mono text-quantum-blue">
                  <QBCStaticText glyphHeight="0.75rem">Seismic Waves</QBCStaticText>
                </span>
                <span className="px-3 py-1 bg-quantum-orange/20 border border-quantum-orange/40 rounded-full text-xs font-mono text-quantum-orange">
                  <QBCStaticText glyphHeight="0.75rem">EM Signals</QBCStaticText>
                </span>
                <span className="px-3 py-1 bg-quantum-green/20 border border-quantum-green/40 rounded-full text-xs font-mono text-quantum-green">
                  <QBCStaticText glyphHeight="0.75rem">Geological Layers</QBCStaticText>
                </span>
              </div>
            </motion.div>

            {/* Tabs and Content */}
            <div className="space-y-6">
              <h3 className="font-display font-bold text-foreground text-xl flex items-center gap-2">
                <Layers className="w-5 h-5 text-quantum-blue" />
                <QBCStaticText glyphHeight="1.25rem">Multi-Modal Medium Awareness</QBCStaticText>
              </h3>

              {/* Tab Buttons */}
              <div className="flex flex-wrap gap-2">
                {media.map((medium) => (
                  <button
                    key={medium.id}
                    onClick={() => setActiveTab(medium.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      activeTab === medium.id
                        ? "bg-quantum-blue/20 border-quantum-blue text-quantum-blue"
                        : "bg-card/50 border-border text-muted-foreground hover:border-quantum-blue/50"
                    }`}
                  >
                    <medium.icon className="w-4 h-4" />
                    <span className="text-sm font-mono">
                      <QBCStaticText glyphHeight="0.875rem">{medium.label}</QBCStaticText>
                    </span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-6 bg-card/80 border border-quantum-blue/20 rounded-lg"
              >
                {media.find(m => m.id === activeTab) && (
                  <>
                    <h4 className="font-display font-bold text-foreground text-lg mb-2">
                      <QBCStaticText glyphHeight="1.125rem">
                        {`${media.find(m => m.id === activeTab)?.label} Medium`}
                      </QBCStaticText>
                    </h4>
                    <p className="text-muted-foreground">
                      <QBCStaticText glyphHeight="1rem">
                        {media.find(m => m.id === activeTab)?.description}
                      </QBCStaticText>
                    </p>
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-quantum-blue font-mono">
                        <QBCStaticText glyphHeight="0.875rem">
                          MESH 34 dynamically routes signals through optimal pathways based on real-time environmental conditions and threat assessment.
                        </QBCStaticText>
                      </p>
                    </div>
                  </>
                )}
              </motion.div>

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-card/50 border border-border rounded-lg">
                  <h4 className="font-mono text-sm text-quantum-blue mb-2">
                    <QBCStaticText glyphHeight="0.875rem">Shape Extraction</QBCStaticText>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    <QBCStaticText glyphHeight="0.75rem">Adaptive signal shaping based on medium characteristics</QBCStaticText>
                  </p>
                </div>
                <div className="p-4 bg-card/50 border border-border rounded-lg">
                  <h4 className="font-mono text-sm text-quantum-blue mb-2">
                    <QBCStaticText glyphHeight="0.875rem">Signal Routing</QBCStaticText>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    <QBCStaticText glyphHeight="0.75rem">Intelligent path selection for optimal delivery</QBCStaticText>
                  </p>
                </div>
                <div className="p-4 bg-card/50 border border-border rounded-lg">
                  <h4 className="font-mono text-sm text-quantum-blue mb-2">
                    <QBCStaticText glyphHeight="0.875rem">Geologic Composition</QBCStaticText>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    <QBCStaticText glyphHeight="0.75rem">Analysis of subsurface material properties</QBCStaticText>
                  </p>
                </div>
                <div className="p-4 bg-card/50 border border-border rounded-lg">
                  <h4 className="font-mono text-sm text-quantum-blue mb-2">
                    <QBCStaticText glyphHeight="0.875rem">FractalPulse Sim</QBCStaticText>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    <QBCStaticText glyphHeight="0.75rem">Predictive modeling of signal propagation</QBCStaticText>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MESH34DeepSection;