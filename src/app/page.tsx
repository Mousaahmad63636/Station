'use client'

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

export default function Dashboard() {
  // Mock data - will be replaced with real data from Supabase
  const stats = {
    totalSales: 15420.50,
    fuelSales: 12800.00,
    productSales: 2620.50,
    totalExpenses: 3200.00,
    activePumps: 6,
    totalPumps: 8,
    lowStockItems: 3
  }

  const recentSales = [
    { id: 1, type: 'Fuel', pump: 'Pump A', amount: 45.50, time: '10:30 AM', liters: 31.4 },
    { id: 2, type: 'Product', item: 'Engine Oil 5W-30', amount: 25.00, time: '10:25 AM' },
    { id: 3, type: 'Fuel', pump: 'Pump C', amount: 67.80, time: '10:20 AM', liters: 41.1 },
    { id: 4, type: 'Product', item: 'Car Wash', amount: 15.00, time: '10:15 AM' },
  ]

  const pumpStatus = [
    { id: 'A', name: 'Pump A', status: 'active', counter: 4250, container: 'Tank 1' },
    { id: 'B', name: 'Pump B', status: 'active', counter: 3890, container: 'Tank 1' },
    { id: 'C', name: 'Pump C', status: 'active', counter: 5120, container: 'Tank 2' },
    { id: 'D', name: 'Pump D', status: 'maintenance', counter: 2340, container: 'Tank 2' },
  ]

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
              {pumpStatus.map((pump) => (
                <div key={pump.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span className="font-medium">{pump.name}</span>
                    </div>
                    <Badge 
                      variant={pump.status === 'active' ? 'default' : 'secondary'}
                    >
                      {pump.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{pump.counter}L</div>
                    <div className="text-xs text-muted-foreground">{pump.container}</div>
                  </div>
                </div>
              ))}
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
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">
                      {sale.type === 'Fuel' ? sale.pump : sale.item}
                    </div>
                    <div className="text-xs text-muted-foreground">{sale.time}</div>
                  </div>
                  <div className="text-sm font-medium">${sale.amount}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.lowStockItems > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700">
              {stats.lowStockItems} items are running low on stock. Check inventory for details.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
