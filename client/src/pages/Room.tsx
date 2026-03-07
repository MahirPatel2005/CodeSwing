import React from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';

const Room: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
                <div className="flex items-center gap-4">
                    <h1 className="font-bold text-lg">CodeSwing</h1>
                    <div className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded uppercase font-semibold">
                        Room: {id}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-3 py-1.5 text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors">
                        Share
                    </button>
                    <button className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
                        Run Code
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-hidden">
                <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    defaultValue="// Welcome to CodeSwing! Begin your collaborative session here."
                    theme="vs-dark"
                    options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        padding: { top: 16 }
                    }}
                />
            </main>

            <footer className="h-8 border-t border-border flex items-center px-4 text-[10px] text-muted-foreground bg-muted/50">
                Connected to Room: {id} | 2 Collaborators | UTF-8
            </footer>
        </div>
    );
};

export default Room;
