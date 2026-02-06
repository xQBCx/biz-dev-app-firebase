import { motion } from "framer-motion";
import { Rocket, Sparkles, Bell, Target, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ComingSoon = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "You're on the list!",
        description: "We'll notify you when SmartLink OS launches.",
      });
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="max-w-4xl w-full text-center relative z-10">
        {/* Floating icon */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8 flex justify-center"
        >
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            <Rocket className="w-24 h-24 text-primary relative z-10" />
          </motion.div>
        </motion.div>

        {/* Main heading */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Something Amazing
            <br />
            is Coming Soon
          </h1>
        </motion.div>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto"
        >
          SmartLink OS is being crafted with care. Get notified when we launch and be among the first to experience the future of property management.
        </motion.p>

        {/* Email signup */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          onSubmit={handleNotify}
          className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-12"
        >
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 h-12 text-lg"
            required
          />
          <Button type="submit" size="lg" className="h-12 px-8">
            <Bell className="w-4 h-4 mr-2" />
            Notify Me
          </Button>
        </motion.form>

        {/* Feature highlights */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          {[
            { icon: Target, title: "Streamlined Operations", desc: "Manage everything in one place" },
            { icon: Zap, title: "Lightning Fast", desc: "Built for speed and efficiency" },
            { icon: Shield, title: "Secure & Reliable", desc: "Enterprise-grade security" },
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ duration: 0.2 }}
              className="p-8 rounded-2xl bg-card/80 backdrop-blur-md border border-border shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Sparkles decoration */}
        <motion.div
          animate={{ 
            rotate: 360,
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear" 
          }}
          className="absolute top-1/4 right-10 opacity-20"
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>
        <motion.div
          animate={{ 
            rotate: -360,
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "linear" 
          }}
          className="absolute bottom-1/4 left-10 opacity-20"
        >
          <Sparkles className="w-6 h-6 text-accent" />
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon;
