import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, AlertTriangle, XCircle, TrendingUp, ArrowDownToLine, ArrowUpFromLine, X, DollarSign, Wallet, PiggyBank } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';
    
    const [stats, setStats] = useState({ total: 0, lowStock: 0, outStock: 0, recent: [], assetValue: 0, potentialRevenue: 0, potentialProfit: 0 });
    const [activeDay, setActiveDay] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/inventory/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);
            } catch (error) {
                console.error("Error fetching stats", error);
            }
        };
        fetchStats();
    }, []);

    const chartData = [
        { name: 'Mon', Electronics: 200, Accessories: 120, Furniture: 80 },
        { name: 'Tue', Electronics: 210, Accessories: 130, Furniture: 80 },
        { name: 'Wed', Electronics: 190, Accessories: 140, Furniture: 80 },
        { name: 'Thu', Electronics: 230, Accessories: 150, Furniture: 70 },
        { name: 'Fri', Electronics: 220, Accessories: 140, Furniture: 80 },
        { name: 'Sat', Electronics: 250, Accessories: 130, Furniture: 80 },
        { name: 'Sun', Electronics: 260, Accessories: 140, Furniture: 80 }
    ];

    const handleChartClick = (data) => {
        const payload = data && data.activePayload && data.activePayload.length > 0 
            ? data.activePayload[0].payload 
            : data && data.payload 
            ? data.payload 
            : null;
        if (payload) setActiveDay(payload);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Basic Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card flex items-center gap-4">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <Package className="text-primary dark:text-blue-400" size={28} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Products</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</h3>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                        <AlertTriangle className="text-yellow-500" size={28} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Low Stock Items</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.lowStock}</h3>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-xl">
                        <XCircle className="text-red-500" size={28} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Out of Stock</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.outStock}</h3>
                    </div>
                </div>
            </div>

            {/* Financial Valuation Cards (Admin Only) */}
            {isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card flex items-center gap-4">
                        <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                            <Wallet className="text-indigo-600 dark:text-indigo-400" size={28} />
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Inventory Asset Value</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.assetValue)}</h3>
                        </div>
                    </div>
                    <div className="card flex items-center gap-4">
                        <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <DollarSign className="text-green-600 dark:text-green-400" size={28} />
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Potential Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.potentialRevenue)}</h3>
                        </div>
                    </div>
                    <div className="card flex items-center gap-4">
                        <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <PiggyBank className="text-primary dark:text-blue-400" size={28} />
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Potential Profit</p>
                            <h3 className="text-2xl font-bold text-primary dark:text-blue-400">{formatCurrency(stats.potentialProfit)}</h3>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stacked Interactive Area Chart */}
                <div className="card lg:col-span-2 relative">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Inventory Trends by Category</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Click on a day to see category breakdown</p>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <TrendingUp className="text-primary dark:text-blue-400" size={20} />
                        </div>
                    </div>
                    
                    <div className="cursor-pointer">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData} onClick={handleChartClick}>
                                <defs>
                                    <linearGradient id="colorElec" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                                    </linearGradient>
                                    <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                                    </linearGradient>
                                    <linearGradient id="colorFur" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                
                                <Tooltip 
                                    cursor={{ stroke: '#2563eb', strokeWidth: 2, strokeDasharray: '4 4' }}
                                    contentStyle={{ 
                                        background: 'rgba(255, 255, 255, 0.95)', 
                                        border: '2px solid #2563eb', 
                                        borderRadius: '12px', 
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        color: '#111827',
                                        padding: '12px'
                                    }} 
                                />
                                <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                                
                                <Area type="monotone" dataKey="Electronics" stackId="1" stroke="#2563eb" strokeWidth={3} fill="url(#colorElec)" activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#2563eb', onClick: handleChartClick }} />
                                <Area type="monotone" dataKey="Accessories" stackId="1" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorAcc)" activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#8b5cf6', onClick: handleChartClick }} />
                                <Area type="monotone" dataKey="Furniture" stackId="1" stroke="#f97316" strokeWidth={3} fill="url(#colorFur)" activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#f97316', onClick: handleChartClick }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Chart Click Popup Modal */}
                    {activeDay && (
                        <div className="absolute top-20 right-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-2xl rounded-xl p-5 w-64 z-10">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white">{activeDay.name}'s Breakdown</h4>
                                <button onClick={() => setActiveDay(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <DollarSign size={16} className="text-blue-500" /> Electronics
                                    </span>
                                    <span className="font-bold text-blue-600">{activeDay.Electronics}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Package size={16} className="text-purple-500" /> Accessories
                                    </span>
                                    <span className="font-bold text-purple-600">{activeDay.Accessories}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Package size={16} className="text-orange-500" /> Furniture
                                    </span>
                                    <span className="font-bold text-orange-600">{activeDay.Furniture}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg mt-4">
                                    <span className="text-sm font-medium text-primary dark:text-blue-400">Total Stock</span>
                                    <span className="font-extrabold text-primary dark:text-blue-400">
                                        {activeDay.Electronics + activeDay.Accessories + activeDay.Furniture}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Stock Movements */}
                <div className="card">
                    <h3 className="font-semibold text-lg mb-6 text-gray-900 dark:text-white">Recent Movements</h3>
                    <div className="space-y-4">
                        {stats.recent.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-8">No recent movements found.</p>
                        ) : (
                            stats.recent.map((mov) => (
                                <div key={mov.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${mov.type === 'IN' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                            {mov.type === 'IN' ? <ArrowDownToLine size={16} className="text-green-600" /> : <ArrowUpFromLine size={16} className="text-red-600" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-gray-900 dark:text-white">{mov.product_name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {mov.reason || 'No reason provided'} • {mov.user_name || 'System'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`font-bold text-sm ${mov.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                        {mov.type === 'IN' ? '+' : '-'}{mov.quantity}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;