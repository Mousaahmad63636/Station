-- Add fuel prices table for settings
-- Run this in Supabase SQL Editor

-- Create fuel_prices table
CREATE TABLE fuel_prices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fuel_type VARCHAR(50) NOT NULL UNIQUE,
    price_per_liter DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_fuel_prices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fuel_prices_updated_at
    BEFORE UPDATE ON fuel_prices
    FOR EACH ROW
    EXECUTE FUNCTION update_fuel_prices_updated_at();

-- Insert default fuel prices
INSERT INTO fuel_prices (fuel_type, price_per_liter) VALUES
('Regular Gasoline', 1.45),
('Premium Gasoline', 1.65),
('Diesel', 1.55);

-- Add index for fuel_type
CREATE INDEX idx_fuel_prices_fuel_type ON fuel_prices(fuel_type);
