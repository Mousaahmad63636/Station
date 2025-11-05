-- Add Categories Table for Product Category Management
-- Run this in Supabase SQL Editor

-- 1. Create Categories Table
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_categories_name ON categories(name);

-- Insert default categories (optional)
INSERT INTO categories (name, description) VALUES
('Oil & Lubricants', 'Engine oils, transmission fluids, and lubricants'),
('Fluids', 'Brake fluid, coolant, windshield washer fluid'),
('Services', 'Car wash, oil change, and other services'),
('Accessories', 'Air fresheners, phone chargers, and accessories'),
('Maintenance', 'Filters, belts, and maintenance items'),
('Snacks & Drinks', 'Food and beverages for customers');
