import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icons, WeldSparkIcon } from "@/components/icons/IndustrialIcons";
import { cn } from "@/lib/utils";

interface VoiceCommandsProps {
  isListening: boolean;
  onToggleListening: () => void;
  lastCommand?: string;
}

const availableCommands = [
  { command: "Log undercut", description: "Record undercut defect" },
  { command: "Log porosity", description: "Record porosity defect" },
  { command: "Next support", description: "Move to next pipe support" },
  { command: "Take photo", description: "Capture current view" },
  { command: "Start recording", description: "Begin video capture" },
  { command: "Mark critical", description: "Flag as critical defect" },
];

export function VoiceCommands({
  isListening,
  onToggleListening,
  lastCommand,
}: VoiceCommandsProps) {
  const [showCommands, setShowCommands] = useState(false);

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 px-4 sm:bottom-6">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="flex flex-col items-center gap-2 sm:gap-3"
      >
        {/* Command feedback */}
        <AnimatePresence>
          {lastCommand && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-[280px] truncate rounded-full border border-accent/30 bg-card/90 px-3 py-2 text-center backdrop-blur-sm sm:max-w-none sm:px-4"
            >
              <span className="text-xs text-accent sm:text-sm">"{lastCommand}"</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Available commands popover */}
        <AnimatePresence>
          {showCommands && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-2 max-w-[90vw] rounded-xl border border-border bg-card/95 p-3 shadow-industrial backdrop-blur-sm sm:max-w-md sm:p-4"
            >
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground sm:mb-3">
                Voice Commands
              </p>
              <div className="grid grid-cols-1 gap-2 xs:grid-cols-2">
                {availableCommands.map((cmd) => (
                  <div
                    key={cmd.command}
                    className="rounded-lg border border-border/50 bg-secondary/50 px-2 py-1.5 sm:px-3 sm:py-2"
                  >
                    <p className="text-xs font-bold text-accent sm:text-sm">
                      "{cmd.command}"
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cmd.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main voice button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowCommands(!showCommands)}
            className="h-10 w-10 rounded-full sm:h-12 sm:w-12"
          >
            <Icons.settings className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <motion.button
            onClick={onToggleListening}
            className={cn(
              "relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 sm:h-20 sm:w-20",
              isListening
                ? "bg-gradient-to-r from-accent to-orange-600 shadow-glow-accent"
                : "bg-secondary hover:bg-secondary/80"
            )}
            whileTap={{ scale: 0.95 }}
          >
            {isListening && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-accent"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-accent"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                />
              </>
            )}
            <Icons.mic
              className={cn(
                "h-6 w-6 sm:h-8 sm:w-8",
                isListening ? "text-white" : "text-muted-foreground"
              )}
            />
          </motion.button>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full sm:h-12 sm:w-12"
          >
            <Icons.camera className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          {isListening ? "Listening..." : "Tap to enable voice"}
        </p>
      </motion.div>
    </div>
  );
}
