import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const AuthPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialMode = searchParams.get('mode') || 'login';

    const [mode, setMode] = useState(initialMode);
    const [selectedRole, setSelectedRole] = useState('');
    const [showRoleSelection, setShowRoleSelection] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: ''
    });

    const roles = [
        {
            id: 'elder',
            name: 'Elder',
            icon: '👴',
            bgColor: 'bg-blue-100',
            borderColor: 'border-blue-500',
            description: 'I need care and monitoring'
        },
        {
            id: 'family',
            name: 'Family Member',
            icon: '👨‍👩‍👧‍👦',
            bgColor: 'bg-purple-100',
            borderColor: 'border-purple-500',
            description: 'I care for a loved one'
        },
        {
            id: 'doctor',
            name: 'Healthcare Provider',
            icon: '⚕️',
            bgColor: 'bg-green-100',
            borderColor: 'border-green-500',
            description: 'I provide medical care'
        },
        {
            id: 'admin',
            name: 'Administrator',
            icon: '👨‍💼',
            bgColor: 'bg-orange-100',
            borderColor: 'border-orange-500',
            description: 'I manage the platform'
        }
    ];

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', {
                email: formData.email,
                password: formData.password
            });
            localStorage.setItem('careLinkUser', JSON.stringify({
                name: data.fullName,
                email: data.email,
                role: data.role,
                token: data.token
            }));
            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.message || 'Login failed');
        }
    };

    const handleRegisterStep1 = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        setShowRoleSelection(true);
    };

    const handleRoleSelect = (roleId) => {
        setSelectedRole(roleId);
    };

    const completeRegistration = async () => {
        try {
            const { data } = await api.post('/auth/register', {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: selectedRole
            });
            localStorage.setItem('careLinkUser', JSON.stringify({
                name: data.fullName,
                email: data.email,
                role: data.role,
                token: data.token
            }));
            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.message || 'Registration failed');
        }
    };

    if (showRoleSelection) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4 py-8">
                <div className="max-w-6xl w-full">
                    <button
                        onClick={() => setShowRoleSelection(false)}
                        className="mb-8 text-healthcare-primary hover:text-blue-700 flex items-center gap-2 transition-colors text-lg font-semibold"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-healthcare-dark mb-4">
                            Choose Your Role
                        </h2>
                        <p className="text-xl text-gray-600">
                            Select how you'll be using Care Link AI
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {roles.map((role) => (
                            <button
                                key={role.id}
                                onClick={() => handleRoleSelect(role.id)}
                                className={`${role.bgColor} rounded-2xl p-8 hover:shadow-hover transition-all border-4 ${selectedRole === role.id ? `${role.borderColor}` : 'border-transparent'
                                    } text-center group`}
                            >
                                <div className="text-7xl mb-6">
                                    {role.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-healthcare-dark mb-3">
                                    {role.name}
                                </h3>
                                <p className="text-base text-gray-700">
                                    {role.description}
                                </p>
                            </button>
                        ))}
                    </div>

                    {selectedRole && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={completeRegistration}
                                className="btn-primary text-xl px-12 py-5"
                            >
                                Complete Registration
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4 py-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 text-healthcare-primary hover:text-blue-700 mb-8 transition-colors text-lg font-semibold"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Home
                    </button>

                    <div className="mb-6">
                        <div className="w-16 h-16 bg-healthcare-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl text-white font-bold">+</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-healthcare-dark mb-4">
                            {mode === 'login' ? 'Welcome Back' : 'Get Started'}
                        </h2>
                        <p className="text-xl text-gray-600">
                            {mode === 'login'
                                ? 'Sign in to your Care Link AI account'
                                : 'Create your Care Link AI account'}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-8 md:p-10 shadow-card">
                    {/* Tab Switcher */}
                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition-all ${mode === 'login'
                                ? 'bg-healthcare-primary text-white shadow-soft'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setMode('register')}
                            className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition-all ${mode === 'register'
                                ? 'bg-healthcare-primary text-white shadow-soft'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={mode === 'login' ? handleLogin : handleRegisterStep1} className="space-y-6">
                        {mode === 'register' && (
                            <div>
                                <label className="block text-healthcare-dark text-lg font-semibold mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-healthcare-primary focus:border-transparent transition-all"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-healthcare-dark text-lg font-semibold mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-healthcare-primary focus:border-transparent transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-healthcare-dark text-lg font-semibold mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-healthcare-primary focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {mode === 'register' && (
                            <div>
                                <label className="block text-healthcare-dark text-lg font-semibold mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-healthcare-primary focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        )}

                        {mode === 'login' && (
                            <div className="flex items-center justify-between text-lg">
                                <label className="flex items-center text-gray-700 cursor-pointer">
                                    <input type="checkbox" className="mr-2 w-5 h-5" />
                                    Remember me
                                </label>
                                <a href="#" className="text-healthcare-primary hover:text-blue-700 font-semibold transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-5 px-8 bg-healthcare-primary text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-soft hover:shadow-card"
                        >
                            {mode === 'login' ? 'Sign In' : 'Continue to Role Selection'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600 text-lg">
                            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                className="text-healthcare-primary hover:text-blue-700 font-semibold transition-colors"
                            >
                                {mode === 'login' ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </div>

                <p className="text-center text-gray-500 text-base mt-8 px-4">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
