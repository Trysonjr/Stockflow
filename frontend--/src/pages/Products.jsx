import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Pencil, ArrowDownToLine, ArrowUpFromLine, Trash2, X, FileDown, Upload, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Products = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const isAdmin = user?.role === 'Admin';

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const token = localStorage.getItem('token');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(''); // 'add', 'edit', 'in', 'out'
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({ name: '', sku: '', category: '', buying_price: 0, selling_price: 0, current_quantity: 0, min_stock_level: 0 });
    const [movementQty, setMovementQty] = useState(0);
    const [movementReason, setMovementReason] = useState('');
    const [aiLoading, setAiLoading] = useState(false); // <-- AI Loading State

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products`, { headers: { Authorization: `Bearer ${token}` } });
            setProducts(res.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchProducts();
        }
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.autoTable({ html: '#product-table' });
        doc.save('products.pdf');
    };

    const exportCSV = () => {
        const headers = ["Name", "SKU", "Category", "Quantity", "Buying Price", "Selling Price"];
        const rows = filteredProducts.map(p => [
            `"${p.name}"`, `"${p.sku}"`, `"${p.category}"`, 
            p.current_quantity, p.buying_price, p.selling_price
        ]);
        const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "stockflow_products.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products/import`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            showToast('Products imported successfully!');
            fetchProducts(); 
        } catch (error) {
            console.error("Error importing products:", error);
            showToast('Failed to import Excel file.', 'error');
        }
    };

    const openModal = (type, product = null) => {
        setModalType(type);
        setSelectedProduct(product);
        if (type === 'edit' && product) {
            setFormData({
                name: product.name, sku: product.sku, category: product.category,
                buying_price: product.buying_price, selling_price: product.selling_price,
                current_quantity: product.current_quantity, min_stock_level: product.min_stock_level
            });
        } else if (type === 'add') {
            setFormData({ name: '', sku: '', category: '', buying_price: 0, selling_price: 0, current_quantity: 0, min_stock_level: 0 });
        } else {
            setMovementQty(0);
            setMovementReason('');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
        setModalType('');
    };

    const handleAIGenerate = async () => {
        if (!formData.name) {
            showToast('Please enter a product name first', 'error');
            return;
        }
        setAiLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/generate-product`, 
                { productName: formData.name },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setFormData({
                ...formData,
                sku: res.data.sku || '',
                category: res.data.category || '',
                buying_price: res.data.buying_price || 0,
                selling_price: res.data.selling_price || 0,
                min_stock_level: res.data.min_stock_level || 10
            });
            showToast('AI generated details successfully!');
        } catch (error) {
            console.error("AI Error:", error);
            showToast('Failed to generate AI details.', 'error');
        } finally {
            setAiLoading(false);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalType === 'add') {
                await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products`, formData, { headers: { Authorization: `Bearer ${token}` } });
                showToast('Product added successfully!');
            } else if (modalType === 'edit') {
                await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products/${selectedProduct.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
                showToast('Product updated successfully!');
            }
            closeModal();
            fetchProducts();
        } catch (error) {
            console.error("Error saving product:", error);
            showToast('Failed to save product. SKU must be unique.', 'error');
        }
    };

    const handleMovementSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/inventory/movement`, {
                product_id: selectedProduct.id,
                type: modalType.toUpperCase(), 
                quantity: Number(movementQty),
                reason: movementReason
            }, { headers: { Authorization: `Bearer ${token}` } });
            showToast(`Stock ${modalType.toUpperCase()} recorded successfully!`);
            closeModal();
            fetchProducts();
        } catch (error) {
            console.error("Error updating stock:", error);
            showToast('Failed to update stock.', 'error');
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="flex gap-2 items-center">
                    <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Download size={18} /> PDF
                    </button>
                    <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <FileDown size={18} /> CSV
                    </button>
                    
                    {isAdmin && (
                        <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors">
                            <Upload size={18} /> Import Excel
                            <input type="file" accept=".xlsx, .xls" onChange={handleImport} className="hidden" />
                        </label>
                    )}

                    {isAdmin && (
                        <button onClick={() => openModal('add')} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
                            <Plus size={18} /> Add Product
                        </button>
                    )}
                </div>
            </div>

            <div className="card overflow-x-auto">
                <table id="product-table" className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left p-4">Product Name</th>
                            <th className="text-left p-4">SKU</th>
                            <th className="text-left p-4">Category</th>
                            <th className="text-left p-4">Qty</th>
                            <th className="text-left p-4">Price</th>
                            <th className="text-left p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((p) => (
                            <tr key={p.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="p-4 font-medium">{p.name}</td>
                                <td className="p-4 text-gray-500">{p.sku}</td>
                                <td className="p-4">{p.category}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.current_quantity === 0 ? 'bg-red-100 text-red-600' : p.current_quantity <= p.min_stock_level ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                                        {p.current_quantity}
                                    </span>
                                </td>
                                <td className="p-4">K {Number(p.selling_price).toFixed(2)}</td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        {isAdmin && (
                                            <button onClick={() => openModal('edit', p)} className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg" title="Edit">
                                                <Pencil size={16} />
                                            </button>
                                        )}
                                        <button onClick={() => openModal('in', p)} className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg" title="Stock In">
                                            <ArrowDownToLine size={16} />
                                        </button>
                                        <button onClick={() => openModal('out', p)} className="p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-lg" title="Stock Out">
                                            <ArrowUpFromLine size={16} />
                                        </button>
                                        {isAdmin && (
                                            <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL POPUP */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                        
                        <h2 className="text-2xl font-bold mb-6">
                            {modalType === 'edit' ? 'Edit Product' : modalType === 'add' ? 'Add New Product' : `Stock ${modalType.toUpperCase()}`}
                        </h2>

                        {(modalType === 'edit' || modalType === 'add') ? (
                            <form onSubmit={handleProductSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded-lg bg-transparent" required />
                                </div>
                                
                                {/* AI Generate Button */}
                                {modalType === 'add' && (
                                    <button 
                                        type="button" 
                                        onClick={handleAIGenerate} 
                                        disabled={aiLoading}
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {aiLoading ? (
                                            <><Loader2 size={18} className="animate-spin" /> Generating...</>
                                        ) : (
                                            <><Sparkles size={18} /> Generate Details with AI</>
                                        )}
                                    </button>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">SKU</label>
                                        <input type="text" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="w-full p-2 border rounded-lg bg-transparent" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Category</label>
                                        <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-2 border rounded-lg bg-transparent" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Buying Price (K)</label>
                                        <input type="number" step="0.01" value={formData.buying_price} onChange={(e) => setFormData({...formData, buying_price: e.target.value})} className="w-full p-2 border rounded-lg bg-transparent" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Selling Price (K)</label>
                                        <input type="number" step="0.01" value={formData.selling_price} onChange={(e) => setFormData({...formData, selling_price: e.target.value})} className="w-full p-2 border rounded-lg bg-transparent" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Current Qty</label>
                                        <input type="number" value={formData.current_quantity} onChange={(e) => setFormData({...formData, current_quantity: e.target.value})} className="w-full p-2 border rounded-lg bg-transparent" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Min Stock Level</label>
                                        <input type="number" value={formData.min_stock_level} onChange={(e) => setFormData({...formData, min_stock_level: e.target.value})} className="w-full p-2 border rounded-lg bg-transparent" required />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-primary text-white p-2 rounded-lg font-semibold mt-4">
                                    {modalType === 'edit' ? 'Save Changes' : 'Add Product'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleMovementSubmit} className="space-y-4">
                                <p className="text-gray-500 dark:text-gray-400">Updating stock for: <span className="font-bold text-primary">{selectedProduct.name}</span></p>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Quantity to {modalType.toUpperCase()}</label>
                                    <input type="number" value={movementQty} onChange={(e) => setMovementQty(e.target.value)} className="w-full p-2 border rounded-lg bg-transparent" required min="1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Reason (Optional)</label>
                                    <input type="text" value={movementReason} onChange={(e) => setMovementReason(e.target.value)} placeholder="e.g. New shipment, Damaged, Sale" className="w-full p-2 border rounded-lg bg-transparent" />
                                </div>
                                <button type="submit" className={`w-full p-2 rounded-lg font-semibold mt-4 text-white ${modalType === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}>
                                    Confirm Stock {modalType.toUpperCase()}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;