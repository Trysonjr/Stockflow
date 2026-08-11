import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import Layout from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import Suppliers from './pages/Suppliers.jsx';
import Restock from './pages/Restock.jsx';
import History from './pages/History.jsx';
import AIAssistant from './pages/AIAssistant.jsx';
import Categories from './pages/Categories.jsx'; 
import Orders from './pages/Orders.jsx'; 
import Sales from './pages/Sales.jsx';
import Reports from './pages/Reports.jsx'; 
import Team from './pages/Team.jsx'; 
import Expenses from './pages/Expenses.jsx'; 

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    // If logged out, redirect to the Landing page instead of Login
    if (!user) return <Navigate to="/" />;
    return <Layout>{children}</Layout>;
};

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ToastProvider>
                    <Router>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Landing />} />
                            <Route path="/login" element={<Login />} />
                            
                            {/* Protected Routes */}
                            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                            <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
                            <Route path="/restock" element={<ProtectedRoute><Restock /></ProtectedRoute>} />
                            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                            <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
                            <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
                            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                            <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
                            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} /> 
                            <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} /> 
                            <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
                        </Routes>
                    </Router>
                </ToastProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;