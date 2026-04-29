import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PillScannerModal from '../components/PillScannerModal';
const Medications = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showScannerModal, setShowScannerModal] = useState(false);
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [newMedData, setNewMedData] = useState({
        name: '',
        dose: '',
        frequency: 'Daily',
        time: '08:00 AM',
        stock: 30
    });

    useEffect(() => {
        fetchMedications();
    }, []);

    const fetchMedications = async () => {
        try {
            const { data } = await api.get('/medications');
            setMedications(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching medications:', error);
            setLoading(false);
        }
    };

    const handleScan = () => {
        setShowScannerModal(true);
    };

    const handleScanResult = (medicine) => {
        if (!medicine) return;

        // Clean OCR garbage text
        const cleanName = (medicine.name || '')
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .trim();

        if (!cleanName) {
            alert('Could not detect pill properly. Try again.');
            return;
        }

        setNewMedData((prev) => ({
            ...prev,
            name: cleanName,
            dose: medicine.dose || '',
            stock: 20
        }));

        setShowScannerModal(false);
        setShowAddModal(true);

        alert(`Pill detected: ${cleanName}`);
    };

    const handleMarkTaken = async (id, currentStatus) => {
        try {
            await api.put(`/medications/${id}`, { isTaken: !currentStatus });
            fetchMedications();
        } catch (error) {
            alert('Failed to update medication status');
        }
    };

    const handleAddMedication = async (e) => {
        // e might be undefined if called directly, but here we use it in form submit
        if (e) e.preventDefault();
        try {
            await api.post('/medications', newMedData);
            setShowAddModal(false);
            fetchMedications();
            setNewMedData({
                name: '',
                dosage: '',
                frequency: 'Daily',
                time: '08:00 AM',
                stock: 30
            });
        } catch (error) {
            alert('Failed to add medication');
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-card">
                <div>
                    <h2 className="text-2xl font-bold text-healthcare-dark">Medication Manager</h2>
                    <p className="text-gray-600">Track doses, refills, and smart reminders</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleScan}
                        className="px-6 py-3 bg-purple-100 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
                    >
                        <span>{scanning ? '🔍' : '📸'}</span> {scanning ? 'Scanning...' : 'Pill Scanner'}
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <span>➕</span> Add Medicine
                    </button>
                </div>
            </div>

            {/* Smart Reminders Banner */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="text-4xl">📱</div>
                    <div>
                        <h3 className="font-bold text-xl">WhatsApp Reminders Active</h3>
                        <p className="text-green-100">You'll receive alerts for every dose on +1 (555) 123-4567</p>
                    </div>
                </div>
                <div className="form-checkbox h-6 w-6 text-green-600 bg-white rounded border-0 cursor-pointer"></div>
            </div>

            {/* Medication List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {medications.map((med) => (
                    <div key={med._id} className="bg-white p-6 rounded-2xl shadow-card hover:shadow-hover transition-all flex gap-6 border border-transparent hover:border-blue-100">
                        <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-4xl shadow-inner transition-colors ${med.isTaken ? 'bg-green-50' : 'bg-blue-50'}`}>
                            {med.isTaken ? '✅' : '💊'}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className={`text-xl font-bold transition-colors ${med.isTaken ? 'text-green-700' : 'text-slate-800'}`}>{med.name}</h3>
                                <span className={`${med.isTaken ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} px-3 py-1 rounded-full text-xs font-bold uppercase`}>
                                    {med.frequency}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                                <div className="flex items-center gap-2">
                                    <span>📏</span> Dose: {med.dosage}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>⏰</span> Time: {med.time}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 border-t border-gray-100 pt-4">
                                <div className={`text-sm font-semibold ${med.stock < 7 ? 'text-red-500' : 'text-green-600'}`}>
                                    {med.stock} pills left
                                    {med.stock < 7 && <span className="ml-2 underline cursor-pointer">Refill?</span>}
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleMarkTaken(med._id, med.isTaken)}
                                        className={`text-sm font-bold px-3 py-1 rounded-lg transition-colors ${med.isTaken ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                    >
                                        {med.isTaken ? 'Taken' : 'Mark Taken'}
                                    </button>
                                    <button className="text-gray-400 hover:text-blue-600 text-sm font-semibold">
                                        ✏️ Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New Placeholder */}
                <button
                    onClick={() => setShowAddModal(true)}
                    className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-healthcare-primary hover:bg-blue-50 transition-colors group min-h-[200px]"
                >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:bg-blue-200 transition-colors text-gray-400 group-hover:text-blue-600">
                        ➕
                    </div>
                    <h3 className="font-semibold text-gray-500 group-hover:text-blue-700">Add New Medication</h3>
                </button>
            </div>

            {/* Mock Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl relative">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
                        >
                            ✕
                        </button>
                        <h3 className="text-2xl font-bold mb-6 text-healthcare-dark">Add Medication</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Medicine Name</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. Aspirin"
                                    value={newMedData.name}
                                    onChange={e => setNewMedData({ ...newMedData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Dosage</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="10mg"
                                        value={newMedData.dose}
                                        onChange={e => setNewMedData({ ...newMedData, dosage: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Frequency</label>
                                    <select
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newMedData.frequency}
                                        onChange={e => setNewMedData({ ...newMedData, frequency: e.target.value })}
                                    >
                                        <option>Daily</option>
                                        <option>Twice Daily</option>
                                        <option>Weekly</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handleAddMedication}
                                className="w-full btn-primary py-3 mt-4"
                            >
                                Save Medication
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showScannerModal && (
                <PillScannerModal
                    onClose={() => setShowScannerModal(false)}
                    onResult={handleScanResult}
                />
            )}
        </div>
    );
};

export default Medications;
