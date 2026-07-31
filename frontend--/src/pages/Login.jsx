import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, LogIn, Boxes, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('admin@stockflow.com');
    const [password, setPassword] = useState('password123');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            login(res.data.user, res.data.token);
            navigate('/');
        } catch (err) {
            alert('Login failed. Check credentials.');
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">
            
            {/* Left Side - Brand & Marketing */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden flex-col justify-between p-12 text-white">
                
                {/* Decorative geometric shapes */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full -translate-y-1/2 translate-x-1/3 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-700 rounded-full translate-y-1/2 -translate-x-1/4 opacity-50"></div>
                <div className="absolute top-1/3 left-1/4 w-32 h-32 border-4 border-white/10 rounded-lg rotate-12"></div>

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3 text-2xl font-bold">
                    <Package size={32} />
                    <span>StockFlow</span>
                </div>

                {/* Main Pitch */}
                <div className="relative z-10 space-y-6">
                    <h1 className="text-5xl font-extrabold leading-tight">
                        The modern way to manage your inventory.
                    </h1>
                    <p className="text-lg text-blue-100 max-w-md">
                        Stop guessing about your stock levels. Automate your restocking, track movements, and grow your business with confidence.
                    </p>
                    
                    {/* Feature List */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-sm">
                                <Boxes size={22} />
                            </div>
                            <p className="font-medium text-lg">Real-time stock tracking</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-sm">
                                <TrendingUp size={22} />
                            </div>
                            <p className="font-medium text-lg">Smart restock cost calculations</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-sm">
                                <ShieldCheck size={22} />
                            </div>
                            <p className="font-medium text-lg">Role-based team access</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-sm text-blue-200">
                    © 2026 StockFlow Inc. All rights reserved.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md space-y-8">
                    
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 text-2xl font-bold text-blue-600 mb-10">
                        <Package size={32} />
                        <span>StockFlow</span>
                    </div>

                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900">Welcome back</h2>
                        <p className="mt-2 text-gray-500">Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 shadow-sm" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 shadow-sm" 
                                required 
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">Remember me</label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Forgot password?</a>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg group"
                        >
                            Sign In 
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;