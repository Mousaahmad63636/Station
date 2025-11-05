'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Settings as SettingsIcon, 
  Fuel, 
  Save,
  DollarSign
} from 'lucide-react'

import { getFuelPrices, updateFuelPrice } from '@/lib/database'

export default function SettingsPage() {
  const [fuelPrices, setFuelPrices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editedPrices, setEditedPrices] = useState<{[key: string]: number}>({})

  useEffect(() => {
    loadFuelPrices()
  }, [])

  const loadFuelPrices = async () => {
    try {
      setLoading(true)
      const prices = await getFuelPrices()
      setFuelPrices(prices)
      
      // Initialize edited prices with current values
      const initialPrices: {[key: string]: number} = {}
      prices.forEach((price: any) => {
        initialPrices[price.fuel_type] = price.price_per_liter
      })
      setEditedPrices(initialPrices)
    } catch (error) {
      console.error('Error loading fuel prices:', error)
      alert('Error loading fuel prices')
    } finally {
      setLoading(false)
    }
  }

  const handlePriceChange = (fuelType: string, value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0) {
      setEditedPrices(prev => ({
        ...prev,
        [fuelType]: numValue
      }))
    }
  }

  const handleSavePrices = async () => {
    try {
      setSaving(true)
      
      // Update all changed prices
      const updatePromises = Object.entries(editedPrices).map(([fuelType, price]) => 
        updateFuelPrice(fuelType, price)
      )
      
      await Promise.all(updatePromises)
      await loadFuelPrices() // Refresh data
      
      alert('Fuel prices updated successfully!')
    } catch (error) {
      console.error('Error updating fuel prices:', error)
      alert('Error updating fuel prices')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = () => {
    return fuelPrices.some(price => 
      editedPrices[price.fuel_type] !== price.price_per_liter
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage fuel prices and system configuration
          </p>
        </div>
        <SettingsIcon className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* Fuel Prices Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Fuel Prices
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Set the current fuel prices. These will be used automatically when recording counter readings.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {fuelPrices.map((fuelPrice) => (
              <Card key={fuelPrice.fuel_type} className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    {fuelPrice.fuel_type}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor={`price-${fuelPrice.fuel_type}`}>
                      Price per Liter
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id={`price-${fuelPrice.fuel_type}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={editedPrices[fuelPrice.fuel_type] || ''}
                        onChange={(e) => handlePriceChange(fuelPrice.fuel_type, e.target.value)}
                        className="pl-8 text-lg font-semibold focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Current: ${fuelPrice.price_per_liter.toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button 
              onClick={handleSavePrices}
              disabled={!hasChanges() || saving}
              className="min-w-32"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Prices'}
            </Button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Set fuel prices here once</li>
              <li>• When reading pump counters, prices are automatically filled</li>
              <li>• You can still override prices during counter reading if needed</li>
              <li>• Prices are used for revenue calculations and reports</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
