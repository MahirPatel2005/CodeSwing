import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Hash, ChevronRight, LayoutGrid, Award, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import api from '../lib/api';

interface Problem {
    _id: string;
    title: string;
    difficulty: string;
    tags: string[];
}

const Home: React.FC = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [joinCode, setJoinCode] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const response = await api.get('/problems');
                setProblems(response.data);
            } catch (error) {
                console.error('Failed to fetch problems:', error);
            }
        };
        fetchProblems();
    }, []);

    const handleCreateRoom = async (problemId: string) => {
        setLoading(true);
        try {
            const response = await api.post('/rooms', { problemId });
            const { roomId } = response.data;
            navigate(`/room/${roomId}`);
        } catch (error) {
            console.error('Failed to create room:', error);
            alert('Failed to create room. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (joinCode.trim()) {
            try {
                // We could hit the join API here or just redirect.
                // Redirecting is safer for the UI flow.
                navigate(`/room/${joinCode.toUpperCase()}`);
            } catch (error) {
                console.error('Failed to join room:', error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30">
            {/* Navbar */}
            <nav className="border-b border-white/5 bg-[#0d0d0d]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black italic shadow-[0_0_15px_rgba(37,99,235,0.4)]">CG</div>
                        <span className="font-bold text-xl tracking-tighter">CodeGolf</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="text-sm text-gray-400 font-medium hidden md:block">Welcome, <span className="text-white font-bold">{user?.username || 'Guest'}</span></span>
                        <div className="h-4 w-[1px] bg-white/10 hidden md:block"></div>
                        <button
                            onClick={logout}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-1.5 rounded-full text-xs font-bold border border-red-500/20 transition-all flex items-center gap-2"
                        >
                            <LogOut size={14} /> Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20 pt-10">
                    <div className="flex-1 space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                            <Award size={14} /> NOW CONNECTED TO LOCALHOST:3000
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black leading-[0.85] tracking-tight">
                            CODING IN <br /><span className="text-blue-500 italic drop-shadow-[0_10px_10px_rgba(37,99,235,0.2)]">BYTES.</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-lg leading-relaxed font-medium">
                            Compress your code to the absolute limit. Real-time collaborative code golfing built for speed and competition.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-8 py-5 bg-blue-600 hover:bg-blue-700 rounded-2xl flex items-center gap-2 font-black transition-all shadow-xl shadow-blue-600/25 hover:-translate-y-1 active:scale-95"
                            >
                                <Plus size={22} /> Create Live Room
                            </button>

                            <form onSubmit={handleJoinRoom} className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center text-gray-500 group-focus-within:text-blue-500 transition-colors">
                                    <Hash size={20} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter Room ID"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    className="pl-11 pr-32 py-5 bg-[#161616] border border-white/5 rounded-2xl w-full md:w-[320px] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-mono placeholder:font-sans font-bold text-blue-400 tracking-widest"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2.5 top-2.5 bottom-2.5 px-4 bg-white/5 hover:bg-blue-500 text-white hover:text-white rounded-xl flex items-center gap-1 text-sm font-black border border-white/5 transition-all"
                                >
                                    Join <ChevronRight size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: <Plus />, title: "Problem Seeded", desc: "Access the 6 core problems seeded in the database instantly.", color: "text-orange-500", bg: "bg-orange-500/10" },
                        { icon: <Users />, title: "Real-time Sync", desc: "Y-Websocket handles synchronization while Socket.io manages presence.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                        { icon: <LayoutGrid />, title: "Judge0 Built-in", desc: "Execute code across Python, JavaScript and C++ with low latency.", color: "text-blue-500", bg: "bg-blue-500/10" }
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#121212] border border-white/5 p-10 rounded-[2.5rem] group hover:border-blue-500/20 transition-all duration-300 hover:bg-[#161616]">
                            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                                {stat.icon}
                            </div>
                            <h3 className="text-2xl font-black mb-3 text-white tracking-tight">{stat.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed font-medium">{stat.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowCreateModal(false)}></div>
                    <div className="relative w-full max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#121212]">
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tight">Active Problems</h2>
                                <p className="text-gray-500 text-sm font-medium">Select a challenge to start a competition</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {problems.length > 0 ? (
                                problems.map((prob) => (
                                    <button
                                        key={prob._id}
                                        onClick={() => handleCreateRoom(prob._id)}
                                        disabled={loading}
                                        className="p-6 bg-[#161616] hover:bg-blue-600/5 border border-white/5 hover:border-blue-500/40 rounded-3xl text-left transition-all group relative active:scale-95 disabled:opacity-50"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${prob.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                                                }`}>
                                                {prob.difficulty}
                                            </span>
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 bg-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <ChevronRight size={20} />
                                            </div>
                                        </div>
                                        <h4 className="font-black text-xl mb-2 text-white group-hover:text-blue-400 transition-colors">{prob.title}</h4>
                                        <div className="flex gap-2">
                                            {prob.tags.map(t => <span key={t} className="text-[10px] text-gray-600 font-black uppercase tracking-tighter">{t}</span>)}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="col-span-2 py-12 text-center text-gray-600 italic font-medium">
                                    Loading internal problem database...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
