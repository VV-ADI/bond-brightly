import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, User, Heart, Clock, Star, Sparkles, LogOut } from "lucide-react";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useApp();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background animated-bg">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button onClick={() => navigate("/dashboard")} className="rounded-xl p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">Settings</h1>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl px-4 py-6 space-y-5">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-glass p-6 text-center">
          <div className="mx-auto h-20 w-20 rounded-full overflow-hidden border-2 border-primary/20 mb-3">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                {user.username[0].toUpperCase()}
              </div>
            )}
          </div>
          <h2 className="font-display text-lg font-bold text-foreground">{user.username}</h2>
          <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
          {user.bio && <p className="text-sm text-foreground/80 mt-2">{user.bio}</p>}
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-glass p-5 space-y-4">
          <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
            <User size={14} className="text-accent" /> Profile Details
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Age</p>
              <p className="text-foreground font-medium">{user.age || "—"}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Birthday</p>
              <p className="text-foreground font-medium">{user.birthday || "—"}</p>
            </div>
          </div>

          {user.interests.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-2 flex items-center gap-1"><Star size={10} /> Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {user.interests.map(i => (
                  <span key={i} className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-[11px] font-medium text-primary">{i}</span>
                ))}
              </div>
            </div>
          )}

          {user.hobbies.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-2 flex items-center gap-1"><Sparkles size={10} /> Hobbies</p>
              <div className="flex flex-wrap gap-1.5">
                {user.hobbies.map(h => (
                  <span key={h} className="rounded-full bg-accent/10 border border-accent/20 px-2.5 py-1 text-[11px] font-medium text-accent">{h}</span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl bg-muted/40 p-3 text-sm">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1 flex items-center gap-1"><Clock size={10} /> Question Time</p>
              <p className="text-foreground font-medium">{user.questionTime || "—"}</p>
            </div>

          {user.personalAnswers && user.personalAnswers.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-2 flex items-center gap-1"><Heart size={10} /> Personal Answers</p>
              <div className="space-y-2">
                {user.personalAnswers.map((pa, i) => (
                  <div key={i} className="rounded-xl bg-muted/40 p-3">
                    <p className="text-[11px] text-muted-foreground font-medium mb-1">{pa.question}</p>
                    <p className="text-sm text-foreground">{pa.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive transition-all hover:bg-destructive/10"
        >
          <LogOut size={16} /> Log Out
        </motion.button>
      </main>
    </div>
  );
};

export default SettingsPage;
