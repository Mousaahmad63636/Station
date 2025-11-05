'use client'

import { useState } from 'react'
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

export default function ReportsPage() {
  const [reportType, setReportType] = useState('daily')
  const [dateRange, setDateRange] = useState('today')

  // Mock data - will be replaced with real data from Supabase
  const dailyStats = {
    date: '2024-11-05',
    fuelSales: {
      regular: { liters: 2450, revenue: 3557.50 },
      premium: { liters: 1200, revenue: 1980.00 },
      diesel: { liters: 800, revenue: 1240.00 }
    },
    productSales: {
      count: 45,
      revenue: 620.50
    },
    totalRevenue: 7398.00,
    totalExpenses: 1200.00,
    netProfit: 6198.00
  }

  const weeklyComparison = [
    { date: '2024-10-29', sales: 6800.00, expenses: 1100.00, profit: 5700.00 },
    { date: '2024-10-30', sales: 7200.00, expenses: 950.00, profit: 6250.00 },
    { date: '2024-10-31', sales: 6900.00, expenses: 1300.00, profit: 5600.00 },
    { date: '2024-11-01', sales: 7500.00, expenses: 1150.00, profit: 6350.00 },
    { date: '2024-11-02', sales: 7100.00, expenses: 1000.00, profit: 6100.00 },
    { date: '2024-11-03', sales: 7800.00, expenses: 1400.00, profit: 6400.00 },
    { date: '2024-11-04', sales: 7300.00, expenses: 1250.00, profit: 6050.00 },
    { date: '2024-11-05', sales: 7398.00, expenses: 1200.00, profit: 6198.00 },
  ]

  const topProducts = [
    { name: 'Engine Oil 5W-30', sold: 25, revenue: 625.00 },
    { name: 'Car Wash Premium', sold: 18, revenue: 270.00 },
    { name: 'Air Freshener', sold: 15, revenue: 75.00 },
    { name: 'Brake Fluid DOT 4', sold: 8, revenue: 96.00 },
    { name: 'Windshield Washer Fluid', sold: 6, revenue: 39.00 }
  ]

  const pumpPerformance = [
    { pump: 'Pump A', liters: 450, revenue: 652.50, transactions: 28 },
    { pump: 'Pump B', liters: 380, revenue: 551.00, transactions: 24 },
    { pump: 'Pump C', liters: 520, revenue: 858.00, transactions: 31 },
    { pump: 'Pump D', liters: 0, revenue: 0, transactions: 0 },
    { pump: 'Pump E', liters: 420, revenue: 651.00, transactions: 26 },
    { pump: 'Pump F', liters: 350, revenue: 542.50, transactions: 22 }
  ]

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
            <div className="text-2xl font-bold">${dailyStats.totalRevenue.toFixed(2)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(dailyStats.totalRevenue, 7300)}
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
              ${(dailyStats.fuelSales.regular.revenue + dailyStats.fuelSales.premium.revenue + dailyStats.fuelSales.diesel.revenue).toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(6777.50, 6500)}
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
            <div className="text-2xl font-bold">${dailyStats.productSales.revenue.toFixed(2)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(620.50, 580)}
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
            <div className="text-2xl font-bold text-green-600">${dailyStats.netProfit.toFixed(2)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(dailyStats.netProfit, 6050)}
              <span>+2.4% from yesterday</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyComparison.slice(-7).map((day, index) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">{formatDate(day.date)}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">${day.sales.toFixed(0)}</div>
                    <div className="text-xs text-muted-foreground">
                      Profit: ${day.profit.toFixed(0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fuel Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Fuel Sales Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">Regular Gasoline</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{dailyStats.fuelSales.regular.liters}L</div>
                  <div className="text-sm text-muted-foreground">
                    ${dailyStats.fuelSales.regular.revenue.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Premium Gasoline</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{dailyStats.fuelSales.premium.liters}L</div>
                  <div className="text-sm text-muted-foreground">
                    ${dailyStats.fuelSales.premium.revenue.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium">Diesel</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{dailyStats.fuelSales.diesel.liters}L</div>
                  <div className="text-sm text-muted-foreground">
                    ${dailyStats.fuelSales.diesel.revenue.toFixed(2)}
                  </div>
                </div>
              </div>
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
                {pumpPerformance.map((pump) => (
                  <TableRow key={pump.pump}>
                    <TableCell className="font-medium">{pump.pump}</TableCell>
                    <TableCell>{pump.liters}L</TableCell>
                    <TableCell>${pump.revenue.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={pump.liters > 0 ? 'default' : 'secondary'}>
                        {pump.liters > 0 ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
