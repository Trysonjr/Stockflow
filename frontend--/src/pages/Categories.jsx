import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

const Categories = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const isAdmin = user?.role === 'Admin';

    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories`, { headers: { Authorization: `Bearer ${token}` } });
            setCategories(res.data);
        } catch (error) { console.error("Error fetching categories:", error); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            showToast('Category deleted');
            fetchCategories();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories`, { name }, { headers: { Authorization: `Bearer ${token}` } });
            showToast('Category added successfully!');
            setIsModalOpen(false);
            setName('');
            fetchCategories();
        } catch (error) {
            showToast('Failed to add category (might already exist)', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Product Categories</h2>
                    <p className="text-gray-400 mt-1">Organize your inventory by type.</p>
                </div>
                {isAdmin && (
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
                        <Plus size={18} /> Add Category
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-8">No categories found. Add your first one!</p>
                ) : (
                    categories.map((c) => (
                        <div key={c.id} className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 relative group">
                            {isAdmin && (
                                <button onClick={() => handleDelete(c.id)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={18} />
                                </button>
                            )}
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-500/10 rounded-lg"><Tag className="text-blue-400" size={20} /></div>
                                <h3 className="text-lg font-bold text-white truncate">{c.name}</h3>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Category Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-gray-700">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-white">Add New Category</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Category Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Electronics, Furniture" className="w-full p-2 border rounded-lg bg-gray-900 border-gray-700 text-white" required />
                            </div>
                            <button type="submit" className="w-full bg-primary text-white p-2 rounded-lg font-semibold mt-4 hover:bg-blue-700">Save Category</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;