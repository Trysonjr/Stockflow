-- StockFlow Database Schema
-- Run this in your MySQL client to set up the database

CREATE DATABASE IF NOT EXISTS stack;
USE stack;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Staff') DEFAULT 'Staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_info VARCHAR(255)
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50),
    supplier_id INT,
    buying_price DECIMAL(10, 2) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    current_quantity INT NOT NULL DEFAULT 0,
    min_stock_level INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- Stock Movements Table (History)
CREATE TABLE IF NOT EXISTS stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT,
    type ENUM('IN', 'OUT') NOT NULL,
    quantity INT NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Sample Data
INSERT IGNORE INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@stockflow.com', 'temppass', 'Admin'),
('Staff User', 'staff@stockflow.com', 'temppass', 'Staff');

INSERT IGNORE INTO suppliers (name, contact_info) VALUES 
('Tech Supplier Inc.', 'contact@techsupplier.com'),
('Global Goods Ltd.', 'sales@globalgoods.com');

INSERT IGNORE INTO products (name, sku, category, buying_price, selling_price, current_quantity, min_stock_level) VALUES 
('Wireless Mouse', 'WM-001', 'Electronics', 15.00, 29.99, 50, 20),
('Mechanical Keyboard', 'MK-002', 'Electronics', 45.00, 89.99, 15, 20),
('USB-C Cable', 'UC-003', 'Accessories', 2.00, 9.99, 5, 50),
('HD Monitor', 'HM-004', 'Electronics', 120.00, 199.99, 0, 10);