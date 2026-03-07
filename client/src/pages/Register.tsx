import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { UserPlus } from 'lucide-react';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await register(username, email, password);
            navigate('/login'); // Redirect to login after successful register
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 font-sans">
            <div className="w-full max-w-md bg-[#161616] border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20">
                        <UserPlus className="text-emerald-500" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
                    <p className="text-gray-500 mt-2">Join the global coding arena</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="e.g. janesmith"
                            className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="jane@example.com"
                            className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20 mt-6 active:scale-[0.98]"
                    >
                        {isLoading ? 'Creating Account...' : 'Get Started'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm">
                    <span className="text-gray-500">Already have an account? </span>
                    <Link to="/login" className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors">
                        Sign in instead
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
