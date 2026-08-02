import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, DollarSign } from 'lucide-react';

const Restock = () => {
    const [restockList, setRestockList] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchLowStock = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products`, { headers: { Authorization: `Bearer ${token}` } });
                const lowStock = res.data.filter(p => p.current_quantity <= p.min_stock_level);
                const withCost = lowStock.map(p => ({
                    ...p,
                    needed: (p.min_stock_level * 2) - p.current_quantity,
                    cost: ((p.min_stock_level * 2) - p.current_quantity) * p.buying_price
                }));
                setRestockList(withCost);
            } catch (error) {
                console.error("Error fetching restock data:", error);
            }
        };
        fetchLowStock();
    }, []);

    const totalCost = restockList.reduce((acc, item) => acc + item.cost, 0);

    return (
        <div className="space-y-6">
            {/* Fixed Total Cost Card */}
            <div className="flex justify-between items-center p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-md">
                <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Estimated Total Restocking Cost</p>
                    <h3 className="text-3xl font-extrabold mt-1 text-primary dark:text-blue-400">
                        K {totalCost.toFixed(2)}
                    </h3>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                    <DollarSign size={32} className="text-primary dark:text-blue-400" />
                </div>
            </div>

            {/* Restock List Table */}
            <div className="card">
                <div className="flex items-center gap-2 mb-4">
                    <ShoppingCart className="text-primary" />
                    <h3 className="font-semibold text-lg">Restock List</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left p-4">Product</th>
                                <th className="text-left p-4">Current Qty</th>
                                <th className="text-left p-4">Min Level</th>
                                <th className="text-left p-4">Suggested Order Qty</th>
                                <th className="text-left p-4">Estimated Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {restockList.map((item) => (
                                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="p-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                                    <td className="p-4 text-red-500 font-bold">{item.current_quantity}</td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400">{item.min_stock_level}</td>
                                    <td className="p-4 text-primary font-bold">{item.needed}</td>
                                    <td className="p-4 font-medium text-gray-900 dark:text-white">K {item.cost.toFixed(2)}</td>
                                </tr>
                            ))}
                            {restockList.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-4 text-center text-gray-500">All stock levels are healthy! 🎉</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Restock;