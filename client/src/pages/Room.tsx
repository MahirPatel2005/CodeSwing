import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
    Trophy, Play, Send, ChevronRight,
    CheckCircle2,
    XCircle, Clock, Info, Layout, Layers,
    ChevronLeft, Hash, Globe
} from 'lucide-react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import api from '../lib/api';
import { useAuthStore } from '../stores/useAuthStore';
import { useRoomStore } from '../stores/useRoomStore';
import { useSocket } from '../hooks/useSocket';

const Room: React.FC = () => {
    const { id: roomId } = useParams<{ id: string }>();
    const { user } = useAuthStore();
    const { leaderboard } = useRoomStore();
    const socket = useSocket(roomId || '');

    const [language, setLanguage] = useState('python');
    const [charCount, setCharCount] = useState(0);
    const [problem, setProblem] = useState<any>(null);
    const [output, setOutput] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const editorRef = useRef<any>(null);
    const providerRef = useRef<any>(null);

    // Fetch Room & Problem Data
    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                const response = await api.get(`/rooms/${roomId}`);
                setProblem(response.data.problemId);
            } catch (error) {
                console.error('Failed to fetch room data:', error);
            }
        };
        if (roomId) fetchRoomData();
    }, [roomId]);

    // Handle Editor Mount & Yjs Setup
    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;

        if (!roomId) return;

        // Initialize Yjs
        const doc = new Y.Doc();
        const wsUrl = import.meta.env.VITE_Y_WS_URL || `ws://localhost:5001/realtime`;
        const provider = new WebsocketProvider(
            wsUrl,
            roomId,
            doc
        );
        providerRef.current = provider;

        const type = doc.getText('monaco');

        // Bind Yjs to Monaco
        new MonacoBinding(
            type,
            editor.getModel(),
            new Set([editor]),
            provider.awareness
        );

        // Track char count
        editor.onDidChangeModelContent(() => {
            const content = editor.getValue().trim();
            setCharCount(new TextEncoder().encode(content).length);
        });
    };

    const handleRun = async () => {
        if (!editorRef.current) return;
        setIsRunning(true);
        setOutput('Executing code...');
        setResults([]);

        try {
            const code = editorRef.current.getValue();
            // Default to the first test case input if available
            const defaultStdin = (problem && problem.testCases && problem.testCases.length > 0)
                ? problem.testCases[0].input
                : '';

            const response = await api.post('/execute', {
                code,
                language,
                stdin: defaultStdin
            });

            if (response.data.stderr) {
                setOutput(`Error:\n${response.data.stderr}`);
            } else if (response.data.compile_output) {
                setOutput(`Compile Error:\n${response.data.compile_output}`);
            } else {
                setOutput(response.data.stdout || 'Success (No output)');
            }
        } catch (error: any) {
            setOutput(`Failed to execute: ${error.response?.data?.error || error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!editorRef.current || !problem) return;
        setIsSubmitting(true);
        setOutput('Submitting to hidden test cases...');
        setResults([]);

        try {
            const code = editorRef.current.getValue();
            const response = await api.post('/submit', {
                problemId: problem._id,
                code,
                language,
                roomId
            });

            const { passed, total, results } = response.data;
            setResults(results);
            setOutput(`Submission Result: ${passed}/${total} test cases passed.`);

            // Notify others via socket
            if (socket) {
                socket.emit('room:submit-result', {
                    charCount: new TextEncoder().encode(code.trim()).length
                });
            }
        } catch (error: any) {
            setOutput(`Submission failed: ${error.response?.data?.error || error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLanguageChange = (newLang: string) => {
        setLanguage(newLang);
        if (socket) {
            socket.emit('room:language-change', { language: newLang });
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0d0d0d] text-gray-200 overflow-hidden font-sans">
            {/* Header */}
            <header className="h-16 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-6 shadow-xl z-20">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.href = '/'}>
                        <span className="text-xl font-black tracking-tighter text-white bg-blue-600 px-2.5 py-0.5 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)]">CG</span>
                        <span className="font-bold text-lg text-white group-hover:text-blue-500 transition-colors">CodeGolf</span>
                    </div>
                    <div className="h-4 w-[1px] bg-white/10"></div>
                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-gray-500">
                        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                            <Hash size={14} className="text-blue-500" /> <span className="text-gray-300">Room:</span> <span className="text-white font-mono">{roomId}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                            <Layout size={14} className="text-blue-500" /> <span className="text-gray-300">Challenge:</span> <span className="text-white">{problem?.title || 'Loading...'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5 text-xs font-mono font-black text-blue-500 shadow-inner">
                        <Clock size={14} /> LIVE COMPETITION
                    </div>
                    <div className="flex -space-x-3">
                        {leaderboard.map((u) => (
                            <div
                                key={u.userId}
                                title={u.username}
                                className="w-10 h-10 rounded-full border-4 border-[#0a0a0a] flex items-center justify-center text-[10px] font-black text-white shadow-2xl relative transition-transform hover:-translate-y-1 hover:z-10"
                                style={{ backgroundColor: u.color }}
                            >
                                {u.username.substring(0, 2).toUpperCase()}
                                {u.status === 'online' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Expand/Collapse Button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute right-[40%] top-1/2 -translate-y-1/2 z-30 w-6 h-12 bg-[#0a0a0a] border border-white/10 rounded-l-xl flex items-center justify-center text-gray-500 hover:text-white transition-all shadow-2xl"
                    style={{ right: sidebarOpen ? '40%' : '0' }}
                >
                    {sidebarOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* Left Side: Editor Section */}
                <div className="flex-1 flex flex-col min-w-0 transition-all duration-300" style={{ marginRight: sidebarOpen ? '40%' : '0' }}>
                    <div className="flex-1 bg-[#1e1e1e] relative">
                        <Editor
                            height="100%"
                            theme="vs-dark"
                            defaultLanguage="python"
                            language={language}
                            defaultValue="# Compete for the shortest code!\n# Input is usually handled via input() or map(int, input().split())"
                            onMount={handleEditorDidMount}
                            options={{
                                fontSize: 18,
                                minimap: { enabled: false },
                                padding: { top: 25 },
                                smoothScrolling: true,
                                cursorBlinking: "expand",
                                fontFamily: "'Fira Code', 'Courier New', monospace",
                                scrollBeyondLastLine: false,
                                lineNumbersMinChars: 3,
                                wordWrap: 'on'
                            }}
                        />
                        {/* Overlay Bytes */}
                        <div className="absolute right-8 top-6 pointer-events-none z-10 flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-1">Golf Score</span>
                            <span className="text-4xl font-mono font-black text-blue-500 dropshadow">{charCount} <span className="text-xs uppercase opacity-50">bytes</span></span>
                        </div>
                    </div>

                    {/* Editor Footer/Controls */}
                    <div className="h-20 bg-[#0a0a0a] border-t border-white/5 px-8 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-10">
                        <div className="flex items-center gap-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2">Language Protocol</span>
                                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                                    {['python', 'javascript', 'cpp'].map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => handleLanguageChange(lang)}
                                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${language === lang ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            {lang === 'cpp' ? 'C++' : lang}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleRun}
                                disabled={isRunning}
                                className="flex items-center gap-2 px-6 py-3 hover:bg-white/5 rounded-2xl text-sm font-black tracking-tight transition-all active:scale-95 disabled:opacity-50 border border-transparent hover:border-white/5"
                            >
                                <Play size={18} className="text-emerald-500 fill-emerald-500/20" /> Run Debug
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex items-center gap-3 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black tracking-tight transition-all shadow-xl shadow-blue-600/30 active:scale-95 disabled:opacity-50"
                            >
                                <Send size={18} /> {isSubmitting ? 'Evaluating...' : 'Push Submission'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Panels Section */}
                <div className={`fixed right-0 top-16 bottom-0 w-[40%] flex flex-col bg-[#0d0d0d] border-l border-white/5 transition-transform duration-300 z-20 overflow-hidden ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                        {/* Problem Section */}
                        <section className="p-10 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
                            <div className="flex items-center gap-2 text-blue-500 mb-6">
                                <Info size={20} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">The Challenge</span>
                            </div>
                            <h2 className="text-4xl font-black text-white mb-6 tracking-tight leading-none">{problem?.title || 'Loading Title...'}</h2>
                            <div className="prose prose-invert prose-sm max-w-none mb-8">
                                <p className="text-gray-400 leading-relaxed text-base font-medium whitespace-pre-wrap">
                                    {problem?.description || 'Synchronizing with core problem database...'}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${problem?.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                                    }`}>
                                    {problem?.difficulty || 'Pending'}
                                </span>
                                {problem?.tags?.map((t: string) => (
                                    <span key={t} className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-full font-bold uppercase text-gray-500">{t}</span>
                                ))}
                            </div>
                        </section>

                        {/* Test Results / Output Section */}
                        <section className="p-10 border-b border-white/5">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-2 text-indigo-500">
                                    <Layers size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Diagnostics</span>
                                </div>
                                <div className="text-[10px] text-gray-600 font-black uppercase">Live Output</div>
                            </div>

                            <div className="bg-[#050505] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                                <div className="h-8 bg-white/5 flex items-center px-4 border-b border-white/5">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                                        <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                                        <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                                    </div>
                                </div>
                                <div className="p-6 font-mono text-sm leading-relaxed min-h-[160px] whitespace-pre-wrap">
                                    {output ? (
                                        <div className="animate-in fade-in slide-in-from-bottom-2">
                                            {output.split('\n').map((line, i) => (
                                                <div key={i} className="mb-1 flex">
                                                    <span className="text-gray-600 w-8 flex-shrink-0 text-right pr-3 border-r border-white/5 mr-3 select-none text-[10px]">{i + 1}</span>
                                                    <span className="text-gray-200">{line}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-gray-700 italic flex flex-col items-center justify-center py-10 opacity-30">
                                            <Globe size={32} className="mb-4" />
                                            <span>Ready for execution...</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {results.length > 0 && (
                                <div className="mt-6 space-y-3">
                                    {results.map((res, i) => (
                                        <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                                            <div className="flex items-center gap-4">
                                                {res.passed ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-rose-500" />}
                                                <div>
                                                    <div className="text-xs font-black text-white uppercase tracking-tighter">Test Case #{i + 1}</div>
                                                    <div className="text-[10px] text-gray-500 font-mono mt-0.5 truncate max-w-[120px]">In: "{res.input}"</div>
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-black uppercase text-gray-600 group-hover:text-white transition-colors">Details</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Leaderboard Section */}
                        <section className="p-10 pb-20">
                            <div className="flex items-center gap-2 text-yellow-500 mb-8">
                                <Trophy size={20} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Live Rankings</span>
                            </div>
                            <div className="space-y-3">
                                {leaderboard.filter(u => u.charCount !== null).length > 0 ? (
                                    leaderboard
                                        .filter(u => u.charCount !== null)
                                        .sort((a, b) => (a.charCount || 0) - (b.charCount || 0))
                                        .map((u, i) => (
                                            <div key={u.userId} className={`px-6 py-4 rounded-2xl flex items-center justify-between border transition-all hover:scale-[1.02] ${u.userId === user?.userId ? 'bg-blue-600/20 border-blue-500/40 shadow-lg shadow-blue-600/10' : 'bg-white/5 border-white/5'}`}>
                                                <div className="flex items-center gap-4">
                                                    <span className={`text-base font-black w-6 text-center ${i === 0 ? 'text-yellow-500 italic' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-600' : 'text-gray-700'}`}>
                                                        {i === 0 ? '🏆' : i + 1}
                                                    </span>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-white leading-tight">{u.username}</span>
                                                        <span className="text-[9px] font-black uppercase tracking-tighter text-emerald-500">Live Byte Tracking</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-lg font-mono font-black text-blue-500 leading-none">{u.charCount}</span>
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-600 mt-1">Bytes</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-[2rem] opacity-30">
                                        <Trophy size={40} className="mx-auto mb-4" />
                                        <p className="text-xs font-black uppercase tracking-widest">No Submissions Recorded</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Room;
