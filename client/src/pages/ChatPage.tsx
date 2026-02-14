import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import MessageBubble from "@/components/MessageBubble";
import QuestionModal from "@/components/QuestionModal";
import { ArrowLeft, Send, Phone, Video, MoreVertical } from "lucide-react";

const ChatPage = () => {
  const navigate = useNavigate();
  const {
    friends,
    messages,
    sendMessage,
    dailyQuestionAnswered,
    triggerQuestion,
    showQuestion,
    activeFriendId,
    isConnected,
  } = useApp();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeFriend = friends.find(f => f.id === activeFriendId) || friends[0];

  // Trigger daily question when entering chat (once per session)
  useEffect(() => {
    if (activeFriend && !dailyQuestionAnswered && !showQuestion) {
      triggerQuestion();
    }
  }, [activeFriend?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || (!dailyQuestionAnswered && activeFriend)) return;
    sendMessage(input.trim());
    setInput("");
  };

  if (!activeFriend) {
    navigate("/dashboard");
    return null;
  }

  const chatLocked = !dailyQuestionAnswered;

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Bar */}
      <header className="border-b border-border/60 bg-card/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-3 py-2.5">
          <button onClick={() => navigate("/dashboard")} className="rounded-xl p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                {activeFriend.username[0].toUpperCase()}
              </div>
              {activeFriend.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-accent" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{activeFriend.username}</p>
              <p className="text-[11px] text-muted-foreground">
                {isTyping ? "typing..." : activeFriend.isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Connection indicator */}
            <div className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-400'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
            <button className="rounded-xl p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <Phone size={18} />
            </button>
            <button className="rounded-xl p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <Video size={18} />
            </button>
            <button className="rounded-xl p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-4 py-4 mx-auto w-full max-w-2xl" style={{ background: "var(--gradient-surface)" }}>
        {/* Empty State */}
        {messages.length === 0 && !chatLocked && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-16 w-16 rounded-full bg-secondary/60 flex items-center justify-center mb-3">
              <Send size={24} className="text-accent" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Say hello to start the conversation</p>
          </div>
        )}

        {/* Chat locked overlay */}
        {chatLocked && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-3">
              <span className="text-2xl">🔒</span>
            </div>
            <p className="text-sm font-medium text-foreground">Answer today's question first</p>
            <p className="text-xs text-muted-foreground mt-1">Complete the daily question to unlock chat</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={msg.id || i} message={msg} />
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start mb-3">
              <div className="bubble-friend px-4 py-3 flex items-center gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} animate={{ y: [-2, 2, -2] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Bar */}
      <div className="border-t border-border/60 bg-card/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-3 py-2.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={chatLocked ? "Answer the daily question first..." : "Type a message..."}
            className="input-styled flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={chatLocked}
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleSend}
            disabled={!input.trim() || chatLocked}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "var(--gradient-primary)", boxShadow: input.trim() && !chatLocked ? "var(--shadow-button)" : "none" }}
          >
            <Send size={16} />
          </motion.button>
        </div>
      </div>

      {/* Daily Question Modal */}
      <QuestionModal />
    </div>
  );
};

export default ChatPage;
