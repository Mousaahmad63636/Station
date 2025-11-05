'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Fuel, 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Activity
} from 'lucide-react'
import { getDashboardStats, getRecentSales, getPumps, getProducts, getContainers } from '@/lib/database'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    fuelSales: 0,
    productSales: 0,
    totalExpenses: 0,
    netProfit: 0,
    salesCount: 0
  })
  const [recentSales, setRecentSales] = useState<any[]>([])
  const [pumps, setPumps] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [containers, setContainers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, salesData, pumpsData, productsData, containersData] = await Promise.all([
        getDashboardStats(),
        getRecentSales(4),
        getPumps(),
        getProducts(),
        getContainers()
      ])
      
      setStats(statsData)
      setRecentSales(salesData)
      setPumps(pumpsData)
      setProducts(productsData)
      setContainers(containersData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const lowStockProducts = products.filter(p => p.current_stock <= p.min_stock_level)
  const activePumps = pumps.filter(p => p.is_active).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your fuel station operations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Sales</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.fuelSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +8.2% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Sales</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.productSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +15.3% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.totalSales - stats.totalExpenses).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Pump Status */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Pump Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pumps.slice(0, 4).map((pump: any) => {
                const container = containers.find(c => c.id === pump.container_id)
                return (
                  <div key={pump.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4" />
                        <span className="font-medium">{pump.name}</span>
                      </div>
                      <Badge 
                        variant={pump.is_active ? 'default' : 'secondary'}
                      >
                        {pump.is_active ? 'active' : 'inactive'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{pump.total_counter}L</div>
                      <div className="text-xs text-muted-foreground">{container?.name}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.map((sale: any) => (
                <div key={sale.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">
                      {sale.type === 'fuel' ? sale.pumps?.name : sale.products?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(sale.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-sm font-medium">${sale.total_amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert ({lowStockProducts.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.slice(0, 3).map((product: any) => (
                <div key={product.id} className="flex justify-between items-center text-sm">
                  <span className="text-orange-700">{product.name}</span>
                  <span className="text-orange-600">
                    {product.current_stock} left (min: {product.min_stock_level})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
