const API_URL = 'http://localhost:3000/api';

async function safeFetch(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const body = await res.text();
      console.error(`API error ${res.status}: ${body}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error('API fetch error:', err);
    return null;
  }
}

export const api = {
  // Profile
  async getProfile(userId: string) {
    return safeFetch(`${API_URL}/profile/${userId}`);
  },

  async upsertProfile(data: any) {
    return safeFetch(`${API_URL}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Friends
  async getFriends(userId: string) {
    return (await safeFetch(`${API_URL}/friends/${userId}`)) || [];
  },

  async addFriend(fromUserId: string, toUserId: string, relationshipType: string) {
    return safeFetch(`${API_URL}/friends/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        relationship_type: relationshipType,
      }),
    });
  },

  async removeFriend(friendshipId: string) {
    return safeFetch(`${API_URL}/friends/${friendshipId}`, {
      method: 'DELETE',
    });
  },

  // Search
  async searchUsers(query: string, currentUserId: string) {
    return (await safeFetch(`${API_URL}/users/search?q=${encodeURIComponent(query)}&currentUserId=${currentUserId}`)) || [];
  },

  // Messages
  async getMessages(userId: string, friendId: string) {
    return (await safeFetch(`${API_URL}/messages/${userId}/${friendId}`)) || [];
  },

  // Daily Answers
  async submitAnswer(userId: string, friendId: string, question: string, answer: string) {
    return safeFetch(`${API_URL}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, friend_id: friendId, question, answer }),
    });
  },

  async getTodayAnswers(userId: string, friendId: string) {
    return (await safeFetch(`${API_URL}/answers/${userId}/${friendId}`)) || [];
  },
};
