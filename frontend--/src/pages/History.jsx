import React, { useState, useEffect } from 'react';
import { Search, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import axios from 'axios';

const History = () => {
    const [movements, setMovements] = useState([]);
    const [search, setSearch] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchMovements = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/inventory/movements`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMovements(res.data);
            } catch (error) {
                console.error("Error fetching movements:", error);
            }
        };
        fetchMovements();
    }, []);

    const filteredMovements = movements.filter(m => 
        m.product_name?.toLowerCase().includes(search.toLowerCase()) ||
        m.user_name?.toLowerCase().includes(search.toLowerCase()) ||
        m.reason?.toLowerCase().includes(search.toLowerCase())
    );

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Movement History</h2>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by product, user, or reason..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary outline-none" 
                    />
                </div>
            </div>

            <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left p-4">Date</th>
                            <th className="text-left p-4">Product</th>
                            <th className="text-left p-4">Type</th>
                            <th className="text-left p-4">Quantity</th>
                            <th className="text-left p-4">Reason</th>
                            <th className="text-left p-4">Action By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMovements.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">No movements found.</td>
                            </tr>
                        ) : (
                            filteredMovements.map((m) => (
                                <tr key={m.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="p-4 text-gray-500 whitespace-nowrap">{formatDate(m.created_at)}</td>
                                    <td className="p-4 font-medium text-gray-900 dark:text-white">{m.product_name}</td>
                                    <td className="p-4">
                                        <span className={`flex items-center gap-1 font-bold ${m.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                            {m.type === 'IN' ? <ArrowDownToLine size={14} /> : <ArrowUpFromLine size={14} />}
                                            {m.type}
                                        </span>
                                    </td>
                                    <td className={`p-4 font-bold ${m.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                        {m.type === 'IN' ? '+' : '-'}{m.quantity}
                                    </td>
                                    <td className="p-4 text-gray-500">{m.reason || 'No reason provided'}</td>
                                    <td className="p-4 text-gray-500">{m.user_name || 'System'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default History;