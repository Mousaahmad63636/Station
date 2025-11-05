'use client'

import { useState, useEffect } from 'react'
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

import { getContainers, getPumps, togglePumpStatus, resetDailyCounters, recordFuelSale, addPump } from '@/lib/database'

export default function PumpsPage() {
  const [selectedPump, setSelectedPump] = useState<string | null>(null)
  const [containers, setContainers] = useState<any[]>([])
  const [pumps, setPumps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [containersData, pumpsData] = await Promise.all([
        getContainers(),
        getPumps()
      ])
      setContainers(containersData)
      setPumps(pumpsData)
    } catch (error) {
      console.error('Error loading pumps data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getContainer = (containerId: string) => {
    return containers.find(c => c.id === containerId)
  }

  const handleTogglePumpStatus = async (pumpId: string) => {
    try {
      const pump = pumps.find(p => p.id === pumpId)
      if (pump) {
        await togglePumpStatus(pumpId, !pump.is_active)
        await loadData() // Refresh data
      }
    } catch (error) {
      console.error('Error toggling pump status:', error)
      alert('Error updating pump status')
    }
  }

  const handleCounterReading = async (pumpId: string, newCounter: number, pricePerLiter: number) => {
    try {
      const pump = pumps.find(p => p.id === pumpId)
      if (pump && newCounter > pump.total_counter) {
        const result = await recordFuelSale(pumpId, pump.total_counter, newCounter, pricePerLiter)
        alert(`Counter reading recorded! ${result.fuelSold}L sold for $${result.totalAmount.toFixed(2)}`)
        await loadData() // Refresh data
      } else {
        alert('New counter reading must be greater than current counter')
      }
    } catch (error) {
      console.error('Error recording counter reading:', error)
      alert('Error recording counter reading')
    }
  }

  const handleResetDailyCounters = async () => {
    try {
      await resetDailyCounters()
      await loadData() // Refresh data
      alert('Daily counters reset for new day!')
    } catch (error) {
      console.error('Error resetting daily counters:', error)
      alert('Error resetting daily counters')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading pumps data...</div>
      </div>
    )
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
          <Button variant="outline" onClick={handleResetDailyCounters}>
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
                    onClick={() => handleTogglePumpStatus(pump.id)}
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
