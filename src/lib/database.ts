import { supabase } from './supabase'
import { Container, Pump, Product, Sale, Expense, DailySummary } from './types'

// Category functions
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data || []
}

export const addCategory = async (category: { name: string; description?: string }) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateCategory = async (id: string, updates: { name?: string; description?: string }) => {
  const { error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
  
  if (error) throw error
}

export const deleteCategory = async (id: string) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Container functions
export const getContainers = async (): Promise<Container[]> => {
  const { data, error } = await supabase
    .from('containers')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data || []
}

export const updateContainerLevel = async (id: string, newLevel: number) => {
  const { error } = await supabase
    .from('containers')
    .update({ current_level: newLevel })
    .eq('id', id)
  
  if (error) throw error
}

// Pump functions
export const getPumps = async (): Promise<Pump[]> => {
  const { data, error } = await supabase
    .from('pumps')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data || []
}

export const updatePumpCounter = async (id: string, newCounter: number, dailySales: number) => {
  const { error } = await supabase
    .from('pumps')
    .update({ 
      total_counter: newCounter,
      daily_counter: dailySales 
    })
    .eq('id', id)
  
  if (error) throw error
}

export const togglePumpStatus = async (id: string, isActive: boolean) => {
  const { error } = await supabase
    .from('pumps')
    .update({ is_active: isActive })
    .eq('id', id)
  
  if (error) throw error
}

export const resetDailyCounters = async () => {
  const { error } = await supabase
    .from('pumps')
    .update({ daily_counter: 0 })
  
  if (error) throw error
}

export const addPump = async (pump: Omit<Pump, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('pumps')
    .insert([pump])
    .select()
  
  if (error) throw error
  return data[0]
}

// Product functions
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data || []
}

export const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateProductStock = async (id: string, newStock: number) => {
  const { error } = await supabase
    .from('products')
    .update({ current_stock: newStock })
    .eq('id', id)
  
  if (error) throw error
}

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
  
  if (error) throw error
}

// Sales functions
export const getSales = async (limit?: number): Promise<Sale[]> => {
  let query = supabase
    .from('sales')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (limit) {
    query = query.limit(limit)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data || []
}

export const addSale = async (sale: Omit<Sale, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('sales')
    .insert([sale])
    .select()
  
  if (error) throw error
  return data[0]
}

export const getSalesByDateRange = async (startDate: string, endDate: string): Promise<Sale[]> => {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Expense functions
export const getExpenses = async (): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export const addExpense = async (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('expenses')
    .insert([expense])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateExpense = async (id: string, updates: Partial<Expense>) => {
  const { error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
  
  if (error) throw error
}

export const deleteExpense = async (id: string) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Dashboard/Analytics functions
export const getDashboardStats = async () => {
  const today = new Date().toISOString().split('T')[0]
  
  // Get today's sales
  const { data: todaySales, error: salesError } = await supabase
    .from('sales')
    .select('*')
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`)
  
  if (salesError) throw salesError
  
  // Get today's expenses
  const { data: todayExpenses, error: expensesError } = await supabase
    .from('expenses')
    .select('*')
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`)
  
  if (expensesError) throw expensesError
  
  // Calculate totals
  const fuelSales = todaySales?.filter(s => s.type === 'fuel').reduce((sum, s) => sum + s.total_amount, 0) || 0
  const productSales = todaySales?.filter(s => s.type === 'product').reduce((sum, s) => sum + s.total_amount, 0) || 0
  const totalExpenses = todayExpenses?.reduce((sum, e) => sum + e.amount, 0) || 0
  
  return {
    totalSales: fuelSales + productSales,
    fuelSales,
    productSales,
    totalExpenses,
    netProfit: (fuelSales + productSales) - totalExpenses,
    salesCount: todaySales?.length || 0
  }
}

export const getRecentSales = async (limit: number = 10) => {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      pumps(name),
      products(name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data || []
}

// Record fuel sale from counter reading
export const recordFuelSale = async (
  pumpId: string, 
  oldCounter: number, 
  newCounter: number, 
  pricePerLiter: number
) => {
  const fuelSold = newCounter - oldCounter
  const totalAmount = fuelSold * pricePerLiter
  
  // Start a transaction
  const { data: pump, error: pumpError } = await supabase
    .from('pumps')
    .select('*, containers(*)')
    .eq('id', pumpId)
    .single()
  
  if (pumpError) throw pumpError
  
  // Update pump counter
  await updatePumpCounter(pumpId, newCounter, pump.daily_counter + fuelSold)
  
  // Reduce fuel from container
  if (pump.container_id) {
    const newContainerLevel = pump.containers.current_level - fuelSold
    await updateContainerLevel(pump.container_id, newContainerLevel)
  }
  
  // Record the sale
  const sale = await addSale({
    type: 'fuel',
    pump_id: pumpId,
    product_id: undefined,
    quantity: fuelSold,
    unit_price: pricePerLiter,
    total_amount: totalAmount,
    payment_method: 'fuel_counter'
  })
  
  return {
    fuelSold,
    totalAmount,
    sale
  }
}
