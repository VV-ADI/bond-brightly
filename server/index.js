import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

// ─── Supabase Setup ───
const SUPABASE_URL = 'https://aqwuzlfzjkdpedwhefxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxd3V6bGZ6amtkcGVkd2hlZnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNDM4NTIsImV4cCI6MjA4NjYxOTg1Mn0.VH1i3Fv4uBj7mGhHqeTcfh9_wixbAY_JAWXs8DAfkt8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Express + Socket.IO ───
const app = express();
app.use(cors({ origin: ['http://localhost:8080', 'http://localhost:5173'], credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:8080', 'http://localhost:5173'],
    credentials: true,
  },
});

// ─── Initialize Database Tables ───
async function initDB() {
  // Create tables via Supabase SQL (run once)
  // We'll use Supabase's built-in auth for users
  // Additional profile & chat tables:
  console.log('Server connected to Supabase');
}

// ─── REST API Routes ───

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get or create user profile
app.post('/api/profile', async (req, res) => {
  try {
    const { user_id, username, email, age, birthday, bio, profile_picture, interests, hobbies, personal_answers, question_time } = req.body;
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user_id,
        username,
        email,
        age,
        birthday,
        bio,
        profile_picture,
        interests,
        hobbies,
        personal_answers,
        question_time,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Profile upsert error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get profile by user_id
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.params.userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.json(data || null);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Search users by username
app.get('/api/users/search', async (req, res) => {
  try {
    const { q, currentUserId } = req.query;
    if (!q) return res.json([]);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, bio, profile_picture')
      .ilike('username', `%${q}%`)
      .neq('id', currentUserId || '')
      .limit(10);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Send friend request
app.post('/api/friends/request', async (req, res) => {
  try {
    const { from_user_id, to_user_id, relationship_type } = req.body;

    // Check if already friends or pending
    const { data: existing } = await supabase
      .from('friendships')
      .select('*')
      .or(`and(user_id.eq.${from_user_id},friend_id.eq.${to_user_id}),and(user_id.eq.${to_user_id},friend_id.eq.${from_user_id})`);

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Friendship already exists or pending' });
    }

    const { data, error } = await supabase
      .from('friendships')
      .insert({
        user_id: from_user_id,
        friend_id: to_user_id,
        relationship_type: relationship_type || 'Friends',
        status: 'accepted', // auto-accept for now
      })
      .select()
      .single();

    if (error) throw error;

    // Notify the other user via socket
    io.to(`user:${to_user_id}`).emit('friend_added', data);

    res.json(data);
  } catch (err) {
    console.error('Friend request error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get friends list
app.get('/api/friends/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get friendships where this user is either user_id or friend_id
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (error) throw error;

    if (!friendships || friendships.length === 0) {
      return res.json([]);
    }

    // Get the friend user IDs
    const friendIds = friendships.map(f => f.user_id === userId ? f.friend_id : f.user_id);

    // Fetch friend profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, bio, profile_picture')
      .in('id', friendIds);

    if (profileError) throw profileError;

    // Merge friendship data with profile data
    const friends = (profiles || []).map(p => {
      const friendship = friendships.find(f =>
        (f.user_id === userId && f.friend_id === p.id) ||
        (f.friend_id === userId && f.user_id === p.id)
      );
      return {
        id: p.id,
        username: p.username,
        bio: p.bio,
        profile_picture: p.profile_picture,
        relationship_type: friendship?.relationship_type || 'Friends',
        friendship_id: friendship?.id,
      };
    });

    res.json(friends);
  } catch (err) {
    console.error('Friends fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Remove friend
app.delete('/api/friends/:friendshipId', async (req, res) => {
  try {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', req.params.friendshipId);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Remove friend error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get chat messages between two users
app.get('/api/messages/:userId/:friendId', async (req, res) => {
  try {
    const { userId, friendId } = req.params;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`
      )
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Messages fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Submit daily question answer
app.post('/api/answers', async (req, res) => {
  try {
    const { user_id, friend_id, question, answer } = req.body;

    const { data, error } = await supabase
      .from('daily_answers')
      .insert({
        user_id,
        friend_id,
        question,
        answer,
        answered_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Check if friend also answered the same question today
    const today = new Date().toISOString().split('T')[0];
    const { data: friendAnswer } = await supabase
      .from('daily_answers')
      .select('*')
      .eq('user_id', friend_id)
      .eq('friend_id', user_id)
      .eq('question', question)
      .gte('answered_at', `${today}T00:00:00`)
      .single();

    if (friendAnswer) {
      // Both answered — notify both users
      io.to(`user:${user_id}`).emit('both_answered', {
        question,
        userAnswer: answer,
        partnerAnswer: friendAnswer.answer,
      });
      io.to(`user:${friend_id}`).emit('both_answered', {
        question,
        userAnswer: friendAnswer.answer,
        partnerAnswer: answer,
      });
    }

    res.json(data);
  } catch (err) {
    console.error('Answer submit error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get today's answers between two users
app.get('/api/answers/:userId/:friendId', async (req, res) => {
  try {
    const { userId, friendId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_answers')
      .select('*')
      .or(
        `and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`
      )
      .gte('answered_at', `${today}T00:00:00`)
      .order('answered_at', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Answers fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Socket.IO Real-Time Events ───
const onlineUsers = new Map(); // userId -> Set of socketIds

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User joins with their userId
  socket.on('register', (userId) => {
    socket.userId = userId;
    socket.join(`user:${userId}`);

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast online status
    io.emit('user_online', { userId, isOnline: true });
    console.log(`User ${userId} registered`);
  });

  // Join a chat room between two users
  socket.on('join_chat', ({ userId, friendId }) => {
    const roomId = [userId, friendId].sort().join(':');
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Send a chat message
  socket.on('chat_message', async ({ senderId, receiverId, text }) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content: text,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const roomId = [senderId, receiverId].sort().join(':');
      io.to(roomId).emit('new_message', data);

      // Also notify the receiver directly (in case they're not in the chat room)
      io.to(`user:${receiverId}`).emit('message_notification', {
        from: senderId,
        preview: text.substring(0, 50),
      });
    } catch (err) {
      console.error('Message send error:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', ({ userId, friendId, isTyping }) => {
    const roomId = [userId, friendId].sort().join(':');
    socket.to(roomId).emit('user_typing', { userId, isTyping });
  });

  // Get online status
  socket.on('check_online', (userId) => {
    const isOnline = onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
    socket.emit('online_status', { userId, isOnline });
  });

  socket.on('disconnect', () => {
    const userId = socket.userId;
    if (userId && onlineUsers.has(userId)) {
      onlineUsers.get(userId).delete(socket.id);
      if (onlineUsers.get(userId).size === 0) {
        onlineUsers.delete(userId);
        io.emit('user_online', { userId, isOnline: false });
      }
    }
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// ─── Start Server ───
const PORT = process.env.PORT || 3000;

initDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Bond Brightly server running at http://localhost:${PORT}`);
  });
});
