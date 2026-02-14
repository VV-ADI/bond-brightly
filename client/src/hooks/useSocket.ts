import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3000';

export function useSocket(userId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('register', userId);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  const joinChat = useCallback((friendId: string) => {
    if (socketRef.current && userId) {
      socketRef.current.emit('join_chat', { userId, friendId });
    }
  }, [userId]);

  const sendMessage = useCallback((receiverId: string, text: string) => {
    if (socketRef.current && userId) {
      socketRef.current.emit('chat_message', {
        senderId: userId,
        receiverId,
        text,
      });
    }
  }, [userId]);

  const sendTyping = useCallback((friendId: string, isTyping: boolean) => {
    if (socketRef.current && userId) {
      socketRef.current.emit('typing', { userId, friendId, isTyping });
    }
  }, [userId]);

  const onNewMessage = useCallback((callback: (msg: any) => void) => {
    socketRef.current?.on('new_message', callback);
    return () => {
      socketRef.current?.off('new_message', callback);
    };
  }, []);

  const onUserTyping = useCallback((callback: (data: { userId: string; isTyping: boolean }) => void) => {
    socketRef.current?.on('user_typing', callback);
    return () => {
      socketRef.current?.off('user_typing', callback);
    };
  }, []);

  const onBothAnswered = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on('both_answered', callback);
    return () => {
      socketRef.current?.off('both_answered', callback);
    };
  }, []);

  const onUserOnline = useCallback((callback: (data: { userId: string; isOnline: boolean }) => void) => {
    socketRef.current?.on('user_online', callback);
    return () => {
      socketRef.current?.off('user_online', callback);
    };
  }, []);

  const onFriendAdded = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on('friend_added', callback);
    return () => {
      socketRef.current?.off('friend_added', callback);
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    joinChat,
    sendMessage,
    sendTyping,
    onNewMessage,
    onUserTyping,
    onBothAnswered,
    onUserOnline,
    onFriendAdded,
  };
}
