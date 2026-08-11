import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, AlertTriangle, XCircle, TrendingUp, TrendingDown, ArrowDownToLine, ArrowUpFromLine, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';
    
    const [stats, setStats] = useState({ 
        total: 0, 
        lowStock: 0, 
        outStock: 0, 
        recent: [], 
        assetValue: 0, 
        potentialRevenue: 0, 
        potentialProfit: 0,
        totalRevenue: 0, 
        totalExpenses: 0, 
        netProfit: 0 
    });

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

    // Data for Bar Chart (Monthly Movements)
    const movementData = [
        { name: 'Jan', In: 40, Out: 24 },
        { name: 'Feb', In: 30, Out: 13 },
        { name: 'Mar', In: 20, Out: 38 },
        { name: 'Apr', In: 27, Out: 20 },
        { name: 'May', In: 18, Out: 28 },
        { name: 'Jun', In: 23, Out: 15 },
        { name: 'Jul', In: 34, Out: 21 },
    ];

    // Data for Donut Chart (Stock Health)
    const healthyStock = stats.total - (stats.lowStock + stats.outStock);
    const pieData = [
        { name: 'Healthy', value: healthyStock, color: '#10b981' },
        { name: 'Low Stock', value: stats.lowStock, color: '#f59e0b' },
        { name: 'Out of Stock', value: stats.outStock, color: '#ef4444' },
    ].filter(entry => entry.value > 0); 

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW' }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Asset Value Card */}
                <div className="bg-gray-800 dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 transition-all hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl"><Wallet className="text-blue-400" size={24} /></div>
                        <span className="flex items-center gap-1 text-sm font-semibold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
                            <TrendingUp size={14} /> +12.5%
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium mb-1">Inventory Asset Value</p>
                    <h3 className="text-3xl font-extrabold text-white">{formatCurrency(stats.assetValue)}</h3>
                </div>

                {/* Total Products Card */}
                <div className="bg-gray-800 dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 transition-all hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl"><Package className="text-purple-400" size={24} /></div>
                        <span className="flex items-center gap-1 text-sm font-semibold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
                            <TrendingUp size={14} /> +5.2%
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium mb-1">Total Products</p>
                    <h3 className="text-3xl font-extrabold text-white">{stats.total}</h3>
                </div>

                {/* Low Stock Alerts Card */}
                <div className="bg-gray-800 dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 transition-all hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-yellow-500/10 rounded-xl"><AlertTriangle className="text-yellow-400" size={24} /></div>
                        <span className="flex items-center gap-1 text-sm font-semibold text-red-500 bg-red-500/10 px-2 py-1 rounded-lg">
                            <TrendingDown size={14} /> -3.1%
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium mb-1">Low Stock Alerts</p>
                    <h3 className="text-3xl font-extrabold text-white">{stats.lowStock + stats.outStock}</h3>
                </div>
            </div>

            {/* Middle Row: Bar Chart & Donut Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart (Monthly Movements) */}
                <div className="lg:col-span-2 bg-gray-800 dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white">Inventory Movements</h3>
                            <p className="text-sm text-gray-400">Stock In vs Out over time</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={movementData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }} 
                                cursor={{ fill: 'rgba(55, 65, 81, 0.5)' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                            <Bar dataKey="In" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Out" fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Donut Chart (Stock Health) */}
                <div className="bg-gray-800 dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-white">Stock Health</h3>
                        <p className="text-sm text-gray-400">Current inventory status</p>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3}>
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center space-x-4 mt-4">
                        {pieData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                <span className="text-sm text-gray-400">{entry.name} ({entry.value})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Financials & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Financial Cards (Admin Only) */}
                {isAdmin && (
                    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">Business Financials</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                                    <span className="text-gray-400 text-sm">Total Sales Revenue</span>
                                    <span className="font-bold text-green-400">{formatCurrency(stats.totalRevenue)}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                                    <span className="text-gray-400 text-sm">Total Expenses</span>
                                    <span className="font-bold text-red-400">{formatCurrency(stats.totalExpenses)}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                                    <span className="text-gray-300 text-sm font-semibold">Inventory Asset Value</span>
                                    <span className="font-bold text-blue-400">{formatCurrency(stats.assetValue)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-white text-sm font-bold">Net Profit (Cash)</span>
                                    <span className={`font-extrabold text-lg ${stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {formatCurrency(stats.netProfit)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Stock Movements */}
                <div className={`bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 ${isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                    <h3 className="text-lg font-bold text-white mb-6">Recent Movements</h3>
                    <div className="space-y-4">
                        {stats.recent.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-8">No recent movements found.</p>
                        ) : (
                            stats.recent.map((mov) => (
                                <div key={mov.id} className="flex items-center justify-between border-b border-gray-700 pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${mov.type === 'IN' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                            {mov.type === 'IN' ? <ArrowDownToLine size={16} className="text-green-500" /> : <ArrowUpFromLine size={16} className="text-red-500" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-white">{mov.product_name}</p>
                                            <p className="text-xs text-gray-400">{mov.reason || 'No reason provided'} • {mov.user_name || 'System'}</p>
                                        </div>
                                    </div>
                                    <div className={`font-bold text-sm ${mov.type === 'IN' ? 'text-green-500' : 'text-red-500'}`}>{mov.type === 'IN' ? '+' : '-'}{mov.quantity}</div>
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