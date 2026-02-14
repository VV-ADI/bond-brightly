import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { User, Clock, Camera, Sparkles, ChevronRight, ChevronLeft, Star, BookOpen, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const INTEREST_OPTIONS = ["Travel", "Music", "Movies", "Food", "Art", "Technology", "Sports", "Reading", "Gaming", "Photography"];
const HOBBY_OPTIONS = ["Cooking", "Hiking", "Dancing", "Painting", "Writing", "Yoga", "Cycling", "Gardening", "Singing", "Crafting"];

const PERSONAL_QUESTIONS = [
  "What is your love language?",
  "What makes you feel most appreciated?",
  "What is your biggest dream in life?",
  "How do you handle conflict in relationships?",
  "What is the most important quality in a friend or partner?",
];

const TOTAL_STEPS = 4;

const SetupPage = () => {
  const navigate = useNavigate();
  const { completeSetup } = useApp();

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [birthday, setBirthday] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [personalAnswers, setPersonalAnswers] = useState<Record<number, string>>({});
  const [questionTime, setQuestionTime] = useState("20:00");
  const [usernameError, setUsernameError] = useState("");

  const MOCK_TAKEN = ["admin", "test", "trustsync", "bondbrightly"];

  const validateUsername = (value: string) => {
    setUsername(value);
    if (!value.trim()) setUsernameError("Username is required");
    else if (MOCK_TAKEN.includes(value.toLowerCase())) setUsernameError("Username is already taken");
    else setUsernameError("");
  };

  const toggleItem = (item: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicture(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const updatePersonalAnswer = (index: number, answer: string) => {
    setPersonalAnswers(prev => ({ ...prev, [index]: answer }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return username.trim() && !usernameError && age.trim() && birthday.trim();
      case 2: return bio.trim();
      case 3: return interests.length > 0 && hobbies.length > 0;
      case 4: return Object.values(personalAnswers).filter(a => a.trim()).length >= 2;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    const answersArray = PERSONAL_QUESTIONS.map((q, i) => ({
      question: q,
      answer: personalAnswers[i] || "",
    })).filter(a => a.answer.trim());

    try {
      await completeSetup({
        username, age, birthday, bio, profilePicture, interests, hobbies,
        personalAnswers: answersArray,
        questionTime,
      });
      toast.success("Profile setup complete!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  const stepVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background animated-bg px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="card-glass w-full max-w-md p-8 relative z-10"
      >
        {/* Progress Bar */}
        <div className="flex items-center gap-1.5 mb-6">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-muted/60">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: i < step ? "100%" : "0%" }}
                transition={{ duration: 0.4 }}
                className="h-full rounded-full"
                style={{ background: "var(--gradient-primary)" }}
              />
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground text-center mb-4 font-medium">Step {step} of {TOTAL_STEPS}</p>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-4">
              <div className="text-center mb-2">
                <h1 className="font-display text-xl font-extrabold gradient-text">Basic Info</h1>
                <p className="text-xs text-muted-foreground mt-1">Let's start with the basics</p>
              </div>

              <div className="flex justify-center">
                <label className="cursor-pointer group">
                  <div className="relative h-20 w-20 rounded-full border-2 border-dashed border-border hover:border-primary/40 transition-all flex items-center justify-center overflow-hidden bg-muted/40">
                    {profilePicture ? (
                      <img src={profilePicture} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <Camera size={24} className="text-muted-foreground group-hover:text-accent transition-colors" />
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <p className="text-[10px] text-muted-foreground text-center mt-1.5">Add photo</p>
                </label>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                  <User size={14} className="text-accent" /> Username
                </label>
                <input type="text" value={username} onChange={(e) => validateUsername(e.target.value)} placeholder="Choose a unique username" className="input-styled" />
                {usernameError && <p className="mt-1 text-xs text-destructive">{usernameError}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 text-sm font-medium text-foreground block">Age</label>
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" className="input-styled" min="13" max="120" />
                </div>
                <div>
                  <label className="mb-1.5 text-sm font-medium text-foreground block">Birthday</label>
                  <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="input-styled" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-4">
              <div className="text-center mb-2">
                <h1 className="font-display text-xl font-extrabold gradient-text">About You</h1>
                <p className="text-xs text-muted-foreground mt-1">Tell others a little about yourself</p>
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                  <BookOpen size={14} className="text-accent" /> Short Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a few words about yourself..."
                  rows={4}
                  className="input-styled resize-none"
                  maxLength={200}
                />
                <p className="text-[10px] text-muted-foreground text-right mt-1">{bio.length}/200</p>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
              <div className="text-center mb-2">
                <h1 className="font-display text-xl font-extrabold gradient-text">Interests & Hobbies</h1>
                <p className="text-xs text-muted-foreground mt-1">Select what resonates with you</p>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Star size={14} className="text-accent" /> Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map(item => (
                    <button key={item} type="button" onClick={() => toggleItem(item, interests, setInterests)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all ${interests.includes(item) ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted/40 border-border/50 text-muted-foreground hover:border-primary/20"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sparkles size={14} className="text-accent" /> Hobbies
                </label>
                <div className="flex flex-wrap gap-2">
                  {HOBBY_OPTIONS.map(item => (
                    <button key={item} type="button" onClick={() => toggleItem(item, hobbies, setHobbies)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all ${hobbies.includes(item) ? "bg-accent/10 border-accent/30 text-accent" : "bg-muted/40 border-border/50 text-muted-foreground hover:border-accent/20"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-4">
              <div className="text-center mb-2">
                <h1 className="font-display text-xl font-extrabold gradient-text">Personal Questions</h1>
                <p className="text-xs text-muted-foreground mt-1">Answer at least 2 questions to continue</p>
              </div>

              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {PERSONAL_QUESTIONS.map((question, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-xl border border-border/50 bg-card/60 p-3.5 backdrop-blur-sm"
                  >
                    <label className="flex items-start gap-2 text-sm font-medium text-foreground mb-2">
                      <MessageSquare size={14} className="text-accent mt-0.5 shrink-0" />
                      {question}
                    </label>
                    <input
                      type="text"
                      value={personalAnswers[i] || ""}
                      onChange={(e) => updatePersonalAnswer(i, e.target.value)}
                      placeholder="Your answer..."
                      className="input-styled text-sm"
                    />
                  </motion.div>
                ))}
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Clock size={14} className="text-accent" /> Daily Question Time
                </label>
                <input type="time" value={questionTime} onChange={(e) => setQuestionTime(e.target.value)} className="input-styled" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-card/80 px-4 py-3 text-sm font-semibold text-muted-foreground transition-all hover:text-foreground hover:border-primary/20">
              <ChevronLeft size={16} /> Back
            </button>
          )}
          <button onClick={handleNext} disabled={!canProceed()} className="btn-primary flex items-center justify-center gap-1.5">
            {step === TOTAL_STEPS ? "Complete Setup" : "Continue"} <ChevronRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SetupPage;
