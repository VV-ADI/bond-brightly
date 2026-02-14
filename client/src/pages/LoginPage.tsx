import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Heart, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle, isLoggedIn, isSetupComplete, loading } = useApp();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && isLoggedIn) {
      if (isSetupComplete) {
        navigate("/dashboard");
      } else {
        navigate("/setup");
      }
    }
  }, [loading, isLoggedIn, isSetupComplete, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (isSignup && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      if (isSignup) {
        const success = await signup(email, password);
        if (success) {
          toast.success("Account created! Redirecting to setup...");
          navigate("/setup");
        } else {
          toast.error("Signup failed. Try a different email.");
        }
      } else {
        const success = await login(email, password);
        if (success) {
          toast.success("Welcome back!");
          navigate("/setup");
        } else {
          toast.error("Invalid email or password. If you just signed up, check your email for verification.");
        }
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent"
          />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background animated-bg px-4">
      <div className="relative z-10 w-full max-w-sm">
        <motion.div
          animate={{ y: [-8, 8, -8], x: [-4, 4, -4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-16 -right-8 h-24 w-24 rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, hsl(260 60% 62% / 0.3), transparent 70%)" }}
        />
        <motion.div
          animate={{ y: [6, -6, 6], x: [3, -3, 3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-12 -left-10 h-32 w-32 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, hsl(224 76% 58% / 0.3), transparent 70%)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="card-glass w-full p-8 text-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "backOut" }}
            className="mx-auto mb-4 flex h-[68px] w-[68px] items-center justify-center rounded-[20px]"
            style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-glow)" }}
          >
            <Heart size={28} className="text-primary-foreground" strokeWidth={2.5} />
          </motion.div>

          <h1 className="font-display text-[28px] font-extrabold gradient-text leading-tight">Bond Brightly</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Build deeper connections, one question at a time</p>

          {/* Tabs */}
          <div className="mt-6 flex rounded-xl bg-muted/60 p-1">
            <button
              onClick={() => setIsSignup(false)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${!isSignup ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsSignup(true)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${isSignup ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-3 text-left">
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="input-styled pl-10"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 characters)"
                className="input-styled pl-10 pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {isSignup && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="input-styled pl-10"
                />
              </motion.div>
            )}
            <button type="submit" disabled={submitting} className="btn-primary mt-2">
              {submitting ? "Please wait..." : isSignup ? "Create Account" : "Log In"}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          {/* Google Sign-In */}
          <button
            onClick={loginWithGoogle}
            className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-xl border border-border/60 bg-card/80 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted/80 hover:shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-5 text-[11px] text-muted-foreground/70">
            By continuing, you agree to our Terms & Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
