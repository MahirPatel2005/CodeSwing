import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <h1 className="text-4xl font-bold mb-6 tracking-tight">CodeSwing</h1>
            <p className="text-muted-foreground mb-8 text-center max-w-md">
                Collaborative real-time code editor for pair programming and hackathons.
            </p>
            <div className="flex gap-4">
                <Link
                    to="/login"
                    className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:opacity-90 transition-opacity"
                >
                    Get Started
                </Link>
                <button
                    onClick={() => {
                        const id = Math.random().toString(36).substring(7);
                        window.location.href = `/room/${id}`;
                    }}
                    className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md font-medium hover:opacity-90 transition-opacity"
                >
                    Quick Join
                </button>
            </div>
        </div>
    );
};

export default Home;
