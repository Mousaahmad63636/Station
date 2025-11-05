export interface Container {
  id: string
  name: string
  capacity: number
  current_level: number
  fuel_type: string
  created_at: string
  updated_at: string
}

export interface Pump {
  id: string
  name: string
  container_id: string | null
  total_counter: number
  daily_counter: number
  is_active: boolean
  fuel_type: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  barcode: string
  name: string
  category: string
  cost_price: number
  sale_price: number
  current_stock: number
  min_stock_level: number
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  type: 'fuel' | 'product'
  pump_id?: string
  product_id?: string
  quantity: number
  unit_price: number
  total_amount: number
  payment_method: string
  created_at: string
}

export interface Expense {
  id: string
  category: string
  description: string
  amount: number
  payment_method: string
  receipt_number?: string
  vendor?: string
  created_at: string
  updated_at: string
}

export interface DailySummary {
  date: string
  total_fuel_sales: number
  total_product_sales: number
  total_expenses: number
  net_profit: number
}
