import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Loader2, DollarSign, Receipt, ScanLine, Trash2, Search, Camera, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';

const Sales = () => {
    const { showToast } = useToast();
    const { user } = useAuth();
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [scanInput, setScanInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const token = localStorage.getItem('token');
    const scanRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchSales();
        fetchProducts();
        scanRef.current?.focus();
    }, []);

    const fetchSales = async () => {
        try {
            const res = await axios.get(`${API_URL}/sales`, { headers: { Authorization: `Bearer ${token}` } });
            setSales(res.data);
        } catch (error) { console.error("Error fetching sales:", error); }
    };

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/products`, { headers: { Authorization: `Bearer ${token}` } });
            setProducts(res.data);
        } catch (error) { console.error("Error fetching products:", error); }
    };

    const printReceipt = (receiptData) => {
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        let itemsHtml = receiptData.items.map(item => `
            <p><strong>${item.quantity}x ${item.product_name}</strong> ..... K ${Number(item.total_price).toFixed(2)}</p>
        `).join('');

        printWindow.document.write(`
            <html>
            <head>
                <title>Receipt #${receiptData.receipt_id}</title>
                <style>
                    body { font-family: 'Courier New', monospace; width: 80mm; margin: 0 auto; padding: 10px; color: #000; }
                    h2 { text-align: center; margin: 5px 0; font-size: 18px; }
                    p { margin: 2px 0; font-size: 12px; }
                    .divider { border-top: 1px dashed #000; margin: 10px 0; }
                    .total { font-weight: bold; font-size: 14px; }
                    .center { text-align: center; }
                </style>
            </head>
            <body>
                <h2>StockFlow POS</h2>
                <p class="center">123 Main Street, Lusaka</p>
                <div class="divider"></div>
                <p><strong>Receipt #:</strong> ${receiptData.receipt_id}</p>
                <p><strong>Teller:</strong> ${receiptData.teller_name}</p>
                <p><strong>Date:</strong> ${receiptData.timestamp}</p>
                <div class="divider"></div>
                ${itemsHtml}
                <div class="divider"></div>
                <p class="total">GRAND TOTAL: K ${Number(receiptData.grand_total).toFixed(2)}</p>
                <div class="divider"></div>
                <p class="center">Thank you for shopping with us!</p>
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const addToCart = (product, qty = 1) => {
        if (product.current_quantity < qty) {
            showToast(`${product.name} is out of stock!`, 'error');
            return;
        }

        const existingItem = cart.find(item => item.product_id === product.id);
        if (existingItem) {
            if (existingItem.quantity + qty > product.current_quantity) {
                showToast(`Cannot add more. Stock limit reached for ${product.name}.`, 'error');
                return;
            }
            setCart(cart.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + qty } : item));
            showToast(`${product.name} quantity updated`);
        } else {
            setCart([...cart, { 
                product_id: product.id, 
                name: product.name, 
                price: Number(product.selling_price), 
                quantity: qty 
            }]);
            showToast(`${product.name} added to cart`);
        }
    };

    // --- NEW: Camera Scanner Functions ---
    const startCamera = () => {
        setIsCameraOpen(true);
        setTimeout(() => {
            html5QrCodeRef.current = new Html5Qrcode("camera-reader-sales");
            html5QrCodeRef.current.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 150 } },
                (decodedText) => {
                    const scannedSku = decodedText.trim().toLowerCase();
                    const foundProduct = products.find(p => p.sku.toLowerCase() === scannedSku);
                    
                    if (foundProduct) {
                        addToCart(foundProduct);
                        stopCamera(); // Close camera after successful scan
                    } else {
                        showToast(`No product found for barcode: ${decodedText}`, 'error');
                    }
                },
                () => {}
            ).catch(err => {
                showToast("Camera access denied.", 'error');
                setIsCameraOpen(false);
            });
        }, 100);
    };

    const stopCamera = async () => {
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop();
                await html5QrCodeRef.current.clear();
            } catch (err) { console.error(err); }
        }
        setIsCameraOpen(false);
    };

    const handleScanKeyDown = (e) => {
        if (e.key === 'Enter' && scanInput.trim() !== '') {
            e.preventDefault();
            const scannedSku = scanInput.trim().toLowerCase();
            const foundProduct = products.find(p => p.sku.toLowerCase() === scannedSku);
            
            if (foundProduct) {
                addToCart(foundProduct);
                setScanInput('');
            } else {
                showToast(`No product found for barcode: ${scanInput}`, 'error');
                setScanInput('');
            }
        }
    };

    const updateCartQty = (id, newQty) => {
        if (newQty < 1) return;
        const product = products.find(p => p.id === id);
        if (product && newQty > product.current_quantity) {
            showToast(`Stock limit reached for ${product.name}.`, 'error');
            return;
        }
        setCart(cart.map(item => item.product_id === id ? { ...item, quantity: newQty } : item));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.product_id !== id));
    };

    const handleCompleteSale = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/sales`, 
                { items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity })) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast('Sale completed successfully!');
            setCart([]);
            fetchSales();
            printReceipt(res.data.receipt);
            setTimeout(() => scanRef.current?.focus(), 100);
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to complete sale', 'error');
        } finally {
            setLoading(false);
        }
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalRevenue = sales.reduce((acc, sale) => acc + Number(sale.total_price), 0);
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white">Sales / POS</h2>
                <p className="text-gray-400 mt-1">Scan barcodes or click products to add them to the cart.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Side: Scanning & Product Grid (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Scanner Input Bar */}
                    <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-xl">
                                <ScanLine className="text-green-400" size={28} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-white">Ready to Scan</h3>
                                <p className="text-xs text-gray-400 mb-2">Click here and scan with your USB/Bluetooth scanner</p>
                                <input 
                                    ref={scanRef}
                                    type="text" 
                                    value={scanInput} 
                                    onChange={(e) => setScanInput(e.target.value)} 
                                    onKeyDown={handleScanKeyDown} 
                                    placeholder="Waiting for scanner..." 
                                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                        </div>
                        <button onClick={startCamera} className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                            <Camera size={20} /> Scan with Phone Camera
                        </button>
                    </div>

                    {/* Product Search & Grid */}
                    <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search products to add to cart..." 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
                            {filteredProducts.length === 0 ? (
                                <p className="col-span-full text-gray-500 text-center py-8">No products found.</p>
                            ) : (
                                filteredProducts.map(p => (
                                    <button 
                                        key={p.id} 
                                        onClick={() => addToCart(p)}
                                        disabled={p.current_quantity === 0}
                                        className={`p-4 rounded-xl border text-left flex flex-col justify-between h-32 transition-all ${p.current_quantity === 0 ? 'bg-gray-900 border-gray-800 opacity-50 cursor-not-allowed' : 'bg-gray-900 border-gray-700 hover:border-blue-500 hover:bg-gray-800 active:scale-95'}`}
                                    >
                                        <div>
                                            <p className="font-bold text-white text-sm leading-tight mb-1 truncate">{p.name}</p>
                                            <p className="text-xs text-gray-500">{p.category}</p>
                                        </div>
                                        <div className="flex justify-between items-end mt-2">
                                            <span className="font-bold text-blue-400 text-sm">K {Number(p.selling_price).toFixed(2)}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.current_quantity === 0 ? 'bg-red-500/20 text-red-400' : p.current_quantity <= p.min_stock_level ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                                                {p.current_quantity} left
                                            </span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Checkout Cart (1/3 width) */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 sticky top-6 flex flex-col max-h-[calc(100vh-3rem)]">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 shrink-0">
                            <ShoppingCart size={24} /> Current Cart
                        </h3>
                        
                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto mb-4 pr-2">
                            {cart.length === 0 ? (
                                <p className="text-gray-500 text-center py-12">Cart is empty. Click a product to add it.</p>
                            ) : (
                                <div className="space-y-2">
                                    {cart.map(item => (
                                        <div key={item.product_id} className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-700">
                                            <div className="flex-1 mr-2">
                                                <p className="font-medium text-white text-sm leading-tight">{item.name}</p>
                                                <p className="text-xs text-gray-500 mt-1">K {Number(item.price).toFixed(2)} each</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <input 
                                                    type="number" 
                                                    value={item.quantity} 
                                                    onChange={(e) => updateCartQty(item.product_id, Number(e.target.value))} 
                                                    className="w-14 p-1 bg-gray-800 border border-gray-700 rounded text-white text-center text-sm" 
                                                    min="1" 
                                                />
                                                <button onClick={() => removeFromCart(item.product_id)} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Checkout Summary */}
                        <div className="border-t border-gray-700 pt-4 shrink-0">
                            <div className="flex justify-between text-2xl font-extrabold text-white mb-4">
                                <span>Total:</span>
                                <span className="text-green-400">K {cartTotal.toFixed(2)}</span>
                            </div>

                            <button 
                                onClick={handleCompleteSale} 
                                disabled={loading || cart.length === 0} 
                                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 mb-2"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : <Receipt size={20} />} Complete Sale & Print
                            </button>
                            {cart.length > 0 && (
                                <button onClick={() => setCart([])} className="w-full flex items-center justify-center gap-2 bg-gray-700 text-gray-300 p-2 rounded-lg font-medium hover:bg-gray-600 transition-colors text-sm">
                                    Cancel Sale
                                </button>
                            )}

                            <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
                                <p>Teller: <span className="font-bold text-gray-400">{user?.name}</span></p>
                                <p>Time: <span className="font-bold text-gray-400">{new Date().toLocaleString()}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales History Table */}
            <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden mt-6">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-white">Recent Transactions</h3>
                    <div className="text-sm text-gray-400">Total Revenue: <span className="font-bold text-green-400">K {totalRevenue.toFixed(2)}</span></div>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-700 text-gray-400">
                            <th className="text-left p-4">Sale ID</th>
                            <th className="text-left p-4">Product</th>
                            <th className="text-left p-4">Qty</th>
                            <th className="text-left p-4">Total</th>
                            <th className="text-left p-4">Teller</th>
                            <th className="text-left p-4">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500">No sales recorded yet.</td></tr>
                        ) : (
                            sales.map((s) => (
                                <tr key={s.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-4 font-medium text-white">#{s.id}</td>
                                    <td className="p-4 text-gray-300">{s.product_name}</td>
                                    <td className="p-4 text-white">{s.quantity}</td>
                                    <td className="p-4 font-bold text-green-400">K {Number(s.total_price).toFixed(2)}</td>
                                    <td className="p-4 text-gray-400">{s.teller_name}</td>
                                    <td className="p-4 text-gray-400">{new Date(s.created_at).toLocaleString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Camera Scanner Modal for Sales */}
            {isCameraOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
                    <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-gray-700">
                        <button onClick={stopCamera} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 bg-gray-900/50 p-2 rounded-full">
                            <X size={24} />
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-white text-center">Scan Barcode to Add to Cart</h2>
                        <div id="camera-reader-sales" className="w-full rounded-lg overflow-hidden"></div>
                        <p className="text-sm text-gray-400 text-center mt-4">Point your camera at the product barcode.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sales;