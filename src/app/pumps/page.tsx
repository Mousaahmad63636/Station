'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Fuel, 
  Plus, 
  Settings, 
  Activity,
  Pause,
  Play,
  BarChart3,
  Calendar
} from 'lucide-react'

export default function PumpsPage() {
  const [selectedPump, setSelectedPump] = useState<string | null>(null)

  // Mock data - will be replaced with real data from Supabase
  const containers = [
    { id: '1', name: 'Tank 1', capacity: 10000, current_level: 7500, fuel_type: 'Regular' },
    { id: '2', name: 'Tank 2', capacity: 8000, current_level: 6200, fuel_type: 'Premium' },
    { id: '3', name: 'Tank 3', capacity: 5000, current_level: 3800, fuel_type: 'Diesel' },
  ]

  const pumps = [
    { id: '1', name: 'Pump A', container_id: '1', total_counter: 4250, daily_counter: 180, is_active: true, fuel_type: 'Regular' },
    { id: '2', name: 'Pump B', container_id: '1', total_counter: 3890, daily_counter: 145, is_active: true, fuel_type: 'Regular' },
    { id: '3', name: 'Pump C', container_id: '2', total_counter: 5120, daily_counter: 220, is_active: true, fuel_type: 'Premium' },
    { id: '4', name: 'Pump D', container_id: '2', total_counter: 2340, daily_counter: 0, is_active: false, fuel_type: 'Premium' },
    { id: '5', name: 'Pump E', container_id: '3', total_counter: 6780, daily_counter: 310, is_active: true, fuel_type: 'Diesel' },
    { id: '6', name: 'Pump F', container_id: '3', total_counter: 4560, daily_counter: 195, is_active: true, fuel_type: 'Diesel' },
  ]

  const getContainer = (containerId: string) => {
    return containers.find(c => c.id === containerId)
  }

  const togglePumpStatus = (pumpId: string) => {
    // This will be replaced with actual API call
    console.log(`Toggling pump ${pumpId}`)
  }

  const recordCounterReading = (pumpId: string, newCounter: number, pricePerLiter: number) => {
    // This will be replaced with actual API call to Supabase
    const pump = pumps.find(p => p.id === pumpId)
    if (pump) {
      const fuelSold = newCounter - pump.total_counter
      const revenue = fuelSold * pricePerLiter
      
      console.log(`Counter reading for ${pump.name}:`)
      console.log(`- Previous counter: ${pump.total_counter}L`)
      console.log(`- New counter: ${newCounter}L`)
      console.log(`- Fuel sold: ${fuelSold}L`)
      console.log(`- Revenue: $${revenue.toFixed(2)}`)
      console.log(`- Deducting ${fuelSold}L from container ${pump.container_id}`)
      
      // Update pump counter and daily sales
      // Reduce fuel from container
      // Record sale transaction
      alert(`Counter reading recorded! ${fuelSold}L sold for $${revenue.toFixed(2)}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pump Management</h2>
          <p className="text-muted-foreground">
            Monitor pumps, read end-of-day counters, and track fuel sales
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            // This will reset all daily counters to 0 for a new day
            console.log('Resetting daily counters for new day')
            alert('Daily counters reset for new day!')
          }}>
            <Calendar className="mr-2 h-4 w-4" />
            New Day Reset
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Pump
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Pump</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pump-name">Pump Name</Label>
                <Input id="pump-name" placeholder="e.g., Pump G" />
              </div>
              <div>
                <Label htmlFor="container">Container</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select container" />
                  </SelectTrigger>
                  <SelectContent>
                    {containers.map((container) => (
                      <SelectItem key={container.id} value={container.id}>
                        {container.name} - {container.fuel_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Add Pump</Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Container Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {containers.map((container) => (
          <Card key={container.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{container.name}</CardTitle>
              <Fuel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{container.fuel_type}</div>
              <div className="mt-2">
                <div className="flex justify-between text-sm">
                  <span>Level</span>
                  <span>{((container.current_level / container.capacity) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(container.current_level / container.capacity) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {container.current_level}L / {container.capacity}L
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pumps Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pumps.map((pump) => {
          const container = getContainer(pump.container_id)
          return (
            <Card key={pump.id} className="relative">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">{pump.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={pump.is_active ? 'default' : 'secondary'}>
                    {pump.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePumpStatus(pump.id)}
                  >
                    {pump.is_active ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span>{container?.name} - {pump.fuel_type}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Counter</p>
                    <p className="text-xl font-bold">{pump.total_counter}L</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Sales</p>
                    <p className="text-xl font-bold text-green-600">{pump.daily_counter}L</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Plus className="mr-2 h-4 w-4" />
                        Read Counter
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>End-of-Day Counter Reading - {pump.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-muted-foreground">Current Counter</p>
                          <p className="text-2xl font-bold">{pump.total_counter}L</p>
                        </div>
                        <div>
                          <Label htmlFor="new-counter">New Counter Reading</Label>
                          <Input 
                            id="new-counter" 
                            type="number" 
                            placeholder="Enter new counter reading"
                            min={pump.total_counter}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Must be greater than current counter ({pump.total_counter}L)
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="fuel-price">Fuel Price per Liter</Label>
                          <Input 
                            id="fuel-price" 
                            type="number" 
                            placeholder="1.45" 
                            step="0.01"
                          />
                        </div>
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-sm text-blue-600">
                            <strong>How it works:</strong> New counter - Current counter = Fuel sold today
                          </p>
                          <p className="text-xs text-blue-500 mt-1">
                            This amount will be deducted from {container?.name} and recorded as today's sale
                          </p>
                        </div>
                        <Button className="w-full">Record Counter Reading</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
