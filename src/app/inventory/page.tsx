'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Package, 
  Plus, 
  Search, 
  Edit,
  AlertTriangle,
  Barcode,
  DollarSign,
  Trash2
} from 'lucide-react'
import { getProducts, addProduct, updateProduct, updateProductStock, deleteProduct, getCategories } from '@/lib/database'

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ])
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    try {
      await addProduct({
        barcode: formData.get('barcode') as string,
        name: formData.get('name') as string,
        category: formData.get('category') as string,
        cost_price: parseFloat(formData.get('cost_price') as string),
        sale_price: parseFloat(formData.get('sale_price') as string),
        current_stock: parseInt(formData.get('current_stock') as string),
        min_stock_level: parseInt(formData.get('min_stock_level') as string)
      })
      
      setIsQuickAddOpen(false)
      await loadData()
      ;(event.target as HTMLFormElement).reset()
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Error adding product')
    }
  }

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete product "${name}"?`)) {
      try {
        await deleteProduct(id)
        await loadData()
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Error deleting product')
      }
    }
  }

  // Get all categories for filtering (from database + 'all' option)
  const allCategories = ['all', ...categories.map(c => c.name)]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm)
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const lowStockProducts = products.filter(product => product.current_stock <= product.min_stock_level)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading inventory...</div>
      </div>
    )
  }

  const getStockStatus = (current: number, min: number) => {
    if (current <= min) return 'low'
    if (current <= min * 1.5) return 'medium'
    return 'good'
  }

  const getStockBadge = (current: number, min: number) => {
    const status = getStockStatus(current, min)
    switch (status) {
      case 'low':
        return <Badge variant="destructive">Low Stock</Badge>
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>
      default:
        return <Badge variant="default">Good</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
          <p className="text-muted-foreground">
            Manage products, stock levels, and pricing
          </p>
        </div>
        <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Quick Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Quick Add Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleQuickAdd} className="space-y-4">
              <div>
                <Label htmlFor="quick-barcode">Barcode</Label>
                <div className="flex gap-2">
                  <Input id="quick-barcode" name="barcode" placeholder="Scan or enter barcode" required />
                  <Button type="button" variant="outline" size="icon">
                    <Barcode className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="quick-name">Product Name</Label>
                <Input id="quick-name" name="name" placeholder="Enter product name" required />
              </div>
              <div>
                <Label htmlFor="quick-category">Category</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quick-cost-price">Cost Price</Label>
                  <Input id="quick-cost-price" name="cost_price" type="number" step="0.01" placeholder="0.00" required />
                </div>
                <div>
                  <Label htmlFor="quick-sale-price">Sale Price</Label>
                  <Input id="quick-sale-price" name="sale_price" type="number" step="0.01" placeholder="0.00" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quick-current-stock">Current Stock</Label>
                  <Input id="quick-current-stock" name="current_stock" type="number" placeholder="0" required />
                </div>
                <div>
                  <Label htmlFor="quick-min-stock">Min Stock Level</Label>
                  <Input id="quick-min-stock" name="min_stock_level" type="number" placeholder="0" required />
                </div>
              </div>
              <Button type="submit" className="w-full">Add Product</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Low Stock Alert */}
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
              {lowStockProducts.slice(0, 3).map((product) => (
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

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {allCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Cost Price</TableHead>
                <TableHead>Sale Price</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="font-mono text-sm">{product.barcode}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{product.current_stock}</span>
                      {getStockBadge(product.current_stock, product.min_stock_level)}
                    </div>
                  </TableCell>
                  <TableCell>${product.cost_price.toFixed(2)}</TableCell>
                  <TableCell>${product.sale_price.toFixed(2)}</TableCell>
                  <TableCell className="text-green-600">
                    ${(product.sale_price - product.cost_price).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Stock - {product.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="stock-adjustment">Stock Adjustment</Label>
                              <Input id="stock-adjustment" type="number" placeholder="Enter quantity" />
                              <p className="text-sm text-muted-foreground mt-1">
                                Current stock: {product.current_stock}
                              </p>
                            </div>
                            <div>
                              <Label htmlFor="adjustment-type">Type</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select adjustment type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="add">Add Stock</SelectItem>
                                  <SelectItem value="remove">Remove Stock</SelectItem>
                                  <SelectItem value="set">Set Stock Level</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button className="w-full">Update Stock</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
