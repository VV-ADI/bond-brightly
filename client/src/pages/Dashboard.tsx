import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { LogOut, Search, MessageCircle, Users, UserPlus, Settings, X, UserMinus, Heart } from "lucide-react";
import { toast } from "sonner";

const RELATIONSHIP_TYPES = ["Couple", "Friends", "Married", "Long Distance", "Family"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, friends, logout, addFriend, removeFriend, searchUsers, searchResults, clearSearch, setActiveFriend, isLoggedIn, isSetupComplete, loading } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [showRelModal, setShowRelModal] = useState(false);
  const [pendingFriend, setPendingFriend] = useState<{ id: string; username: string } | null>(null);
  const [selectedRelType, setSelectedRelType] = useState("");

  // Redirect if not logged in or setup not complete
  useEffect(() => {
    if (!loading && (!isLoggedIn || !isSetupComplete)) {
      navigate("/");
    }
  }, [loading, isLoggedIn, isSetupComplete, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchUsers(query);
  };

  const initiateAddFriend = (friendId: string, username: string) => {
    setPendingFriend({ id: friendId, username });
    setSelectedRelType("");
    setShowRelModal(true);
  };

  const confirmAddFriend = async () => {
    if (!selectedRelType || !pendingFriend) return;
    const success = await addFriend(pendingFriend.id, selectedRelType);
    if (success) {
      toast.success(`${pendingFriend.username} added as ${selectedRelType}`);
      setSearchQuery("");
      clearSearch();
    } else {
      toast.error("Could not add friend. They may already be added.");
    }
    setShowRelModal(false);
    setPendingFriend(null);
    setSelectedRelType("");
  };

  const handleRemoveFriend = (friendshipId: string, username: string) => {
    if (!friendshipId) {
      toast.error("Cannot remove friend");
      return;
    }
    removeFriend(friendshipId);
    toast.success(`${username} removed`);
  };

  const handleOpenChat = (friendId: string) => {
    setActiveFriend(friendId);
    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-background animated-bg">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--gradient-hero)" }}>
              <Heart size={14} className="text-primary-foreground" />
            </div>
            <h1 className="font-display text-lg font-extrabold gradient-text">Bond Brightly</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/settings")} className="flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-1.5 transition-all hover:bg-secondary">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="" className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <div className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium text-secondary-foreground hidden sm:block">{user?.username}</span>
            </button>
            <button onClick={() => navigate("/settings")} className="rounded-xl p-2.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
              <Settings size={18} />
            </button>
            <button onClick={handleLogout} className="rounded-xl p-2.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl px-4 py-5 space-y-5">
        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search users by username..."
              className="input-styled pl-10 pr-10"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); clearSearch(); }} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Search Results */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="mt-2 card-glass p-2 space-y-1">
                {searchResults.map(u => (
                  <div key={u.id} className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-muted/40 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground">{u.username}</span>
                      </div>
                    </div>
                    <button onClick={() => initiateAddFriend(u.id, u.username)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      <UserPlus size={12} /> Add
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
            {searchQuery && searchResults.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 card-glass p-5 text-center">
                <Search size={20} className="mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No users found for "{searchQuery}"</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Friends List */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="card-glass p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-accent" />
            <h2 className="font-display text-sm font-bold text-foreground">Friends</h2>
            {friends.length > 0 && (
              <span className="ml-auto text-[11px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">{friends.length}</span>
            )}
          </div>

          {friends.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-secondary/60 flex items-center justify-center mb-3">
                <Users size={22} className="text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No friends yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Search for users above to add friends</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {friends.map((friend, index) => (
                <motion.li
                  key={friend.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 px-4 py-3 backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-sm"
                >
                  <button onClick={() => handleOpenChat(friend.id)} className="flex items-center gap-3 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                      {friend.username[0].toUpperCase()}
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold text-foreground">{friend.username}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${friend.isOnline ? "bg-accent animate-pulse" : "bg-muted-foreground/40"}`} />
                        <span className="text-[10px] text-muted-foreground">{friend.isOnline ? "Online" : "Offline"}</span>
                        {friend.relationshipType && (
                          <span className="text-[10px] font-medium text-primary bg-primary/10 rounded-full px-1.5 py-0.5 ml-1">{friend.relationshipType}</span>
                        )}
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleOpenChat(friend.id)} className="rounded-lg p-2 text-accent hover:bg-accent/10 transition-all">
                      <MessageCircle size={16} />
                    </button>
                    <button onClick={() => handleRemoveFriend(friend.friendshipId || '', friend.username)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
                      <UserMinus size={14} />
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      </main>

      {/* Relationship Type Modal */}
      <AnimatePresence>
        {showRelModal && pendingFriend && (
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
              transition={{ duration: 0.3 }}
              className="card-glass w-full max-w-sm p-6 relative"
            >
              <button onClick={() => setShowRelModal(false)} className="absolute top-3 right-3 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                <X size={16} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-glow)" }}>
                  <Heart size={18} className="text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-foreground">Add {pendingFriend.username}</h2>
                  <p className="text-xs text-muted-foreground">Select your relationship type</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-5">
                {RELATIONSHIP_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedRelType(type)}
                    className={`rounded-xl px-3 py-2.5 text-sm font-medium border transition-all ${selectedRelType === type ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted/40 border-border/50 text-muted-foreground hover:border-primary/20"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <button
                onClick={confirmAddFriend}
                disabled={!selectedRelType}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <UserPlus size={16} /> Add Friend
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
