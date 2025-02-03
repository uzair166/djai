import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface SuccessAnimationProps {
  show: boolean;
  message: string;
}

export function SuccessAnimation({ show, message }: SuccessAnimationProps) {
  const [confetti, setConfetti] = useState<{ id: number; style: any }[]>([]);

  useEffect(() => {
    if (show) {
      // Create confetti pieces
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          top: `-20px`,
          backgroundColor: [
            "#22c55e", // green
            "#3b82f6", // blue
            "#ec4899", // pink
            "#f59e0b", // amber
          ][Math.floor(Math.random() * 4)],
          animationDelay: `${Math.random() * 2}s`,
        },
      }));
      setConfetti(pieces);

      // Cleanup confetti after animation
      const timer = setTimeout(() => {
        setConfetti([]);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-card p-6 rounded-lg shadow-lg text-center playlist-success"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Success!</h3>
              <p className="text-muted-foreground">{message}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="success-confetti"
          style={piece.style}
        />
      ))}
    </>
  );
} 