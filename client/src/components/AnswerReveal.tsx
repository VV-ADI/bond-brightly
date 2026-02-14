import { motion } from "framer-motion";
import { Answer } from "@/types";
import { User, Heart } from "lucide-react";

interface AnswerRevealProps {
  answers: Answer;
}

const AnswerReveal = ({ answers }: AnswerRevealProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-xl border border-primary/15 bg-primary/5 p-4 relative overflow-hidden"
      >
        <div className="absolute top-2 right-2 opacity-10">
          <User size={32} />
        </div>
        <p className="text-[11px] font-bold text-primary mb-2 uppercase tracking-wider">Your Answer</p>
        <p className="text-sm text-foreground leading-relaxed">{answers.userAnswer}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-xl border border-accent/15 bg-accent/5 p-4 relative overflow-hidden"
      >
        <div className="absolute top-2 right-2 opacity-10">
          <Heart size={32} />
        </div>
        <p className="text-[11px] font-bold text-accent mb-2 uppercase tracking-wider">Partner's Answer</p>
        <p className="text-sm text-foreground leading-relaxed">{answers.partnerAnswer}</p>
      </motion.div>
    </div>
  );
};

export default AnswerReveal;
