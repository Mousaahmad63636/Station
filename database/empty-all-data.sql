-- Empty all data from all tables
-- Run this in Supabase SQL Editor to clear all data while keeping table structure

-- Disable foreign key checks temporarily (if needed)
-- Note: Supabase/PostgreSQL doesn't have FOREIGN_KEY_CHECKS like MySQL
-- Instead, we'll delete in the correct order to avoid foreign key violations

-- Delete data in order to respect foreign key constraints
-- Start with tables that reference other tables

-- 1. Delete fuel purchases (references containers)
DELETE FROM public.fuel_purchases;

-- 2. Delete sales (references pumps and products)
DELETE FROM public.sales;

-- 3. Delete pumps (references containers)
DELETE FROM public.pumps;

-- 4. Delete products (no dependencies)
DELETE FROM public.products;

-- 5. Delete containers (no dependencies)
DELETE FROM public.containers;

-- 6. Delete expenses (no dependencies)
DELETE FROM public.expenses;

-- 7. Delete expense categories (no dependencies)
DELETE FROM public.expense_categories;

-- 8. Delete fuel prices (no dependencies)
DELETE FROM public.fuel_prices;

-- 9. Delete categories (no dependencies)
DELETE FROM public.categories;

-- 10. Delete daily summaries (no dependencies)
DELETE FROM public.daily_summaries;

-- Reset sequences (auto-increment counters) if any exist
-- Note: UUID tables don't need sequence resets, but including for completeness

-- Verify all tables are empty
SELECT 
  'categories' as table_name, COUNT(*) as row_count FROM public.categories
UNION ALL
SELECT 
  'containers' as table_name, COUNT(*) as row_count FROM public.containers
UNION ALL
SELECT 
  'daily_summaries' as table_name, COUNT(*) as row_count FROM public.daily_summaries
UNION ALL
SELECT 
  'expense_categories' as table_name, COUNT(*) as row_count FROM public.expense_categories
UNION ALL
SELECT 
  'expenses' as table_name, COUNT(*) as row_count FROM public.expenses
UNION ALL
SELECT 
  'fuel_prices' as table_name, COUNT(*) as row_count FROM public.fuel_prices
UNION ALL
SELECT 
  'fuel_purchases' as table_name, COUNT(*) as row_count FROM public.fuel_purchases
UNION ALL
SELECT 
  'products' as table_name, COUNT(*) as row_count FROM public.products
UNION ALL
SELECT 
  'pumps' as table_name, COUNT(*) as row_count FROM public.pumps
UNION ALL
SELECT 
  'sales' as table_name, COUNT(*) as row_count FROM public.sales
ORDER BY table_name;
