import { motion } from "framer-motion";
import { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.sender === "user";
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      <div className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed ${isUser ? "bubble-user" : "bubble-friend"}`}>
        <p>{message.text}</p>
        <p className={`mt-1.5 text-[10px] ${isUser ? "text-primary-foreground/50" : "text-muted-foreground/70"}`}>{time}</p>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
