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
  Calendar,
  Edit,
  Trash2,
  Database
} from 'lucide-react'

import { getContainers, getPumps, togglePumpStatus, resetDailyCounters, recordFuelSale, addPump, addContainer, updateContainer, deleteContainer } from '@/lib/database'

export default function PumpsPage() {
  const [selectedPump, setSelectedPump] = useState<string | null>(null)
  const [containers, setContainers] = useState<any[]>([])
  const [pumps, setPumps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isContainerManagerOpen, setIsContainerManagerOpen] = useState(false)
  const [isAddContainerOpen, setIsAddContainerOpen] = useState(false)
  const [editingContainer, setEditingContainer] = useState<any>(null)
  const [isEditContainerOpen, setIsEditContainerOpen] = useState(false)
  const [isAddPumpOpen, setIsAddPumpOpen] = useState(false)
  const [isCounterReadingOpen, setIsCounterReadingOpen] = useState(false)
  const [selectedPumpForReading, setSelectedPumpForReading] = useState<any>(null)

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

  const handleCounterReading = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedPumpForReading) return
    
    const formData = new FormData(event.currentTarget)
    const newCounter = parseFloat(formData.get('new_counter') as string)
    const fuelPrice = parseFloat(formData.get('fuel_price') as string)
    
    if (newCounter <= selectedPumpForReading.total_counter) {
      alert('New counter reading must be greater than current counter')
      return
    }
    
    try {
      const fuelSold = newCounter - selectedPumpForReading.total_counter
      const result = await recordFuelSale(selectedPumpForReading.id, selectedPumpForReading.total_counter, newCounter, fuelPrice)
      
      alert(`Counter reading recorded! ${fuelSold}L sold for $${(fuelSold * fuelPrice).toFixed(2)}`)
      setIsCounterReadingOpen(false)
      setSelectedPumpForReading(null)
      await loadData()
      ;(event.target as HTMLFormElement).reset()
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

  const handleAddContainer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    try {
      await addContainer({
        name: formData.get('name') as string,
        capacity: parseFloat(formData.get('capacity') as string),
        fuel_type: formData.get('fuel_type') as string,
        current_level: parseFloat(formData.get('current_level') as string) || 0
      })
      
      setIsAddContainerOpen(false)
      await loadData()
      ;(event.target as HTMLFormElement).reset()
    } catch (error) {
      console.error('Error adding container:', error)
      alert('Error adding container')
    }
  }

  const handleEditContainer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingContainer) return
    
    const formData = new FormData(event.currentTarget)
    
    try {
      await updateContainer(editingContainer.id, {
        name: formData.get('name') as string,
        capacity: parseFloat(formData.get('capacity') as string),
        fuel_type: formData.get('fuel_type') as string,
        current_level: parseFloat(formData.get('current_level') as string)
      })
      
      setIsEditContainerOpen(false)
      setEditingContainer(null)
      await loadData()
    } catch (error) {
      console.error('Error updating container:', error)
      alert('Error updating container')
    }
  }

  const handleDeleteContainer = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete container "${name}"?`)) {
      try {
        await deleteContainer(id)
        await loadData()
      } catch (error) {
        console.error('Error deleting container:', error)
        alert('Error deleting container')
      }
    }
  }

  const openEditContainer = (container: any) => {
    setEditingContainer(container)
    setIsEditContainerOpen(true)
  }

  const handleAddPump = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const containerId = formData.get('container') as string
    const selectedContainer = containers.find(c => c.id === containerId)
    
    if (!selectedContainer) {
      alert('Please select a container')
      return
    }
    
    try {
      await addPump({
        name: formData.get('name') as string,
        container_id: containerId,
        fuel_type: selectedContainer.fuel_type,
        is_active: true,
        total_counter: 0,
        daily_counter: 0
      })
      
      setIsAddPumpOpen(false)
      await loadData()
      ;(event.target as HTMLFormElement).reset()
    } catch (error) {
      console.error('Error adding pump:', error)
      alert('Error adding pump')
    }
  }

  const openCounterReading = (pump: any) => {
    setSelectedPumpForReading(pump)
    setIsCounterReadingOpen(true)
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
          <Dialog open={isContainerManagerOpen} onOpenChange={setIsContainerManagerOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Database className="mr-2 h-4 w-4" />
                Manage Containers
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
              <DialogHeader className="pb-4 flex-shrink-0">
                <DialogTitle className="text-xl font-semibold">Manage Fuel Containers</DialogTitle>
                <p className="text-sm text-muted-foreground">Add, edit, or remove fuel storage containers</p>
              </DialogHeader>
              <div className="flex-1 overflow-hidden flex flex-col space-y-4">
                <div className="flex justify-between items-center flex-shrink-0">
                  <div className="text-sm text-muted-foreground">
                    {containers.length} containers total
                  </div>
                  <Dialog open={isAddContainerOpen} onOpenChange={setIsAddContainerOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Container
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Container</DialogTitle>
                        <p className="text-sm text-muted-foreground">Create a new fuel storage container</p>
                      </DialogHeader>
                      <form onSubmit={handleAddContainer} className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="container-name">Container Name *</Label>
                          <Input 
                            id="container-name" 
                            name="name" 
                            placeholder="e.g., Tank A, Main Tank" 
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="container-fuel-type">Fuel Type *</Label>
                          <Select name="fuel_type" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select fuel type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Regular Gasoline">Regular Gasoline</SelectItem>
                              <SelectItem value="Premium Gasoline">Premium Gasoline</SelectItem>
                              <SelectItem value="Diesel">Diesel</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="container-capacity">Capacity (Liters) *</Label>
                            <Input 
                              id="container-capacity" 
                              name="capacity"
                              type="number" 
                              step="0.01"
                              placeholder="10000" 
                              required 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="container-current-level">Current Level (Liters)</Label>
                            <Input 
                              id="container-current-level" 
                              name="current_level"
                              type="number" 
                              step="0.01"
                              placeholder="0" 
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddContainerOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" className="flex-1">Add Container</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex-1 overflow-auto border rounded-lg">
                  <div className="p-4">
                    {containers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Database className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No containers found</p>
                        <p className="text-sm">Add your first fuel storage container to get started</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {containers.map((container) => (
                          <Card key={container.id}>
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg">{container.name}</CardTitle>
                                  <p className="text-sm text-muted-foreground">{container.fuel_type}</p>
                                </div>
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => openEditContainer(container)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600"
                                    onClick={() => handleDeleteContainer(container.id, container.name)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Capacity:</span>
                                  <span>{container.capacity.toLocaleString()}L</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Current Level:</span>
                                  <span>{container.current_level.toLocaleString()}L</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                    style={{ 
                                      width: `${Math.min(Math.max((container.current_level / container.capacity) * 100, 0), 100)}%` 
                                    }}
                                  ></div>
                                </div>
                                <div className="text-xs text-muted-foreground text-center mt-1">
                                  {Math.min(Math.max(((container.current_level / container.capacity) * 100), 0), 100).toFixed(1)}% full
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddPumpOpen} onOpenChange={setIsAddPumpOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Pump
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Pump</DialogTitle>
                <p className="text-sm text-muted-foreground">Create a new fuel pump</p>
              </DialogHeader>
              <form onSubmit={handleAddPump} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="pump-name">Pump Name *</Label>
                  <Input 
                    id="pump-name" 
                    name="name"
                    placeholder="e.g., Pump A, Pump 1" 
                    required
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pump-container">Container *</Label>
                  <Select name="container" required>
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
                  {containers.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No containers available. Create a container first using "Manage Containers".
                    </p>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddPumpOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={containers.length === 0}>
                    Add Pump
                  </Button>
                </div>
              </form>
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openCounterReading(pump)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Read Counter
                  </Button>
                  
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

      {/* Edit Container Dialog */}
      <Dialog open={isEditContainerOpen} onOpenChange={setIsEditContainerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Container</DialogTitle>
            <p className="text-sm text-muted-foreground">Update container information</p>
          </DialogHeader>
          <form onSubmit={handleEditContainer} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-container-name">Container Name *</Label>
              <Input 
                id="edit-container-name" 
                name="name" 
                defaultValue={editingContainer?.name}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-container-fuel-type">Fuel Type *</Label>
              <Select name="fuel_type" defaultValue={editingContainer?.fuel_type} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regular Gasoline">Regular Gasoline</SelectItem>
                  <SelectItem value="Premium Gasoline">Premium Gasoline</SelectItem>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-container-capacity">Capacity (Liters) *</Label>
                <Input 
                  id="edit-container-capacity" 
                  name="capacity"
                  type="number" 
                  step="0.01"
                  defaultValue={editingContainer?.capacity}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-container-current-level">Current Level (Liters)</Label>
                <Input 
                  id="edit-container-current-level" 
                  name="current_level"
                  type="number" 
                  step="0.01"
                  defaultValue={editingContainer?.current_level}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditContainerOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">Update Container</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Counter Reading Dialog */}
      <Dialog open={isCounterReadingOpen} onOpenChange={setIsCounterReadingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>End-of-Day Counter Reading - {selectedPumpForReading?.name}</DialogTitle>
            <p className="text-sm text-muted-foreground">Record new counter reading and fuel price</p>
          </DialogHeader>
          <form onSubmit={handleCounterReading} className="space-y-4 mt-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-muted-foreground">Current Counter</p>
              <p className="text-2xl font-bold">{selectedPumpForReading?.total_counter}L</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-counter">New Counter Reading *</Label>
              <Input 
                id="new-counter" 
                name="new_counter"
                type="number" 
                step="0.01"
                placeholder="Enter new counter reading"
                min={selectedPumpForReading?.total_counter || 0}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-muted-foreground">
                Must be greater than current counter ({selectedPumpForReading?.total_counter}L)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuel-price">Fuel Price per Liter *</Label>
              <Input 
                id="fuel-price" 
                name="fuel_price"
                type="number" 
                step="0.01"
                placeholder="1.45" 
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-blue-600">
                <strong>How it works:</strong> New counter - Current counter = Fuel sold today
              </p>
              <p className="text-xs text-blue-500 mt-1">
                This amount will be deducted from the container and recorded as today's sale
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCounterReadingOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">Record Counter Reading</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
