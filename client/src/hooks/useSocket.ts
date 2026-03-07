import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRoomStore } from '../stores/useRoomStore';
import { useAuthStore } from '../stores/useAuthStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

export const useSocket = (roomId: string) => {
    const socketRef = useRef<Socket | null>(null);
    const { setLeaderboard, addLeaderboardEntry, removeUser, updateLeaderboardEntry } = useRoomStore();
    const { user } = useAuthStore();

    useEffect(() => {
        if (!roomId || !user) return;

        socketRef.current = io(SOCKET_URL);

        // Join room
        socketRef.current.emit('room:join', {
            roomId,
            userId: user.userId,
            username: user.username,
            avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`
        });

        // Listeners
        socketRef.current.on('room:user-joined', (data) => {
            console.log('User joined room:', data);
            addLeaderboardEntry(data);
        });

        socketRef.current.on('room:user-left', (data) => {
            console.log('User left room:', data);
            removeUser(data.userId);
        });

        socketRef.current.on('room:submission', (data) => {
            console.log('Submission received:', data);
            updateLeaderboardEntry(data.userId, { charCount: data.charCount });
        });

        socketRef.current.on('room:leaderboard', (data) => {
            console.log('Leaderboard updated:', data);
            setLeaderboard(data);
        });

        socketRef.current.on('room:language-changed', (data) => {
            console.log('Language changed in room:', data);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [roomId, user]);

    return socketRef.current;
};
