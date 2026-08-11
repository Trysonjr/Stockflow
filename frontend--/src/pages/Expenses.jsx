import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Wallet, TrendingDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

const Expenses = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const isAdmin = user?.role === 'Admin';

    const [expenses, setExpenses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ description: '', category: 'Rent', amount: 0 });
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => { fetchExpenses(); }, []);

    const fetchExpenses = async () => {
        try {
            const res = await axios.get(`${API_URL}/expenses`, { headers: { Authorization: `Bearer ${token}` } });
            setExpenses(res.data);
        } catch (error) { console.error("Error fetching expenses:", error); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense record?')) {
            await axios.delete(`${API_URL}/expenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            showToast('Expense deleted');
            fetchExpenses();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/expenses`, formData, { headers: { Authorization: `Bearer ${token}` } });
            showToast('Expense recorded successfully!');
            setIsModalOpen(false);
            setFormData({ description: '', category: 'Rent', amount: 0 });
            fetchExpenses();
        } catch (error) {
            showToast('Failed to record expense', 'error');
        }
    };

    const totalExpenses = expenses.reduce((acc, exp) => acc + Number(exp.amount), 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Expense Management</h2>
                    <p className="text-gray-400 mt-1">Track business expenses to calculate true net profit.</p>
                </div>
                {isAdmin && (
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
                        <Plus size={18} /> Record Expense
                    </button>
                )}
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-red-600 to-rose-700 p-6 rounded-2xl shadow-lg border border-red-500/30 text-white flex justify-between items-center">
                <div>
                    <p className="text-red-100 text-sm font-medium">Total Recorded Expenses</p>
                    <h3 className="text-3xl font-extrabold mt-1">K {totalExpenses.toFixed(2)}</h3>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <TrendingDown size={32} />
                </div>
            </div>

            {/* Expenses Table */}
            <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-700 text-gray-400">
                            <th className="text-left p-4">Date</th>
                            <th className="text-left p-4">Description</th>
                            <th className="text-left p-4">Category</th>
                            <th className="text-left p-4">Amount</th>
                            {isAdmin && <th className="text-left p-4">Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">No expenses recorded yet.</td></tr>
                        ) : (
                            expenses.map((e) => (
                                <tr key={e.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-4 text-gray-400 whitespace-nowrap">{new Date(e.created_at).toLocaleDateString()}</td>
                                    <td className="p-4 font-medium text-white">{e.description}</td>
                                    <td className="p-4"><span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">{e.category}</span></td>
                                    <td className="p-4 font-bold text-red-400">K {Number(e.amount).toFixed(2)}</td>
                                    {isAdmin && (
                                        <td className="p-4">
                                            <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Expense Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-gray-700">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2"><Wallet /> Record New Expense</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
                                <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="e.g. Shop Rent for August" className="w-full p-2 border rounded-lg bg-gray-900 border-gray-700 text-white" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Category</label>
                                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-2 border rounded-lg bg-gray-900 border-gray-700 text-white">
                                    <option value="Rent">Rent</option>
                                    <option value="Salaries">Salaries</option>
                                    <option value="Utilities">Utilities (Electricity/Water)</option>
                                    <option value="Transport">Transport</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Miscellaneous">Miscellaneous</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Amount (K)</label>
                                <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full p-2 border rounded-lg bg-gray-900 border-gray-700 text-white" required min="0" />
                            </div>
                            <button type="submit" className="w-full bg-primary text-white p-2 rounded-lg font-semibold mt-4 hover:bg-blue-700">Save Expense</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;