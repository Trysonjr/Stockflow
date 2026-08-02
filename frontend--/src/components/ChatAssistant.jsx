import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import axios from 'axios';

const ChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello! I am your StockFlow AI. Ask me about your inventory!" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('token');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/chat`, 
                { message: input },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const aiMessage = { role: 'assistant', text: res.data.reply };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = { role: 'assistant', text: "Sorry, I couldn't connect to the database." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-slide-up">
                    {/* Header */}
                    <div className="bg-primary p-4 text-white flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2"><MessageCircle size={20} /> StockFlow AI</h3>
                        <button onClick={() => setIsOpen(false)}><X size={20} /></button>
                    </div>
                    
                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 dark:bg-gray-900">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white dark:bg-gray-800 dark:text-gray-200 text-gray-800 shadow-sm rounded-bl-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm">
                                    <Loader2 size={16} className="animate-spin text-primary" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2 bg-white dark:bg-gray-800">
                        <input 
                            type="text" 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            placeholder="Ask about inventory..." 
                            className="flex-1 p-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-1 focus:ring-primary outline-none dark:text-white"
                        />
                        <button type="submit" disabled={loading} className="bg-primary text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Bubble Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110 active:scale-90"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>
        </div>
    );
};

export default ChatAssistant;