import { create } from 'zustand';
import axios from 'axios';

interface User {
    userId: string;
    username: string;
    email: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL + '/api/auth';

export const useAuthStore = create<AuthState>((set) => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const { data } = await axios.post(`${API_URL}/login`, { email, password });
            set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    register: async (username, email, password) => {
        set({ isLoading: true });
        try {
            await axios.post(`${API_URL}/register`, { username, email, password });
            set({ isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const { data } = await axios.get(`${API_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ user: data, isAuthenticated: true });
            localStorage.setItem('user', JSON.stringify(data));
        } catch (error) {
            set({ user: null, token: null, isAuthenticated: false });
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },
}));
