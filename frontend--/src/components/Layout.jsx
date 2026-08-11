import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, RefreshCw, LogOut, Bell, AlertTriangle, XCircle, History, Sparkles, Building2, Menu, X, Globe, Tag, ClipboardList, ShoppingCart, BarChart3, Users, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const [active, setActive] = useState('Dashboard');
    const [showNotifications, setShowNotifications] = useState(false);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const lowStock = res.data.filter(p => p.current_quantity <= p.min_stock_level);
                setLowStockItems(lowStock);
            } catch (error) { console.error("Error fetching notifications", error); }
        };
        fetchNotifications();
    }, []);

    // Parse permissions safely
    let userPerms = {};
    try {
        if (user?.permissions) {
            userPerms = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
        }
    } catch (e) { console.error("Error parsing permissions", e); }

    const allNavItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', perm: 'Dashboard' },
        { name: 'Products', icon: Package, path: '/products', perm: 'Products' },
        { name: 'Sales / POS', icon: ShoppingCart, path: '/sales', perm: 'Sales' },
        { name: 'Orders', icon: ClipboardList, path: '/orders', perm: 'Orders' },
        { name: 'Expenses', icon: Wallet, path: '/expenses', perm: 'Expenses' },
        { name: 'Suppliers', icon: Building2, path: '/suppliers', perm: 'Suppliers' },
        { name: 'Categories', icon: Tag, path: '/categories', perm: 'Categories' },
        { name: 'Reports', icon: BarChart3, path: '/reports', perm: 'Reports' },
        { name: 'Team', icon: Users, path: '/team', perm: 'Team' },
        { name: 'History', icon: History, path: '/history', perm: 'History' },
        { name: 'AI Assistant', icon: Sparkles, path: '/ai-assistant', perm: 'Assistant' },
        { name: 'Restock', icon: RefreshCw, path: '/restock', perm: 'Restock' },
    ];

    // Filter logic: Admins see everything. Staff only see what Master Admin allows.
    const navItems = allNavItems.filter(item => {
        if (user?.role === 'Admin') return true; 
        return userPerms[item.perm] === true; // Strictly check if it's true
    });

    const handleNavClick = (name) => { setActive(name); setIsSidebarOpen(false); };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-900">
            {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>}

            <div className={`fixed z-40 w-64 h-full bg-gray-800 border-r border-gray-700 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 text-2xl font-bold text-blue-500 flex items-center justify-between">
                    <div className="flex items-center gap-2"><Package /> StockFlow</div>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link key={item.name} to={item.path} onClick={() => handleNavClick(item.name)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active === item.name ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                            <item.icon size={20} /> {item.name}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <Link to="/" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-blue-500 transition-colors"><Globe size={18} /> Back to Website</Link>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden w-full">
                <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 md:px-6 relative z-20 shrink-0">
                    <div className="flex items-center gap-2 md:gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-700 text-gray-300"><Menu size={24} /></button>
                        <h1 className="text-lg md:text-xl font-semibold text-white hidden sm:block">{active}</h1>
                    </div>
                    
                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-full hover:bg-gray-700 text-gray-300">
                                <Bell size={20} />
                                {lowStockItems.length > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{lowStockItems.length}</span>}
                            </button>
                            {showNotifications && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                                    <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-20 overflow-hidden">
                                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                                            <h3 className="font-bold text-white">Notifications</h3>
                                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full font-medium">{lowStockItems.length} Alerts</span>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {lowStockItems.length === 0 ? (
                                                <div className="p-8 text-center text-gray-400"><Bell size={32} className="mx-auto mb-2 opacity-30" /><p>You're all caught up!</p></div>
                                            ) : (
                                                lowStockItems.map((item) => (
                                                    <div key={item.id} className="p-4 border-b border-gray-700 flex items-start gap-3 hover:bg-gray-700/50">
                                                        <div className={`p-2 rounded-lg ${item.current_quantity === 0 ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
                                                            {item.current_quantity === 0 ? <XCircle size={16} className="text-red-500" /> : <AlertTriangle size={16} className="text-yellow-500" />}
                                                        </div>
                                                        <div className="flex-1"><p className="text-sm font-medium text-white">{item.name}</p><p className="text-xs text-gray-400 mt-1">{item.current_quantity === 0 ? 'Is completely out of stock!' : `Is running low (${item.current_quantity} left)`}</p></div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        {lowStockItems.length > 0 && user?.role === 'Admin' && (
                                            <Link to="/restock" onClick={() => { handleNavClick('Restock'); setShowNotifications(false); }} className="block w-full text-center p-3 bg-gray-900/50 text-blue-500 font-medium text-sm hover:bg-gray-900 transition-colors">View Restock List</Link>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">{user?.name.charAt(0)}</div>
                            <button onClick={logout} className="text-gray-400 hover:text-red-500"><LogOut size={20} /></button>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-900">{children}</main>
            </div>
        </div>
    );
};

export default Layout;