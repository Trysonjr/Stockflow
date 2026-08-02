import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, ShoppingCart, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

const Orders = () => {
    const { showToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('token');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchOrders();
        fetchFormOptions();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } });
            setOrders(res.data);
        } catch (error) { console.error("Error fetching orders:", error); }
    };

    const fetchFormOptions = async () => {
        try {
            const [supRes, prodRes] = await Promise.all([
                axios.get(`${API_URL}/suppliers`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/products`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setSuppliers(supRes.data);
            setProducts(prodRes.data);
        } catch (error) { console.error("Error fetching options:", error); }
    };

    const handleAddItem = () => {
        setOrderItems([...orderItems, { product_id: '', quantity: 1, unit_price: 0 }]);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...orderItems];
        newItems[index][field] = field === 'product_id' ? value : Number(value);
        
        // Auto-fill buying price when product is selected
        if (field === 'product_id') {
            const selectedProd = products.find(p => p.id === Number(value));
            if (selectedProd) newItems[index].unit_price = selectedProd.buying_price;
        }
        setOrderItems(newItems);
    };

    const handleRemoveItem = (index) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API_URL}/orders`, 
                { supplier_id: selectedSupplier, items: orderItems },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast('Purchase order created!');
            setIsModalOpen(false);
            setOrderItems([]);
            setSelectedSupplier('');
            fetchOrders();
        } catch (error) {
            showToast('Failed to create order', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReceiveOrder = async (id) => {
        if (window.confirm('Mark this order as received? This will automatically add items to your inventory.')) {
            try {
                await axios.put(`${API_URL}/orders/${id}/receive`, {}, { headers: { Authorization: `Bearer ${token}` } });
                showToast('Order received! Inventory updated.');
                fetchOrders();
            } catch (error) {
                showToast('Failed to receive order', 'error');
            }
        }
    };

    const handleDeleteOrder = async (id) => {
        if (window.confirm('Delete this pending order?')) {
            await axios.delete(`${API_URL}/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            showToast('Order deleted');
            fetchOrders();
        }
    };

    const totalCost = orderItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Purchase Orders</h2>
                    <p className="text-gray-400 mt-1">Create restock orders and update inventory automatically.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
                    <Plus size={18} /> New Order
                </button>
            </div>

            <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-700 text-gray-400">
                            <th className="text-left p-4">PO #</th>
                            <th className="text-left p-4">Supplier</th>
                            <th className="text-left p-4">Total Cost</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4">Date</th>
                            <th className="text-left p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500">No purchase orders found.</td></tr>
                        ) : (
                            orders.map((o) => (
                                <tr key={o.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-4 font-medium text-white">#{o.id}</td>
                                    <td className="p-4 text-gray-300">{o.supplier_name || 'N/A'}</td>
                                    <td className="p-4 text-white">K {Number(o.total_cost).toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            o.status === 'Received' ? 'bg-green-500/20 text-green-400' : 
                                            o.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' : 
                                            'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            {o.status === 'Pending' && (
                                                <>
                                                    <button onClick={() => handleReceiveOrder(o.id)} className="flex items-center gap-1 bg-green-600/20 text-green-400 px-3 py-1 rounded-lg hover:bg-green-600/30 text-xs font-semibold">
                                                        <CheckCircle size={14} /> Receive
                                                    </button>
                                                    <button onClick={() => handleDeleteOrder(o.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Order Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl p-6 relative border border-gray-700 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                        <h2 className="text-2xl font-bold mb-6 text-white">Create Purchase Order</h2>
                        
                        <form onSubmit={handleCreateOrder} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Supplier</label>
                                <select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-900 border-gray-700 text-white" required>
                                    <option value="">Select a supplier...</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div className="border-t border-gray-700 pt-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold text-white">Order Items</h3>
                                    <button type="button" onClick={handleAddItem} className="flex items-center gap-1 text-sm bg-blue-600/20 text-blue-400 px-3 py-1 rounded-lg hover:bg-blue-600/30">
                                        <Plus size={14} /> Add Item
                                    </button>
                                </div>
                                
                                <div className="space-y-3">
                                    {orderItems.map((item, index) => (
                                        <div key={index} className="flex gap-2 items-center bg-gray-900 p-2 rounded-lg border border-gray-700">
                                            <select value={item.product_id} onChange={(e) => handleItemChange(index, 'product_id', e.target.value)} className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm" required>
                                                <option value="">Select product...</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                            <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-20 p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm" required min="1" />
                                            <input type="number" placeholder="Price" value={item.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)} className="w-24 p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm" required step="0.01" />
                                            <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                                <span className="text-lg font-bold text-white">Total: K {totalCost.toFixed(2)}</span>
                                <button type="submit" disabled={loading || orderItems.length === 0} className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />} Create Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;