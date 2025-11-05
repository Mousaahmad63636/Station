-- Fuel Station Management Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Containers (Fuel Tanks)
CREATE TABLE containers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity DECIMAL(10,2) NOT NULL,
    current_level DECIMAL(10,2) NOT NULL DEFAULT 0,
    fuel_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Pumps
CREATE TABLE pumps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    container_id UUID REFERENCES containers(id),
    total_counter DECIMAL(10,2) NOT NULL DEFAULT 0,
    daily_counter DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    fuel_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Products
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    barcode VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2) NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Sales
CREATE TABLE sales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('fuel', 'product')),
    pump_id UUID REFERENCES pumps(id),
    product_id UUID REFERENCES products(id),
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Expenses
CREATE TABLE expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    receipt_number VARCHAR(100),
    vendor VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Daily Summaries (for reporting)
CREATE TABLE daily_summaries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_fuel_sales DECIMAL(10,2) DEFAULT 0,
    total_product_sales DECIMAL(10,2) DEFAULT 0,
    total_expenses DECIMAL(10,2) DEFAULT 0,
    net_profit DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sales_type ON sales(type);
CREATE INDEX idx_expenses_created_at ON expenses(created_at);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_pumps_container_id ON pumps(container_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_containers_updated_at BEFORE UPDATE ON containers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pumps_updated_at BEFORE UPDATE ON pumps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_summaries_updated_at BEFORE UPDATE ON daily_summaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO containers (name, capacity, current_level, fuel_type) VALUES
('Tank 1', 10000, 7500, 'Regular'),
('Tank 2', 8000, 6200, 'Premium'),
('Tank 3', 5000, 3800, 'Diesel');

INSERT INTO pumps (name, container_id, total_counter, daily_counter, fuel_type) VALUES
('Pump A', (SELECT id FROM containers WHERE name = 'Tank 1'), 4250, 180, 'Regular'),
('Pump B', (SELECT id FROM containers WHERE name = 'Tank 1'), 3890, 145, 'Regular'),
('Pump C', (SELECT id FROM containers WHERE name = 'Tank 2'), 5120, 220, 'Premium'),
('Pump D', (SELECT id FROM containers WHERE name = 'Tank 2'), 2340, 0, 'Premium'),
('Pump E', (SELECT id FROM containers WHERE name = 'Tank 3'), 6780, 310, 'Diesel'),
('Pump F', (SELECT id FROM containers WHERE name = 'Tank 3'), 4560, 195, 'Diesel');

INSERT INTO products (barcode, name, category, cost_price, sale_price, current_stock, min_stock_level) VALUES
('1234567890123', 'Engine Oil 5W-30', 'Oil & Lubricants', 18.50, 25.00, 45, 10),
('2345678901234', 'Brake Fluid DOT 4', 'Fluids', 8.00, 12.00, 5, 15),
('3456789012345', 'Car Wash Premium', 'Services', 5.00, 15.00, 100, 20),
('4567890123456', 'Air Freshener', 'Accessories', 2.50, 5.00, 25, 10),
('5678901234567', 'Windshield Washer Fluid', 'Fluids', 3.00, 6.50, 8, 12);

-- Create a view for easy reporting
CREATE VIEW sales_summary AS
SELECT 
    DATE(created_at) as sale_date,
    type,
    COUNT(*) as transaction_count,
    SUM(quantity) as total_quantity,
    SUM(total_amount) as total_revenue
FROM sales
GROUP BY DATE(created_at), type
ORDER BY sale_date DESC, type;
