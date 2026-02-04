import { QBCDecryptedText, QBCStaticText } from "@/components/QBCDecryptedText";
import defenseImage from "@/assets/images/defense-command.png";
import infrastructureImage from "@/assets/images/critical-infrastructure.png";
import { motion } from "motion/react";
import { Shield, Zap, Globe, Satellite } from "lucide-react";

const DomainsSection = () => {
  const domains = [
    {
      icon: Shield,
      title: "Defense & Intelligence",
      description: "Sovereign communications for military and intelligence operations that cannot be compromised by adversaries—regardless of their computational capabilities.",
      image: defenseImage,
      features: ["Unbreakable C2 links", "Covert SIGINT", "Anti-ASAT resilience"]
    },
    {
      icon: Zap,
      title: "Critical Infrastructure",
      description: "Protection for power grids, water systems, and telecommunications against physical and cyber-physical attacks.",
      image: infrastructureImage,
      features: ["SCADA security", "Grid resilience", "Emergency failover"]
    },
    {
      icon: Globe,
      title: "Financial Sovereignty",
      description: "Secure communications for central banks, sovereign wealth funds, and critical financial infrastructure.",
      image: null,
      features: ["Transaction security", "CBDC infrastructure", "Audit immunity"]
    },
    {
      icon: Satellite,
      title: "Space & Satellite Systems",
      description: "Protection for satellite constellations and deep-space communications against jamming and interception.",
      image: null,
      features: ["LEO/MEO/GEO coverage", "Deep space links", "Debris-resilient"]
    }
  ];

  return (
    <section id="domains" className="relative min-h-screen py-24 overflow-hidden bg-space-deep">
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
            <p className="text-primary font-mono text-sm tracking-widest uppercase mb-4">
              <QBCStaticText glyphHeight="0.875rem">Application Domains</QBCStaticText>
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              <QBCDecryptedText 
                text="Multi-Domain Operations"
                animateOn="view"
                glyphHeight="2.5rem"
                className="text-foreground"
              />
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              <QBCStaticText glyphHeight="1.125rem">
                Signal Sovereignty technology applies across every sector where secure, resilient communications are mission-critical.
              </QBCStaticText>
            </p>
          </motion.div>

          {/* Domains Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {domains.map((domain, index) => (
              <motion.div
                key={domain.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative bg-card/80 backdrop-blur-sm border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-300"
              >
                {/* Image or gradient background */}
                <div className="relative h-48 overflow-hidden">
                  {domain.image ? (
                    <img 
                      src={domain.image} 
                      alt={domain.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-quantum-purple/10 to-transparent" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  
                  {/* Icon overlay */}
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center">
                      <domain.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-display font-bold text-foreground mb-2">
                    <QBCStaticText glyphHeight="1.25rem">{domain.title}</QBCStaticText>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    <QBCStaticText glyphHeight="0.875rem">{domain.description}</QBCStaticText>
                  </p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {domain.features.map((feature) => (
                      <span 
                        key={feature}
                        className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-mono text-primary"
                      >
                        <QBCStaticText glyphHeight="0.75rem">{feature}</QBCStaticText>
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DomainsSection;