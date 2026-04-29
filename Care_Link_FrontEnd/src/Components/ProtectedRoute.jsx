import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('careLinkUser'));

    if (!user) {
        // Redirect to login if not authenticated
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect to dashboard (or 403 page) if role not allowed
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
