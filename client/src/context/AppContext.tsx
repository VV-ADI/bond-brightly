import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Friend, Message, Answer } from "@/types";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";

interface AppState {
  isLoggedIn: boolean;
  isSetupComplete: boolean;
  user: User | null;
  friends: Friend[];
  messages: Message[];
  answers: Answer[];
  dailyQuestion: string;
  showQuestion: boolean;
  bothAnswered: boolean;
  dailyQuestionAnswered: boolean;
  searchResults: Friend[];
  activeFriendId: string | null;
  isConnected: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  completeSetup: (data: Omit<User, "id" | "email">) => Promise<void>;
  addFriend: (friendId: string, relationshipType?: string) => Promise<boolean>;
  removeFriend: (friendshipId: string) => void;
  sendMessage: (text: string) => void;
  submitAnswer: (answer: string) => void;
  triggerQuestion: () => void;
  dismissQuestion: () => void;
  searchUsers: (query: string) => void;
  clearSearch: () => void;
  setActiveFriend: (friendId: string | null) => void;
  loadMessages: (friendId: string) => Promise<void>;
  refreshFriends: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

const DAILY_QUESTIONS = [
  "What was the fun moment we had together?",
  "What is one thing you appreciate about our relationship?",
  "What is your favorite memory of us?",
  "What made you smile today?",
  "What is something new you learned about me recently?",
  "What is one goal we should achieve together?",
  "What song reminds you of us?",
  "What is the best advice I have ever given you?",
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [dailyQuestion, setDailyQuestion] = useState(DAILY_QUESTIONS[0]);
  const [showQuestion, setShowQuestion] = useState(false);
  const [bothAnswered, setBothAnswered] = useState(false);
  const [dailyQuestionAnswered, setDailyQuestionAnswered] = useState(false);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [activeFriendId, setActiveFriendIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { isConnected, joinChat, sendMessage: socketSendMessage, onNewMessage, onBothAnswered, onUserOnline } = useSocket(authUserId);

  // ─── Check existing session on mount ───
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setAuthUserId(session.user.id);
          setIsLoggedIn(true);

          const profile = await api.getProfile(session.user.id);
          if (profile && profile.username) {
            setUser({
              id: profile.id,
              username: profile.username,
              email: profile.email || session.user.email || '',
              age: profile.age || '',
              birthday: profile.birthday || '',
              interests: profile.interests || [],
              hobbies: profile.hobbies || [],
              bio: profile.bio || '',
              profilePicture: profile.profile_picture || '',
              personalAnswers: profile.personal_answers || [],
              questionTime: profile.question_time || '20:00',
            });
            setIsSetupComplete(true);

            const friendsList = await api.getFriends(session.user.id);
            if (Array.isArray(friendsList)) {
              setFriends(friendsList.map((f: any) => ({
                id: f.id,
                username: f.username,
                avatar: f.profile_picture,
                isOnline: false,
                relationshipType: f.relationship_type,
                friendshipId: f.friendship_id,
              })));
            }
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setIsSetupComplete(false);
        setUser(null);
        setAuthUserId(null);
        setFriends([]);
        setMessages([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─── Listen for real-time messages ───
  useEffect(() => {
    if (!authUserId) return;

    const cleanup = onNewMessage((msg: any) => {
      const newMsg: Message = {
        id: msg.id,
        sender: msg.sender_id === authUserId ? 'user' : 'friend',
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        text: msg.content,
        timestamp: msg.created_at,
      };
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return cleanup;
  }, [authUserId, onNewMessage]);

  // ─── Listen for both answered ───
  useEffect(() => {
    if (!authUserId) return;
    const cleanup = onBothAnswered((data: any) => {
      setBothAnswered(true);
      setDailyQuestionAnswered(true);
      setAnswers(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            partnerAnswer: data.partnerAnswer,
          };
        }
        return updated;
      });
    });
    return cleanup;
  }, [authUserId, onBothAnswered]);

  // ─── Listen for online status ───
  useEffect(() => {
    if (!authUserId) return;
    const cleanup = onUserOnline(({ userId, isOnline }) => {
      setFriends(prev =>
        prev.map(f => f.id === userId ? { ...f, isOnline } : f)
      );
    });
    return cleanup;
  }, [authUserId, onUserOnline]);

  // ─── Auth Functions ───
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      setAuthUserId(data.user.id);
      setIsLoggedIn(true);

      const profile = await api.getProfile(data.user.id);
      if (profile && profile.username) {
        setUser({
          id: profile.id,
          username: profile.username,
          email: profile.email || email,
          age: profile.age || '',
          birthday: profile.birthday || '',
          interests: profile.interests || [],
          hobbies: profile.hobbies || [],
          bio: profile.bio || '',
          profilePicture: profile.profile_picture || '',
          personalAnswers: profile.personal_answers || [],
          questionTime: profile.question_time || '20:00',
        });
        setIsSetupComplete(true);

        const friendsList = await api.getFriends(data.user.id);
        if (Array.isArray(friendsList)) {
          setFriends(friendsList.map((f: any) => ({
            id: f.id,
            username: f.username,
            avatar: f.profile_picture,
            isOnline: false,
            relationshipType: f.relationship_type,
            friendshipId: f.friendship_id,
          })));
        }
      }

      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      return false;
    }
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;

      if (data.user) {
        // If email confirmation is disabled, user is immediately confirmed
        if (data.session) {
          setAuthUserId(data.user.id);
          setIsLoggedIn(true);
        }
        // If email confirmation is enabled, user needs to verify email first
        // data.session will be null in that case
      }
      return true;
    } catch (err: any) {
      console.error('Signup error:', err);
      return false;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/setup',
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Google login error:', err);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setIsSetupComplete(false);
    setUser(null);
    setAuthUserId(null);
    setFriends([]);
    setMessages([]);
    setDailyQuestionAnswered(false);
  };

  // ─── Setup ───
  const completeSetup = async (data: Omit<User, "id" | "email">) => {
    if (!authUserId) return;

    const { data: { user: authUser } } = await supabase.auth.getUser();
    const email = authUser?.email || '';

    await api.upsertProfile({
      user_id: authUserId,
      username: data.username,
      email,
      age: data.age,
      birthday: data.birthday,
      bio: data.bio,
      profile_picture: data.profilePicture,
      interests: data.interests,
      hobbies: data.hobbies,
      personal_answers: data.personalAnswers,
      question_time: data.questionTime,
    });

    setUser({
      id: authUserId,
      email,
      ...data,
    });
    setIsSetupComplete(true);
  };

  // ─── Friends ───
  const addFriend = async (friendId: string, relationshipType?: string): Promise<boolean> => {
    if (!authUserId) return false;
    try {
      const result = await api.addFriend(authUserId, friendId, relationshipType || 'Friends');
      if (result.error) return false;
      await refreshFriends();
      setSearchResults([]);
      return true;
    } catch {
      return false;
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      await api.removeFriend(friendshipId);
      setFriends(prev => prev.filter(f => f.friendshipId !== friendshipId));
    } catch (err) {
      console.error('Remove friend error:', err);
    }
  };

  const refreshFriends = async () => {
    if (!authUserId) return;
    const friendsList = await api.getFriends(authUserId);
    if (Array.isArray(friendsList)) {
      setFriends(friendsList.map((f: any) => ({
        id: f.id,
        username: f.username,
        avatar: f.profile_picture,
        isOnline: false,
        relationshipType: f.relationship_type,
        friendshipId: f.friendship_id,
      })));
    }
  };

  // ─── Chat ───
  const loadMessages = async (friendId: string) => {
    if (!authUserId) return;
    setActiveFriendIdState(friendId);
    joinChat(friendId);

    const msgs = await api.getMessages(authUserId, friendId);
    if (Array.isArray(msgs)) {
      setMessages(msgs.map((m: any) => ({
        id: m.id,
        sender: m.sender_id === authUserId ? 'user' : 'friend',
        senderId: m.sender_id,
        receiverId: m.receiver_id,
        text: m.content,
        timestamp: m.created_at,
      })));
    }

    // Check today's answers
    const todayAnswers = await api.getTodayAnswers(authUserId, friendId);
    if (Array.isArray(todayAnswers) && todayAnswers.length > 0) {
      const myAnswer = todayAnswers.find((a: any) => a.user_id === authUserId);
      const theirAnswer = todayAnswers.find((a: any) => a.user_id === friendId);

      if (myAnswer && theirAnswer) {
        setDailyQuestionAnswered(true);
        setBothAnswered(true);
        setAnswers([{
          questionId: myAnswer.id,
          userAnswer: myAnswer.answer,
          partnerAnswer: theirAnswer.answer,
        }]);
      } else if (myAnswer) {
        setDailyQuestionAnswered(false);
        setBothAnswered(false);
      } else {
        setDailyQuestionAnswered(false);
        setBothAnswered(false);
        setAnswers([]);
      }
    } else {
      setDailyQuestionAnswered(false);
      setBothAnswered(false);
      setAnswers([]);
    }
  };

  const sendMessageFn = (text: string) => {
    if (!activeFriendId || !authUserId) return;
    socketSendMessage(activeFriendId, text);
  };

  // ─── Daily Question ───
  const submitAnswerFn = async (answer: string) => {
    if (!authUserId || !activeFriendId) return;

    const newAnswer: Answer = {
      questionId: crypto.randomUUID(),
      userAnswer: answer,
      partnerAnswer: "",
    };
    setAnswers(prev => [...prev, newAnswer]);

    await api.submitAnswer(authUserId, activeFriendId, dailyQuestion, answer);
  };

  const triggerQuestion = () => {
    const randomQ = DAILY_QUESTIONS[Math.floor(Math.random() * DAILY_QUESTIONS.length)];
    setDailyQuestion(randomQ);
    setShowQuestion(true);
    setBothAnswered(false);
  };

  const dismissQuestion = () => {
    setShowQuestion(false);
  };

  // ─── Search ───
  const searchUsersFn = async (query: string) => {
    if (!query.trim() || !authUserId) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await api.searchUsers(query, authUserId);
      if (Array.isArray(results)) {
        setSearchResults(results.map((u: any) => ({
          id: u.id,
          username: u.username,
          avatar: u.profile_picture,
          isOnline: false,
        })));
      }
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const clearSearch = () => setSearchResults([]);

  const setActiveFriend = (friendId: string | null) => {
    setActiveFriendIdState(friendId);
    if (friendId) {
      loadMessages(friendId);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        isSetupComplete,
        user,
        friends,
        messages,
        answers,
        dailyQuestion,
        showQuestion,
        bothAnswered,
        dailyQuestionAnswered,
        searchResults,
        activeFriendId,
        isConnected,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
        completeSetup,
        addFriend,
        removeFriend,
        sendMessage: sendMessageFn,
        submitAnswer: submitAnswerFn,
        triggerQuestion,
        dismissQuestion,
        searchUsers: searchUsersFn,
        clearSearch,
        setActiveFriend,
        loadMessages,
        refreshFriends,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
