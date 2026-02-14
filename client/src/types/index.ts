export interface User {
  id: string;
  username: string;
  email: string;
  age: string;
  birthday: string;
  interests: string[];
  hobbies: string[];
  bio: string;
  profilePicture: string;
  personalAnswers: { question: string; answer: string }[];
  questionTime: string;
}

export interface Friend {
  id: string;
  username: string;
  avatar?: string;
  lastSeen?: string;
  isOnline?: boolean;
  relationshipType?: string;
  friendshipId?: string;
}

export interface Message {
  id?: string;
  sender: "user" | "friend";
  senderId?: string;
  receiverId?: string;
  text: string;
  timestamp: string;
}

export interface Answer {
  questionId: string;
  userAnswer: string;
  partnerAnswer: string;
}
