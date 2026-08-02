import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, PieChart as PieIcon, Award, Percent } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import axios from 'axios';

const Reports = () => {
    const [data, setData] = useState({ salesTrend: [], categoryRevenue: [], bestSellers: [], profitMargins: [] });
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await axios.get(`${API_URL}/reports`, { headers: { Authorization: `Bearer ${token}` } });
                setData(res.data);
            } catch (error) { console.error("Error fetching reports:", error); }
        };
        fetchReports();
    }, []);

    const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#f97316', '#10b981', '#ef4444'];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW', minimumFractionDigits: 2 }).format(amount || 0);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
                <p className="text-gray-400 mt-1">Deep dive into your sales performance and profitability.</p>
            </div>

            {/* Row 1: Sales Trend & Category Split */}
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/10 rounded-lg"><TrendingUp className="text-blue-400" size={22} /></div>
                        <div><h3 className="text-lg font-bold text-white">7-Day Revenue Trend</h3><p className="text-sm text-gray-400">Daily sales revenue</p></div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data.salesTrend}>
                            <defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `K${v}`} />
                            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }} formatter={(value) => formatCurrency(value)} />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fill="url(#colorRev)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-500/10 rounded-lg"><PieIcon className="text-purple-400" size={22} /></div>
                        <div><h3 className="text-lg font-bold text-white">Revenue by Category</h3><p className="text-sm text-gray-400">Top earning categories</p></div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={data.categoryRevenue} dataKey="revenue" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3}>
                                {data.categoryRevenue.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }} formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-2 mt-4">
                        {data.categoryRevenue.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span><span className="text-gray-400">{entry.category}</span></div>
                                <span className="font-medium text-white">{formatCurrency(entry.revenue)}</span>
                            </div>
                        ))}
                        {data.categoryRevenue.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No sales data yet.</p>}
                    </div>
                </div>
            </div>

            {/* Row 2: Best Sellers & Profit Margins */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-500/10 rounded-lg"><Award className="text-orange-400" size={22} /></div>
                        <div><h3 className="text-lg font-bold text-white">Best Sellers</h3><p className="text-sm text-gray-400">Top 5 by quantity sold</p></div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.bestSellers} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                            <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis type="string" dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} width={100} />
                            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }} cursor={{ fill: 'rgba(55, 65, 81, 0.5)' }} />
                            <Bar dataKey="total_sold" fill="#f97316" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-500/10 rounded-lg"><Percent className="text-green-400" size={22} /></div>
                        <div><h3 className="text-lg font-bold text-white">Top Profit Margins</h3><p className="text-sm text-gray-400">Most profitable products</p></div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-gray-700 text-gray-400"><th className="text-left p-3">Product</th><th className="text-left p-3">Cost</th><th className="text-left p-3">Price</th><th className="text-left p-3">Margin</th></tr></thead>
                            <tbody>
                                {data.profitMargins.map((p, idx) => (
                                    <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="p-3 font-medium text-white">{p.name}</td>
                                        <td className="p-3 text-gray-400">{formatCurrency(p.buying_price)}</td>
                                        <td className="p-3 text-gray-300">{formatCurrency(p.selling_price)}</td>
                                        <td className="p-3 font-bold text-green-400">{Number(p.margin_percentage).toFixed(1)}%</td>
                                    </tr>
                                ))}
                                {data.profitMargins.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-500">No products found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;