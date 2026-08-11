import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Users, Shield, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

const Team = () => {
    const { user: currentUser } = useAuth();
    const { showToast } = useToast();
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Staff' });
    
    // Permissions state
    const [permUser, setPermUser] = useState(null);
    const [perms, setPerms] = useState({});
    
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
            setUsers(res.data);
        } catch (error) { console.error("Error fetching users:", error); }
    };

    const handleDelete = async (id) => {
        if (id === currentUser.id) { showToast("You cannot delete your own account!", 'error'); return; }
        if (window.confirm('Are you sure you want to delete this team member?')) {
            await axios.delete(`${API_URL}/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            showToast('User deleted successfully');
            fetchUsers();
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await axios.put(`${API_URL}/users/${id}`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } });
            showToast('Role updated successfully');
            fetchUsers();
        } catch (error) { showToast('Failed to update role', 'error'); }
    };

    const openPermsModal = (user) => {
        setPermUser(user);
        setPerms(user.permissions ? JSON.parse(user.permissions) : {});
    };

    const handlePermChange = (page) => {
        setPerms(prev => ({ ...prev, [page]: !prev[page] }));
    };

    const savePerms = async () => {
        try {
            await axios.put(`${API_URL}/users/${permUser.id}`, { permissions: perms }, { headers: { Authorization: `Bearer ${token}` } });
            showToast('Permissions updated successfully!');
            setPermUser(null);
            fetchUsers();
        } catch (error) { showToast('Failed to update permissions', 'error'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/users`, formData, { headers: { Authorization: `Bearer ${token}` } });
            showToast('Team member added successfully!');
            setIsModalOpen(false);
            setFormData({ name: '', email: '', password: '', role: 'Staff' });
            fetchUsers();
        } catch (error) { showToast(error.response?.data?.message || 'Failed to add user', 'error'); }
    };

    const allPages = ["Dashboard", "Products", "Sales", "Orders", "Expenses", "Suppliers", "Categories", "Reports", "Team", "History", "Assistant", "Restock"];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Team Management</h2>
                    <p className="text-gray-400 mt-1">Manage staff accounts, roles, and granular permissions.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus size={18} /> Add Team Member
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((u) => (
                    <div key={u.id} className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 relative group">
                        {u.id !== currentUser.id && (
                            <button onClick={() => handleDelete(u.id)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={18} />
                            </button>
                        )}
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-xl ${u.role === 'Admin' ? 'bg-blue-500/10' : 'bg-gray-700'}`}>
                                {u.role === 'Admin' ? <Shield className="text-blue-400" size={28} /> : <Users className="text-gray-400" size={28} />}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{u.name}</h3>
                                <p className="text-sm text-gray-400">{u.email}</p>
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                                <select 
                                    value={u.role} 
                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                    disabled={u.id === currentUser.id}
                                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                                >
                                    <option value="Admin">Admin (Full Access)</option>
                                    <option value="Staff">Staff (Limited Access)</option>
                                </select>
                            </div>
                            
                            {u.id !== currentUser.id && (
                                <button onClick={() => openPermsModal(u)} className="w-full flex items-center justify-center gap-2 bg-gray-700 text-white py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors text-sm">
                                    <Settings size={16} /> Manage Page Access
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add User Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-gray-700">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                        <h2 className="text-2xl font-bold mb-6 text-white">Add New Team Member</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="block text-sm font-medium mb-1 text-gray-300">Full Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded-lg bg-gray-900 border-gray-700 text-white" required /></div>
                            <div><label className="block text-sm font-medium mb-1 text-gray-300">Email Address</label><input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded-lg bg-gray-900 border-gray-700 text-white" required /></div>
                            <div><label className="block text-sm font-medium mb-1 text-gray-300">Temporary Password</label><input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full p-2 border rounded-lg bg-gray-900 border-gray-700 text-white" required /></div>
                            <div><label className="block text-sm font-medium mb-1 text-gray-300">Role</label><select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full p-2 border rounded-lg bg-gray-900 border-gray-700 text-white"><option value="Staff">Staff (Limited Access)</option><option value="Admin">Admin (Full Access)</option></select></div>
                            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-lg font-semibold mt-4 hover:bg-blue-700">Create Account</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Permissions Modal */}
            {permUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 relative border border-gray-700">
                        <button onClick={() => setPermUser(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                        <h2 className="text-2xl font-bold mb-2 text-white">Manage Access for {permUser.name}</h2>
                        <p className="text-gray-400 text-sm mb-6">Check the pages this user is allowed to view and interact with.</p>
                        
                        <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">
                            {allPages.map(page => (
                                <label key={page} className="flex items-center gap-3 bg-gray-900 p-3 rounded-lg border border-gray-700 cursor-pointer hover:border-blue-500">
                                    <input type="checkbox" checked={perms[page] || false} onChange={() => handlePermChange(page)} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-800" />
                                    <span className="text-white text-sm font-medium">{page}</span>
                                </label>
                            ))}
                        </div>

                        <button onClick={savePerms} className="w-full bg-blue-600 text-white p-2 rounded-lg font-semibold mt-6 hover:bg-blue-700">Save Permissions</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Team;