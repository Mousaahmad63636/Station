-- Add fuel purchase tracking for container refills
-- Run this in Supabase SQL Editor

-- Create fuel_purchases table to track fuel costs
CREATE TABLE fuel_purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    container_id UUID REFERENCES containers(id) ON DELETE CASCADE,
    liters_purchased DECIMAL(10,2) NOT NULL,
    cost_per_liter DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    supplier VARCHAR(200),
    invoice_number VARCHAR(100),
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_fuel_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fuel_purchases_updated_at
    BEFORE UPDATE ON fuel_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_fuel_purchases_updated_at();

-- Add indexes
CREATE INDEX idx_fuel_purchases_container_id ON fuel_purchases(container_id);
CREATE INDEX idx_fuel_purchases_purchase_date ON fuel_purchases(purchase_date);

-- Add "Fuel Purchase" expense category (non-deletable)
INSERT INTO expense_categories (name, description) VALUES
('Fuel Purchase', 'Fuel purchases for container refills - system managed')
ON CONFLICT (name) DO NOTHING;

-- Add a column to track average fuel cost per container
ALTER TABLE containers ADD COLUMN IF NOT EXISTS average_cost_per_liter DECIMAL(10,2) DEFAULT 0;
