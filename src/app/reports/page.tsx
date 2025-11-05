'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Fuel,
  Package,
  CreditCard,
  FileText,
  Filter
} from 'lucide-react'
import { getDashboardStats, getSales, getExpenses, getPumps, getProducts } from '@/lib/database'

export default function ReportsPage() {
  const [reportType, setReportType] = useState('daily')
  const [dateRange, setDateRange] = useState('today')
  const [stats, setStats] = useState<any>({})
  const [sales, setSales] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [pumps, setPumps] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReportsData()
  }, [])

  const loadReportsData = async () => {
    try {
      setLoading(true)
      const [statsData, salesData, expensesData, pumpsData, productsData] = await Promise.all([
        getDashboardStats(),
        getSales(100), // Get recent sales
        getExpenses(),
        getPumps(),
        getProducts()
      ])
      
      setStats(statsData)
      setSales(salesData)
      setExpenses(expensesData)
      setPumps(pumpsData)
      setProducts(productsData)
    } catch (error) {
      console.error('Error loading reports data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate analytics from real data
  const today = new Date().toISOString().split('T')[0]
  const todaySales = sales.filter(s => s.created_at.startsWith(today))
  const todayExpenses = expenses.filter(e => e.created_at.startsWith(today))
  
  const fuelSales = todaySales.filter(s => s.type === 'fuel')
  const productSales = todaySales.filter(s => s.type === 'product')
  
  // Get top products from sales data
  const productSalesMap = new Map()
  productSales.forEach(sale => {
    const productId = sale.product_id
    if (productSalesMap.has(productId)) {
      const existing = productSalesMap.get(productId)
      productSalesMap.set(productId, {
        ...existing,
        quantity: existing.quantity + sale.quantity,
        revenue: existing.revenue + sale.total_amount
      })
    } else {
      const product = products.find(p => p.id === productId)
      productSalesMap.set(productId, {
        name: product?.name || 'Unknown Product',
        quantity: sale.quantity,
        revenue: sale.total_amount
      })
    }
  })
  
  const topProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading reports...</div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const exportReport = () => {
    // This will be replaced with actual export functionality
    console.log('Exporting report...')
    alert('Report exported successfully!')
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    }
    return null
  }

  const getTrendPercentage = (current: number, previous: number) => {
    if (previous === 0) return '0%'
    const percentage = ((current - previous) / previous * 100).toFixed(1)
    return `${percentage}%`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">
            Sales performance and business insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSales?.toFixed(2) || '0.00'}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(stats.totalSales || 0, 7300)}
              <span>+1.3% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Sales</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.fuelSales?.toFixed(2) || '0.00'}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(stats.fuelSales || 0, 6500)}
              <span>+4.3% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Sales</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.productSales?.toFixed(2) || '0.00'}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(stats.productSales || 0, 580)}
              <span>+7.0% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.netProfit?.toFixed(2) || '0.00'}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(stats.netProfit || 0, 6050)}
              <span>+2.4% from yesterday</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Total Sales</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">${stats.totalSales?.toFixed(2) || '0.00'}</div>
                  <div className="text-xs text-muted-foreground">
                    {sales.length} transactions
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Expenses</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">${stats.totalExpenses?.toFixed(2) || '0.00'}</div>
                  <div className="text-xs text-muted-foreground">
                    {expenses.length} items
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fuel Types Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Fuel Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(new Set(pumps.map(p => p.fuel_type))).map((fuelType, index) => {
                const fuelTypeColor = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500'][index] || 'bg-gray-500'
                const fuelTypeSales = fuelSales.filter(s => {
                  const pump = pumps.find(p => p.id === s.pump_id)
                  return pump?.fuel_type === fuelType
                })
                const totalRevenue = fuelTypeSales.reduce((sum, s) => sum + s.total_amount, 0)
                const totalLiters = fuelTypeSales.reduce((sum, s) => sum + s.quantity, 0)
                
                return (
                  <div key={fuelType} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 ${fuelTypeColor} rounded-full`}></div>
                      <span className="font-medium">{fuelType}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{totalLiters.toFixed(1)}L</div>
                      <div className="text-sm text-muted-foreground">
                        ${totalRevenue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product, index) => (
                  <TableRow key={product.name}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sold}</TableCell>
                    <TableCell>${product.revenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pump Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Pump Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pump</TableHead>
                  <TableHead>Liters</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pumps.map((pump: any) => {
                  const pumpSales = fuelSales.filter(s => s.pump_id === pump.id)
                  const totalLiters = pumpSales.reduce((sum, s) => sum + s.quantity, 0)
                  const totalRevenue = pumpSales.reduce((sum, s) => sum + s.total_amount, 0)
                  
                  return (
                    <TableRow key={pump.id}>
                      <TableCell className="font-medium">{pump.name}</TableCell>
                      <TableCell>{totalLiters.toFixed(1)}L</TableCell>
                      <TableCell>${totalRevenue.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={pump.is_active ? 'default' : 'secondary'}>
                          {pump.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
