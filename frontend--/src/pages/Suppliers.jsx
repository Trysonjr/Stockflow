import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

const Suppliers = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const isAdmin = user?.role === 'Admin';

    const [suppliers, setSuppliers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', contact_info: '' });
    const token = localStorage.getItem('token');

    useEffect(() => { fetchSuppliers(); }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/suppliers`, { headers: { Authorization: `Bearer ${token}` } });
            setSuppliers(res.data);
        } catch (error) { console.error("Error fetching suppliers:", error); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this supplier?')) {
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/suppliers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            showToast('Supplier deleted');
            fetchSuppliers();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/suppliers`, formData, { headers: { Authorization: `Bearer ${token}` } });
            showToast('Supplier added successfully!');
            setIsModalOpen(false);
            setFormData({ name: '', contact_info: '' });
            fetchSuppliers();
        } catch (error) {
            showToast('Failed to add supplier', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Suppliers & Vendors</h2>
                    <p className="text-gray-400 mt-1">Manage who you order from.</p>
                </div>
                {isAdmin && (
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
                        <Plus size={18} /> Add Supplier
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-8">No suppliers found. Add your first one!</p>
                ) : (
                    suppliers.map((s) => (
                        <div key={s.id} className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 relative group">
                            {isAdmin && (
                                <button onClick={() => handleDelete(s.id)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={18} />
                                </button>
                            )}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl"><Building2 className="text-blue-400" size={24} /></div>
                                <h3 className="text-xl font-bold text-white truncate">{s.name}</h3>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <p className="text-sm text-gray-400">Contact Info</p>
                                <p className="text-gray-200 mt-1 break-words">{s.contact_info || 'No contact info provided'}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Supplier Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-gray-700">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-white">Add New Supplier</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Supplier Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded-lg bg-gray-900 border-gray-700 text-white" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Contact Info (Email/Phone)</label>
                                <input type="text" value={formData.contact_info} onChange={(e) => setFormData({...formData, contact_info: e.target.value})} className="w-full p-2 border rounded-lg bg-gray-900 border-gray-700 text-white" />
                            </div>
                            <button type="submit" className="w-full bg-primary text-white p-2 rounded-lg font-semibold mt-4 hover:bg-blue-700">Save Supplier</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;