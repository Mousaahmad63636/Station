-- Add Expense Categories Table for Expense Category Management
-- Run this in Supabase SQL Editor

-- 1. Create Expense Categories Table
CREATE TABLE expense_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger for updated_at
CREATE TRIGGER update_expense_categories_updated_at BEFORE UPDATE ON expense_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_expense_categories_name ON expense_categories(name);

-- Insert default expense categories
INSERT INTO expense_categories (name, description) VALUES
('Utilities', 'Electricity, water, gas, internet, phone bills'),
('Maintenance', 'Equipment repairs, pump maintenance, facility upkeep'),
('Inventory', 'Product purchases, fuel purchases, stock replenishment'),
('Insurance', 'Business insurance, liability insurance, equipment insurance'),
('Fuel Purchase', 'Wholesale fuel purchases for tanks'),
('Salaries', 'Employee wages, benefits, payroll taxes'),
('Marketing', 'Advertising, promotions, signage, marketing materials'),
('Office Supplies', 'Stationery, cleaning supplies, office equipment'),
('Professional Services', 'Accounting, legal, consulting fees'),
('Taxes & Licenses', 'Business taxes, permits, licenses, regulatory fees'),
('Equipment', 'New equipment purchases, tools, technology'),
('Other', 'Miscellaneous expenses not covered by other categories');
