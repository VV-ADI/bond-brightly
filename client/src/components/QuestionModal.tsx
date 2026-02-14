import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import AnswerReveal from "./AnswerReveal";
import { Sparkles, X } from "lucide-react";

const QuestionModal = () => {
  const { dailyQuestion, showQuestion, bothAnswered, answers, submitAnswer, dismissQuestion } = useApp();
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    submitAnswer(answer);
    setSubmitted(true);
  };

  if (!showQuestion) return null;

  const latestAnswer = answers[answers.length - 1];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-md px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="card-glass w-full max-w-lg p-7 relative overflow-hidden"
        >
          {/* Close button - only after both answered */}
          {bothAnswered && (
            <button onClick={dismissQuestion} className="absolute top-4 right-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all z-10">
              <X size={18} />
            </button>
          )}

          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-15 -translate-y-1/2 translate-x-1/4"
            style={{ background: "radial-gradient(circle, hsl(260 60% 62%), transparent 70%)" }}
          />

          <div className="flex items-center gap-3 relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-glow)" }}
            >
              <Sparkles size={18} className="text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-lg font-extrabold gradient-text">Daily Question</h2>
              <p className="text-[11px] text-muted-foreground">Answer to unlock today's chat</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-foreground leading-relaxed relative font-medium">{dailyQuestion}</p>

          {!submitted ? (
            <div className="mt-5 relative">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                className="input-styled resize-none"
              />
              <button onClick={handleSubmit} disabled={!answer.trim()} className="btn-primary mt-3">
                Submit Answer
              </button>
            </div>
          ) : !bothAnswered ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 flex items-center justify-center gap-3 rounded-xl bg-secondary/60 py-5">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} className="h-2 w-2 rounded-full bg-accent" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground font-medium">Waiting for your partner...</p>
            </motion.div>
          ) : (
            <div>
              {latestAnswer && <AnswerReveal answers={latestAnswer} />}
              <button onClick={dismissQuestion} className="btn-primary mt-4">
                Start Chatting
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuestionModal;
