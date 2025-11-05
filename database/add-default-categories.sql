-- Add default expense categories and fuel prices
-- Run this in Supabase SQL Editor after emptying the database

-- Insert default expense categories
INSERT INTO public.expense_categories (name, description) VALUES
('Fuel Purchase', 'Fuel purchases for container refills - system managed'),
('Maintenance', 'Equipment and facility maintenance costs'),
('Utilities', 'Electricity, water, gas, internet bills'),
('Supplies', 'Office supplies, cleaning materials, etc.'),
('Insurance', 'Business insurance payments'),
('Rent', 'Property rent and lease payments'),
('Salaries', 'Employee wages and salaries'),
('Marketing', 'Advertising and promotional expenses'),
('Equipment', 'New equipment purchases'),
('Other', 'Miscellaneous expenses')
ON CONFLICT (name) DO NOTHING;

-- Insert default fuel prices for 3 fuel types
INSERT INTO public.fuel_prices (fuel_type, price_per_liter) VALUES
('Regular Gasoline', 1.45),
('Premium Gasoline', 1.65),
('Diesel', 1.55)
ON CONFLICT (fuel_type) DO NOTHING;

-- Insert default product categories
INSERT INTO public.categories (name, description) VALUES
('Beverages', 'Soft drinks, water, energy drinks'),
('Snacks', 'Chips, candy, nuts, crackers'),
('Tobacco', 'Cigarettes and tobacco products'),
('Automotive', 'Motor oil, windshield fluid, car accessories'),
('Food', 'Ready-to-eat meals, sandwiches'),
('Personal Care', 'Toiletries, hygiene products'),
('Electronics', 'Phone chargers, batteries, accessories'),
('Other', 'Miscellaneous products')
ON CONFLICT (name) DO NOTHING;

-- Verify the data was inserted
SELECT 'Expense Categories' as category_type, COUNT(*) as count FROM public.expense_categories
UNION ALL
SELECT 'Fuel Prices' as category_type, COUNT(*) as count FROM public.fuel_prices
UNION ALL
SELECT 'Product Categories' as category_type, COUNT(*) as count FROM public.categories;
