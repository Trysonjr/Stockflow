import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, BarChart3, BrainCircuit, Users, ArrowRight, X, Lock, Mail, User, ShoppingCart, ClipboardList, Sparkles, CheckCircle, Boxes, TrendingUp, ScanLine, Wallet } from 'lucide-react';
import axios from 'axios';

const Landing = () => {
    const [authMode, setAuthMode] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('admin@stockflow.com');
    const [password, setPassword] = useState('temppass');
    const { login } = useAuth();
    const navigate = useNavigate();

    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`, { email, password });
            login(res.data.user, res.data.token);
            navigate('/dashboard');
        } catch (err) { alert('Login failed. Check credentials.'); }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/register`, { name, email, password });
            login(res.data.user, res.data.token);
            navigate('/dashboard');
        } catch (err) { alert('Registration failed. Email might already be in use.'); }
    };

    return (
        <div className="bg-[#0a0a0f] text-white overflow-hidden pb-16"> {/* pb-16 so fixed marquee doesn't cover footer */}
            <style>{`
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
                @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
                .animate-marquee { animation: marquee 12s linear infinite; } /* Increased speed */
                .gradient-text { background: linear-gradient(to right, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            `}</style>

            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0f]/80 backdrop-blur-md border-b border-gray-800' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-lg sm:text-xl font-bold text-white">
                        <Package className="text-blue-500" /> StockFlow
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#workflow" className="hover:text-white transition-colors">How it Works</a>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button onClick={() => setAuthMode('login')} className="text-xs sm:text-sm font-medium text-gray-300 hover:text-white">Sign In</button>
                        <button onClick={() => setAuthMode('register')} className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20">Get Started</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 sm:pt-40 pb-20 overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-50 -translate-y-1/4 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-50 translate-y-1/4 -translate-x-1/4"></div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="animate-fade-in-up text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-6">
                            <Sparkles size={14} /> Powered by AI Demand Forecasting
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
                            Manage smarter. <br/> Restock faster. <br/> <span className="gradient-text">Grow confidently.</span>
                        </h1>
                        <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-lg mx-auto lg:mx-0">
                            The modern inventory management software for growing businesses. Track stock, process POS sales, automate purchase orders, and leverage AI.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button onClick={() => setAuthMode('register')} className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-500/30">
                                Sign up - It's Free <ArrowRight size={20} />
                            </button>
                            <button onClick={() => setAuthMode('login')} className="flex items-center justify-center gap-2 bg-gray-800 text-white border border-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all">
                                Live Demo
                            </button>
                        </div>
                    </div>

                    {/* Hero Image / Mockup */}
                    <div className="relative animate-fade-in-up hidden md:block" style={{ animationDelay: '0.2s' }}>
                        <div className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
                            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" alt="Dashboard Analytics" className="w-full h-auto object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent"></div>
                        </div>
                        
                        <div className="absolute -bottom-6 -left-6 bg-gray-900 shadow-xl rounded-xl p-4 border border-gray-800 flex items-center gap-3 animate-float">
                            <div className="p-2 bg-purple-500/20 rounded-lg"><BrainCircuit className="text-purple-400" size={24} /></div>
                            <div><p className="text-xs text-gray-500">AI Forecast</p><p className="font-bold text-white text-sm">Restock needed in 4 days</p></div>
                        </div>
                        
                        <div className="absolute -top-6 -right-6 bg-gray-900 shadow-xl rounded-xl p-4 border border-gray-800 flex items-center gap-3 animate-float" style={{ animationDelay: '1s' }}>
                            <div className="p-2 bg-green-500/20 rounded-lg"><ShoppingCart className="text-green-400" size={24} /></div>
                            <div><p className="text-xs text-gray-500">New Sale</p><p className="font-bold text-white text-sm">K 1,250.00</p></div>
                        </div>
                    </div>
                </div>
            </header>

            {/* How It Works Section (With Image) */}
            <section id="workflow" className="py-20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full filter blur-[100px]"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">From warehouse to checkout in seconds</h2>
                        <p className="text-gray-400 mb-8">StockFlow integrates your physical inventory with your digital sales. Say goodbye to manual spreadsheets and disconnected systems.</p>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="text-green-500" size={20} /> Automatic stock deductions on every sale</li>
                            <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="text-green-500" size={20} /> Instant alerts for low and out-of-stock items</li>
                            <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="text-green-500" size={20} /> Role-based access for Admins and Staff</li>
                            <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="text-green-500" size={20} /> Export reports to PDF or CSV instantly</li>
                        </ul>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-2xl transform transition-transform hover:scale-[1.02] duration-300">
                        <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop" alt="Warehouse Management" className="w-full h-[400px] object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-[#0d0d14] border-t border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Everything you need to run your warehouse</h2>
                        <p className="text-base sm:text-lg text-gray-500">Advanced features designed to streamline your entire supply chain.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-colors group">
                            <div className="p-3 bg-blue-500/10 rounded-xl inline-block mb-6 group-hover:scale-110 transition-transform"><BarChart3 className="text-blue-400" size={28} /></div>
                            <h3 className="text-xl font-bold text-white mb-3">Real-time Tracking</h3>
                            <p className="text-gray-400 text-sm">Monitor stock levels, movements, and financial valuations instantly.</p>
                        </div>
                        <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 hover:border-purple-500/50 transition-colors group">
                            <div className="p-3 bg-purple-500/10 rounded-xl inline-block mb-6 group-hover:scale-110 transition-transform"><BrainCircuit className="text-purple-400" size={28} /></div>
                            <h3 className="text-xl font-bold text-white mb-3">AI Demand Forecasting</h3>
                            <p className="text-gray-400 text-sm">Let our AI analyze 30-day trends to predict what you need to restock.</p>
                        </div>
                        <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 hover:border-green-500/50 transition-colors group">
                            <div className="p-3 bg-green-500/10 rounded-xl inline-block mb-6 group-hover:scale-110 transition-transform"><ShoppingCart className="text-green-400" size={28} /></div>
                            <h3 className="text-xl font-bold text-white mb-3">Built-in POS</h3>
                            <p className="text-gray-400 text-sm">Log outgoing sales directly. Inventory updates and revenue is tracked.</p>
                        </div>
                        <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 hover:border-orange-500/50 transition-colors group">
                            <div className="p-3 bg-orange-500/10 rounded-xl inline-block mb-6 group-hover:scale-110 transition-transform"><ClipboardList className="text-orange-400" size={28} /></div>
                            <h3 className="text-xl font-bold text-white mb-3">Purchase Orders</h3>
                            <p className="text-gray-400 text-sm">Create restock orders. When received, stock updates automatically.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">Ready to optimize your inventory?</h2>
                    <p className="text-base sm:text-lg text-gray-400 mb-8">Join StockFlow today and take control of your stock management.</p>
                    <button onClick={() => setAuthMode('register')} className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-purple-500/30">
                        Get Started Now <ArrowRight size={24} />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-8 bg-[#0a0a0f]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-gray-500 text-sm">
                    © 2026 StockFlow Inc. Manage smarter. Restock faster. Grow confidently.
                </div>
            </footer>

            {/* FIXED SCROLLING MARQUEE */}
            <div className="fixed bottom-0 left-0 right-0 z-30 py-3 bg-[#0d0d14] border-t border-gray-800 overflow-hidden">
                <div className="flex animate-marquee whitespace-nowrap">
                    <div className="flex items-center gap-6 mx-3 text-gray-500 text-sm font-semibold">
                        <span className="flex items-center gap-2"><Boxes size={16} className="text-blue-500" /> Real-Time Tracking</span>
                        <span>•</span>
                        <span className="flex items-center gap-2"><ScanLine size={16} className="text-blue-500" /> Barcode Scanning</span>
                        <span>•</span>
                        <span className="flex items-center gap-2"><ClipboardList size={16} className="text-purple-500" /> Purchase Orders</span>
                        <span>•</span>
                        <span className="flex items-center gap-2"><Wallet size={16} className="text-red-500" /> Expense Tracking</span>
                        <span>•</span>
                        <span className="flex items-center gap-2"><TrendingUp size={16} className="text-green-500" /> Net Profit Analytics</span>
                        <span>•</span>
                        <span className="flex items-center gap-2"><BrainCircuit size={16} className="text-purple-500" /> AI Insights</span>
                        <span>•</span>
                    </div>
                    <div className="flex items-center gap-6 mx-3 text-gray-500 text-sm font-semibold">
                        <span className="flex items-center gap-2"><Boxes size={16} className="text-blue-500" /> Real-Time Tracking</span>
                        <span>•</span>
                        <span className="flex items-center gap-2"><ScanLine size={16} className="text-blue-500" /> Barcode Scanning</span>
                        <span>•</span>
                        <span className="flex items-center gap-2"><ClipboardList size={16} className="text-purple-500" /> Purchase Orders</span>
                        <span>•</span>
                        <span className="flex items-center gap-2"><Wallet size={16} className="text-red-500" /> Expense Tracking</span>
                        <span>•</span>
                        <span className="flex items-center gap-2"><TrendingUp size={16} className="text-green-500" /> Net Profit Analytics</span>
                        <span>•</span>
                        <span className="flex items-center gap-2"><BrainCircuit size={16} className="text-purple-500" /> AI Insights</span>
                        <span>•</span>
                    </div>
                </div>
            </div>

            {/* AUTH POPUP MODAL */}
            {authMode && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-[#0d0d14] rounded-2xl shadow-2xl w-full max-w-md p-8 relative border border-gray-800 animate-fade-in-up">
                        <button onClick={() => setAuthMode(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
                        
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl mb-4 shadow-lg shadow-purple-500/30">
                                <Package size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-white">{authMode === 'login' ? 'Welcome Back' : 'Create your account'}</h2>
                            <p className="text-gray-500 text-sm mt-1">{authMode === 'login' ? 'Sign in to access your dashboard' : 'Start managing your inventory today'}</p>
                        </div>

                        {authMode === 'login' ? (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 text-gray-600" size={18} />
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0f] border border-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 text-gray-600" size={18} />
                                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0f] border border-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white" required />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-6">Sign In <ArrowRight size={18} /></button>
                                <p className="text-center text-sm text-gray-500 mt-4">Don't have an account? <button type="button" onClick={() => setAuthMode('register')} className="text-purple-400 font-semibold hover:underline">Sign up</button></p>
                            </form>
                        ) : (
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-gray-600" size={18} />
                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0f] border border-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 text-gray-600" size={18} />
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0f] border border-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 text-gray-600" size={18} />
                                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0f] border border-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white" required />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-6">Create Account <ArrowRight size={18} /></button>
                                <p className="text-center text-sm text-gray-500 mt-4">Already have an account? <button type="button" onClick={() => setAuthMode('login')} className="text-purple-400 font-semibold hover:underline">Sign in</button></p>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Landing;