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

// Expense Category functions
export const getExpenseCategories = async () => {
  const { data, error } = await supabase
    .from('expense_categories')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data || []
}

export const addExpenseCategory = async (category: { name: string; description?: string }) => {
  const { data, error } = await supabase
    .from('expense_categories')
    .insert([category])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateExpenseCategory = async (id: string, updates: { name?: string; description?: string }) => {
  const { error } = await supabase
    .from('expense_categories')
    .update(updates)
    .eq('id', id)
  
  if (error) throw error
}

export const deleteExpenseCategory = async (id: string) => {
  const { error } = await supabase
    .from('expense_categories')
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

export const addContainer = async (container: { name: string; capacity: number; fuel_type: string; current_level?: number }) => {
  const { data, error } = await supabase
    .from('containers')
    .insert([{
      name: container.name,
      capacity: container.capacity,
      fuel_type: container.fuel_type,
      current_level: container.current_level || 0
    }])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateContainer = async (id: string, updates: { name?: string; capacity?: number; fuel_type?: string; current_level?: number }) => {
  const { error } = await supabase
    .from('containers')
    .update(updates)
    .eq('id', id)
  
  if (error) throw error
}

export const deleteContainer = async (id: string) => {
  // First check if there are any pumps connected to this container
  const { data: pumpsData, error: pumpsError } = await supabase
    .from('pumps')
    .select('id, name')
    .eq('container_id', id)
    .limit(1)
  
  if (pumpsError) throw pumpsError
  
  if (pumpsData && pumpsData.length > 0) {
    throw new Error('Cannot delete container: There are pumps connected to this container. Please delete or reassign the pumps first.')
  }
  
  // If no pumps connected, proceed with deletion
  const { error } = await supabase
    .from('containers')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Fuel Prices functions
export const getFuelPrices = async () => {
  try {
    const { data, error } = await supabase
      .from('fuel_prices')
      .select('*')
      .order('fuel_type')
    
    if (error) {
      console.log('Fuel prices table not found, returning default prices')
      return [
        { fuel_type: 'Regular Gasoline', price_per_liter: 1.45 },
        { fuel_type: 'Premium Gasoline', price_per_liter: 1.65 },
        { fuel_type: 'Diesel', price_per_liter: 1.55 }
      ]
    }
    return data || []
  } catch (error) {
    console.log('Error getting fuel prices:', error)
    return []
  }
}

export const updateFuelPrice = async (fuelType: string, pricePerLiter: number) => {
  try {
    const { error } = await supabase
      .from('fuel_prices')
      .upsert({ 
        fuel_type: fuelType, 
        price_per_liter: pricePerLiter 
      }, { 
        onConflict: 'fuel_type' 
      })
    
    if (error) {
      console.log('Fuel prices table not found, cannot update prices')
      throw new Error('Fuel prices table not available. Please run the database migration first.')
    }
  } catch (error) {
    console.log('Error updating fuel price:', error)
    throw error
  }
}

export const getFuelPrice = async (fuelType: string) => {
  try {
    const { data, error } = await supabase
      .from('fuel_prices')
      .select('price_per_liter')
      .eq('fuel_type', fuelType)
      .single()
    
    if (error) {
      console.log('Fuel prices table not found, using default price')
      return 1.50 // Default fallback price
    }
    return data?.price_per_liter || 1.50
  } catch (error) {
    console.log('Error getting fuel price, using default:', error)
    return 1.50 // Default fallback price
  }
}

// Fuel Purchase functions
export const addFuelPurchase = async (purchase: {
  container_id: string;
  liters_purchased: number;
  cost_per_liter: number;
  total_cost: number;
  supplier?: string;
  invoice_number?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('fuel_purchases')
      .insert([purchase])
      .select()
    
    if (error) {
      console.error('Fuel purchase table not found, skipping fuel purchase record:', error)
      return null
    }
    return data[0]
  } catch (error) {
    console.error('Error adding fuel purchase:', error)
    return null
  }
}

export const getFuelPurchases = async (containerId?: string) => {
  try {
    let query = supabase
      .from('fuel_purchases')
      .select(`
        *,
        containers (name, fuel_type)
      `)
      .order('purchase_date', { ascending: false })
    
    if (containerId) {
      query = query.eq('container_id', containerId)
    }
    
    const { data, error } = await query
    if (error) {
      console.log('Fuel purchases table not found')
      return []
    }
    return data || []
  } catch (error) {
    console.log('Error getting fuel purchases:', error)
    return []
  }
}

export const refillContainer = async (
  containerId: string, 
  litersAdded: number, 
  costPerLiter: number,
  supplier?: string,
  invoiceNumber?: string
) => {
  // Start a transaction-like operation
  try {
    // 1. Get current container info
    const { data: container, error: containerError } = await supabase
      .from('containers')
      .select('*')
      .eq('id', containerId)
      .single()
    
    if (containerError) throw containerError
    
    const newLevel = container.current_level + litersAdded
    const totalCost = litersAdded * costPerLiter
    
    // 2. Update container level and average cost (if column exists)
    const currentAvgCost = container.average_cost_per_liter || 1.20 // Default if column doesn't exist
    const totalLitersEver = container.current_level + litersAdded
    const newAverageCost = totalLitersEver > 0 
      ? ((currentAvgCost * container.current_level) + totalCost) / totalLitersEver
      : costPerLiter
    
    // Try to update with average cost, fall back to just level if column doesn't exist
    let updateData: any = { current_level: Math.min(newLevel, container.capacity) }
    
    try {
      updateData.average_cost_per_liter = newAverageCost
    } catch (e) {
      console.log('average_cost_per_liter column not found, updating level only')
    }
    
    const { error: updateError } = await supabase
      .from('containers')
      .update(updateData)
      .eq('id', containerId)
    
    if (updateError) throw updateError
    
    // 3. Record fuel purchase
    await addFuelPurchase({
      container_id: containerId,
      liters_purchased: litersAdded,
      cost_per_liter: costPerLiter,
      total_cost: totalCost,
      supplier,
      invoice_number: invoiceNumber
    })
    
    // 4. Add to expenses with detailed fuel type info
    const expenseDescription = supplier 
      ? `Fuel Purchase: ${litersAdded}L of ${container.fuel_type} for ${container.name} from ${supplier}`
      : `Fuel Purchase: ${litersAdded}L of ${container.fuel_type} for ${container.name}`
    
    await addExpense({
      category: 'Fuel Purchase',
      description: expenseDescription,
      amount: totalCost,
      payment_method: 'Bank Transfer',
      vendor: supplier
    })
    
    return { success: true, newLevel: Math.min(newLevel, container.capacity) }
  } catch (error) {
    throw error
  }
}

export const updateContainerLevel = async (id: string, newLevel: number) => {
  const { error } = await supabase
    .from('containers')
    .update({ current_level: newLevel })
    .eq('id', id)
  
  if (error) throw error
}

// Profit calculation functions
export const getProductProfitData = async () => {
  try {
    console.log('Getting product profit data...')
    
    // Get all sales that are NOT fuel sales (no pump_id)
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('id, total_amount, created_at, pump_id')
      .is('pump_id', null) // Only product sales, not fuel sales
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
    
    if (salesError) {
      console.error('Product sales error:', salesError)
      return { revenue: 0, cost: 0, profit: 0, margin: 0 }
    }
    
    console.log('Product sales found:', sales?.length || 0)
    
    let totalRevenue = 0
    
    sales?.forEach(sale => {
      const amount = sale.total_amount || 0
      totalRevenue += amount
      console.log(`Sale ${sale.id}: $${amount}`)
    })
    
    console.log('Total product revenue:', totalRevenue)
    
    // Estimate cost as 70% of revenue (30% margin) until we have proper cost tracking
    const estimatedCost = totalRevenue * 0.7
    const profit = totalRevenue - estimatedCost
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0
    
    console.log('Product profit calculation:', { revenue: totalRevenue, cost: estimatedCost, profit, margin })
    
    return {
      revenue: totalRevenue,
      cost: estimatedCost,
      profit: profit,
      margin: margin
    }
  } catch (error) {
    console.error('Error in getProductProfitData:', error)
    return { revenue: 0, cost: 0, profit: 0, margin: 0 }
  }
}

export const getFuelProfitData = async () => {
  try {
    console.log('Getting fuel profit data...')
    
    // Get fuel sales from today - only sales with pump_id
    const { data: fuelSales, error: salesError } = await supabase
      .from('sales')
      .select('id, total_amount, pump_id, created_at')
      .not('pump_id', 'is', null)
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
    
    if (salesError) {
      console.error('Fuel sales error:', salesError)
      return { revenue: 0, cost: 0, profit: 0, margin: 0 }
    }
    
    console.log('Fuel sales found:', fuelSales?.length || 0)
    
    let totalRevenue = 0
    let totalCost = 0
    
    fuelSales?.forEach(sale => {
      const revenue = sale.total_amount || 0
      // Since we don't have liters column, estimate liters from revenue
      // Assuming average fuel price of $1.50 per liter
      const estimatedLiters = revenue / 1.50
      // Use estimated cost of $1.20 per liter
      const cost = estimatedLiters * 1.20
      totalRevenue += revenue
      totalCost += cost
      console.log(`Fuel sale ${sale.id}: $${revenue} revenue, ~${estimatedLiters.toFixed(1)}L estimated, $${cost.toFixed(2)} cost`)
    })
    
    console.log('Total fuel revenue:', totalRevenue, 'Total fuel cost:', totalCost)
    
    const profit = totalRevenue - totalCost
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0
    
    console.log('Fuel profit calculation:', { revenue: totalRevenue, cost: totalCost, profit, margin })
    
    return {
      revenue: totalRevenue,
      cost: totalCost,
      profit: profit,
      margin: margin
    }
  } catch (error) {
    console.error('Error in getFuelProfitData:', error)
    return { revenue: 0, cost: 0, profit: 0, margin: 0 }
  }
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

export const deletePump = async (id: string) => {
  // First check if there are any sales records for this pump
  const { data: salesData, error: salesError } = await supabase
    .from('sales')
    .select('id, created_at')
    .eq('pump_id', id)
    .limit(5) // Get a few records to show in error message
  
  if (salesError) {
    console.error('Error checking sales for pump:', salesError)
    throw salesError
  }
  
  if (salesData && salesData.length > 0) {
    const salesCount = salesData.length
    const latestSale = new Date(salesData[0].created_at).toLocaleDateString()
    throw new Error(`Cannot delete pump: There are ${salesCount}+ sales records for this pump (latest: ${latestSale}). You must delete all related sales records first before deleting the pump.`)
  }
  
  // If no sales records, proceed with deletion
  const { error } = await supabase
    .from('pumps')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Database error deleting pump:', error)
    throw new Error(`Failed to delete pump: ${error.message}`)
  }
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

export const deleteProduct = async (id: string) => {
  // First check if there are any sales records for this product
  const { data: salesData, error: salesError } = await supabase
    .from('sales')
    .select('id, created_at')
    .eq('product_id', id)
    .limit(5) // Get a few records to show in error message
  
  if (salesError) {
    console.error('Error checking sales for product:', salesError)
    throw salesError
  }
  
  if (salesData && salesData.length > 0) {
    const salesCount = salesData.length
    const latestSale = new Date(salesData[0].created_at).toLocaleDateString()
    throw new Error(`Cannot delete product: There are ${salesCount}+ sales records for this product (latest: ${latestSale}). You must delete all related sales records first before deleting the product.`)
  }
  
  // If no sales records, proceed with deletion
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Database error deleting product:', error)
    throw new Error(`Failed to delete product: ${error.message}`)
  }
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

export const deleteSale = async (id: string) => {
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Helper function to get sales for a specific pump
export const getSalesForPump = async (pumpId: string) => {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      pumps(name, fuel_type)
    `)
    .eq('pump_id', pumpId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Helper function to get sales for a specific product
export const getSalesForProduct = async (productId: string) => {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      products(name, category)
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Helper function to delete all sales for a pump (use with caution!)
export const deleteAllSalesForPump = async (pumpId: string) => {
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('pump_id', pumpId)
  
  if (error) throw error
}

// Helper function to delete all sales for a product (use with caution!)
export const deleteAllSalesForProduct = async (productId: string) => {
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('product_id', productId)
  
  if (error) throw error
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
