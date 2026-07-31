import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { LayoutDashboard, Package, RefreshCw, Moon, Sun, LogOut, Bell, AlertTriangle, XCircle, History } from 'lucide-react';

const Layout = ({ children }) => {
    const { darkMode, toggleDarkMode } = useTheme();
    const { user, logout } = useAuth();
    const [active, setActive] = useState('Dashboard');
    const [showNotifications, setShowNotifications] = useState(false);
    const [lowStockItems, setLowStockItems] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/products', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const lowStock = res.data.filter(p => p.current_quantity <= p.min_stock_level);
                setLowStockItems(lowStock);
            } catch (error) {
                console.error("Error fetching notifications", error);
            }
        };
        fetchNotifications();
    }, []);

    // Filter out Restock page if user is not Admin
      const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Products', icon: Package, path: '/products' },
        { name: 'History', icon: History, path: '/history' }, // <-- ADDED
        { name: 'Restock', icon: RefreshCw, path: '/restock', adminOnly: true },
    ].filter(item => !item.adminOnly || (user && user.role === 'Admin'));

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-6 text-2xl font-bold text-primary flex items-center gap-2">
                    <Package /> StockFlow
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setActive(item.name)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                active === item.name
                                    ? 'bg-primary text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            <item.icon size={20} /> {item.name}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Topbar */}
                <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 relative z-20">
                    <h1 className="text-xl font-semibold">{active}</h1>
                    <div className="flex items-center gap-4">
                        <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        
                        {/* Notification Bell */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)} 
                                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Bell size={20} />
                                {lowStockItems.length > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {lowStockItems.length}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                                    
                                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden">
                                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                            <h3 className="font-bold text-gray-800 dark:text-white">Notifications</h3>
                                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">{lowStockItems.length} Alerts</span>
                                        </div>
                                        
                                        <div className="max-h-80 overflow-y-auto">
                                            {lowStockItems.length === 0 ? (
                                                <div className="p-8 text-center text-gray-500">
                                                    <Bell size={32} className="mx-auto mb-2 opacity-30" />
                                                    <p>You're all caught up!</p>
                                                </div>
                                            ) : (
                                                lowStockItems.map((item) => (
                                                    <div key={item.id} className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                        <div className={`p-2 rounded-lg ${item.current_quantity === 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                                                            {item.current_quantity === 0 ? <XCircle size={16} className="text-red-500" /> : <AlertTriangle size={16} className="text-yellow-500" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                {item.current_quantity === 0 ? 'Is completely out of stock!' : `Is running low (${item.current_quantity} left)`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                            
                                          {/* Only show this button if the user is an Admin */}
                                        {lowStockItems.length > 0 && user?.role === 'Admin' && (
                                            <Link to="/restock" onClick={() => { setActive('Restock'); setShowNotifications(false); }} className="block w-full text-center p-3 bg-gray-50 dark:bg-gray-900/50 text-primary font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                                                View Restock List
                                            </Link>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {user?.name.charAt(0)}
                            </div>
                            <button onClick={logout} className="text-gray-500 hover:text-red-500">
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </header>
                
                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;