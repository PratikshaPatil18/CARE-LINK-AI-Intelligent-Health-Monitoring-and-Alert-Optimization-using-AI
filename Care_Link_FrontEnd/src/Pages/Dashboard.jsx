import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('careLinkUser'));

    const [healthStats, setHealthStats] = useState([]);
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVitals();
        fetchMedications();
    }, []);

    const fetchVitals = async () => {
        try {
            const { data } = await api.get('/dashboard/stats');
            // Transform backend data to frontend format if needed, or just use it
            // For now, we'll map the backend Vitals model to the UI format
            // If data is empty, we might want to show default/empty state or keep mock for demo?
            // Let's mix real data with UI props (icons, colors)
            const statsConfig = {
                'Heart Rate': { icon: '❤️', color: 'text-red-500', bg: 'bg-red-50' },
                'Blood Pressure': { icon: '🩺', color: 'text-blue-500', bg: 'bg-blue-50' },
                'Glucose': { icon: '🩸', color: 'text-pink-500', bg: 'bg-pink-50' },
                'Sleep': { icon: '😴', color: 'text-purple-500', bg: 'bg-purple-50' }
            };

            const formattedStats = data.map(vital => ({
                ...vital,
                label: vital.type,
                ...statsConfig[vital.type]
            }));

            // unique stats (latest) - backend should handle this or we filter here
            // simplified: just show what we got
            setHealthStats(formattedStats.length > 0 ? formattedStats : [
                { label: 'Heart Rate', value: '--', status: 'No Data', icon: '❤️', color: 'text-red-500', bg: 'bg-red-50' },
                { label: 'Blood Pressure', value: '--', status: 'No Data', icon: '🩺', color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Glucose', value: '--', status: 'No Data', icon: '🩸', color: 'text-pink-500', bg: 'bg-pink-50' },
                { label: 'Sleep', value: '--', status: 'No Data', icon: '😴', color: 'text-purple-500', bg: 'bg-purple-50' },
            ]);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching vitals:', error);
            setLoading(false);
        }
    };

    const fetchMedications = async () => {
        try {
            const { data } = await api.get('/medications');
            setMedications(data);
        } catch (error) {
            console.error('Error fetching medications:', error);
        }
    };

    const handleMarkTaken = async (id, currentStatus) => {
        try {
            await api.put(`/medications/${id}`, { isTaken: !currentStatus });
            fetchMedications(); // Refresh list
        } catch (error) {
            alert('Failed to update medication status');
        }
    };

    const handleAddVital = async () => {
        // Simulation: Add a random heart rate
        try {
            await api.post('/dashboard/stats', {
                type: 'Heart Rate',
                value: `${Math.floor(Math.random() * (100 - 60) + 60)} bpm`,
                status: 'Normal'
            });
            fetchVitals(); // Refresh
        } catch (error) {
            alert('Failed to add vital');
        }
    };

    const todayMeds = [
        { name: 'Metformin', dose: '500mg', time: '08:00 AM', taken: true, type: '💊' },
        { name: 'Lisinopril', dose: '10mg', time: '08:00 AM', taken: true, type: '💊' },
        { name: 'Atorvastatin', dose: '20mg', time: '09:00 PM', taken: false, type: '💊' },
    ];

    const stockAlerts = medications
        .filter(med => med.stock < 7)
        .map(med => ({
            title: 'Prescription Refill',
            desc: `${med.name} is running low (${med.stock} left)`,
            time: 'Action Required',
            type: 'warning'
        }));

    const alerts = [
        { title: 'Upcoming Appointment', desc: 'Dr. Smith - Cardiology Checkup', time: 'Tomorrow, 10:00 AM', type: 'info' },
        ...stockAlerts
    ];

    const quickActions = [
        { label: 'Add Vitals', icon: 'ab', path: '/dashboard', color: 'bg-blue-600' },
        { label: 'Upload Report', icon: '📄', path: '/dashboard/vault', color: 'bg-green-600' },
        { label: 'Add Meds', icon: '💊', path: '/dashboard/medications', color: 'bg-purple-600' },
        { label: 'SOS Emergency', icon: '🚨', path: '#', color: 'bg-red-600 animate-pulse' },
    ];

    if (user?.role === 'admin') {
        quickActions.unshift({ label: 'Admin Panel', icon: '⚙️', path: '/dashboard/admin', color: 'bg-gray-800' });
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-card">
                <h2 className="text-3xl font-bold mb-2">Hello, {user?.name || 'User'}! 👋</h2>
                <p className="text-blue-100 text-lg">
                    {medications.filter(m => !m.isTaken).length > 0
                        ? `You have ${medications.filter(m => !m.isTaken).length} doses remaining for today.`
                        : "All caught up! You've taken all your medications for today."}
                </p>
            </div>

            {/* Quick Actions (Mobile/Tablet prioritized) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            if (action.label === 'Add Vitals') handleAddVital();
                            else if (action.path !== '#') navigate(action.path);
                        }}
                        className={`${action.color} text-white p-4 rounded-xl shadow-soft hover:shadow-lg transition-all transform hover:-translate-y-1 flex flex-col items-center justify-center gap-2 group`}
                    >
                        <span className="text-3xl group-hover:scale-110 transition-transform">{action.icon}</span>
                        <span className="font-semibold text-sm md:text-base">{action.label}</span>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Health & Meds */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Health Stats */}
                    <div className="bg-white rounded-2xl p-6 shadow-card">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="text-2xl">📊</span> Vitals Summary
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {healthStats.map((stat, index) => (
                                <div key={index} className={`${stat.bg} p-4 rounded-xl text-center`}>
                                    <div className={`text-3xl mb-2 ${stat.color}`}>{stat.icon}</div>
                                    <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                                    <div className="text-xs text-green-600 mt-1 font-semibold">{stat.status}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Today's Medications */}
                    <div className="bg-white rounded-2xl p-6 shadow-card">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <span className="text-2xl">💊</span> Today's Schedule
                            </h3>
                            <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">View All</button>
                        </div>
                        <div className="space-y-4">
                            {medications.length > 0 ? medications.map((med, index) => (
                                <div key={med._id || index} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl
                                            ${med.isTaken ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                            💊
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{med.name} <span className="text-xs text-gray-500 ml-1">({med.dosage || med.dose})</span></h4>
                                            <p className="text-sm text-gray-500">Scheduled for {med.time}</p>
                                        </div>
                                    </div>
                                    {med.isTaken ? (
                                        <button
                                            onClick={() => handleMarkTaken(med._id, med.isTaken)}
                                            className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold hover:bg-green-200 transition-colors"
                                        >
                                            Taken
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleMarkTaken(med._id, med.isTaken)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                                        >
                                            Mark Taken
                                        </button>
                                    )}
                                </div>
                            )) : (
                                <div className="text-center py-8 text-gray-500">
                                    No medications scheduled for today.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Alerts & Profile */}
                <div className="space-y-8">
                    {/* Alerts */}
                    <div className="bg-white rounded-2xl p-6 shadow-card">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="text-2xl">🔔</span> Notifications
                        </h3>
                        <div className="space-y-4">
                            {alerts.map((alert, index) => (
                                <div key={index} className={`p-4 rounded-xl border-l-4 ${alert.type === 'warning' ? 'bg-orange-50 border-orange-500' : 'bg-blue-50 border-blue-500'}`}>
                                    <h4 className="font-bold text-slate-800 mb-1">{alert.title}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{alert.desc}</p>
                                    <p className="text-xs text-gray-500 font-medium">{alert.time}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Access Card */}
                    {/* Only show for family/admin */}
                    {(user?.role === 'admin' || user?.role === 'family') && (
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-card">
                            <h3 className="text-xl font-bold mb-4">Family Access</h3>
                            <p className="text-purple-100 mb-6">Manage settings and permissions for connected profiles.</p>
                            <button className="w-full bg-white text-purple-700 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors">
                                Manage Family
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
