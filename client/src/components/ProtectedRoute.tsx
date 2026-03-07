import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated } = useAuthStore();

    // In a real app, we might also check if the user is being re-hydrated from localStorage here
    // For this mock phase, we just rely on the store state.

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
