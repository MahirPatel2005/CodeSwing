import { create } from 'zustand';

interface LeaderboardEntry {
    userId: string;
    username: string;
    avatar: string;
    color: string;
    charCount: number | null;
    status: string;
}

interface RoomState {
    currentRoomId: string | null;
    leaderboard: LeaderboardEntry[];
    setRoomId: (roomId: string) => void;
    setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
    addLeaderboardEntry: (entry: LeaderboardEntry) => void;
    updateLeaderboardEntry: (userId: string, data: Partial<LeaderboardEntry>) => void;
    removeUser: (userId: string) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
    currentRoomId: null,
    leaderboard: [],

    setRoomId: (roomId) => set({ currentRoomId: roomId }),
    setLeaderboard: (leaderboard) => set({ leaderboard }),

    addLeaderboardEntry: (entry) => set((state) => ({
        leaderboard: [...state.leaderboard.filter(u => u.userId !== entry.userId), entry]
    })),

    updateLeaderboardEntry: (userId, data) => set((state) => ({
        leaderboard: state.leaderboard.map(u =>
            u.userId === userId ? { ...u, ...data } : u
        )
    })),

    removeUser: (userId) => set((state) => ({
        leaderboard: state.leaderboard.filter(u => u.userId !== userId)
    })),
}));
