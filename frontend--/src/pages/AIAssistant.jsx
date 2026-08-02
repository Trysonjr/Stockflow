import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, RefreshCw, Loader2, Send, MessageCircle, Sparkles } from 'lucide-react';
import axios from 'axios';

const AIAssistant = () => {
    const [aiForecast, setAiForecast] = useState("");
    const [loadingForecast, setLoadingForecast] = useState(false);
    
    const [messages, setMessages] = useState([{ role: 'assistant', text: "Hello! I am your StockFlow AI. Ask me about your inventory, stock levels, or financial values!" }]);
    const [input, setInput] = useState('');
    const [loadingChat, setLoadingChat] = useState(false);
    const token = localStorage.getItem('token');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
    useEffect(scrollToBottom, [messages]);

    useEffect(() => { fetchForecast(); }, []);

    const fetchForecast = async () => {
        setLoadingForecast(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/forecast`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAiForecast(res.data.forecast);
        } catch (error) {
            setAiForecast("Could not generate forecast at this time.");
        } finally {
            setLoadingForecast(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoadingChat(true);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/chat`, 
                { message: input },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I couldn't connect to the database." }]);
        } finally {
            setLoadingChat(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="text-purple-400" /> AI Assistant Hub
                    </h2>
                    <p className="text-gray-400 mt-1">Leverage artificial intelligence to manage your inventory.</p>
                </div>
            </div>

            {/* AI Forecasting Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg border border-indigo-500/30 text-white">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><BrainCircuit size={24} /></div>
                        <div>
                            <h3 className="text-lg font-bold">AI Demand Forecasting</h3>
                            <p className="text-sm text-indigo-100">Predictions based on last 30 days of data</p>
                        </div>
                    </div>
                    <button onClick={fetchForecast} disabled={loadingForecast} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm font-semibold transition-colors">
                        <RefreshCw size={16} className={loadingForecast ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>
                
                <div className="bg-black/20 rounded-xl p-4 mt-2 min-h-[120px]">
                    {loadingForecast ? (
                        <div className="flex items-center justify-center h-full min-h-[80px]">
                            <Loader2 size={24} className="animate-spin mr-2" />
                            <span className="text-indigo-100">Analyzing inventory trends...</span>
                        </div>
                    ) : (
                        <div className="text-indigo-50 text-sm space-y-2">
                            {aiForecast.split('\n').map((line, idx) => (
                                line.trim() && <p key={idx} className="flex items-start gap-2">
                                    <span className="text-yellow-300 mt-1">▸</span> {line.replace(/^-\s*/, '')}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* AI Chatbot Section */}
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col" style={{ height: '60vh' }}>
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-700">
                    <div className="p-2 bg-blue-500/10 rounded-xl"><MessageCircle className="text-blue-400" size={24} /></div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Inventory Chatbot</h3>
                        <p className="text-sm text-gray-400">Ask me about stock levels, values, or restocking</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 dark:bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loadingChat && (
                        <div className="flex justify-start">
                            <div className="bg-gray-700 p-3 rounded-xl">
                                <Loader2 size={16} className="animate-spin text-blue-400" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="mt-4 flex gap-2">
                    <input 
                        type="text" 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        placeholder="Ask AI about your inventory..." 
                        className="flex-1 p-3 text-sm rounded-lg bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-white"
                    />
                    <button type="submit" disabled={loadingChat} className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIAssistant;