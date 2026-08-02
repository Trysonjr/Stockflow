const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const aiRoutes = require('./routes/aiRoutes');
const supplierRoutes = require('./routes/supplierRoutes'); 
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const saleRoutes = require('./routes/saleRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/categories', categoryRoutes); 
app.use('/api/orders', orderRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes); 
app.use('/api/users', userRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));