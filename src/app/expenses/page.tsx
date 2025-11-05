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
import { Textarea } from '@/components/ui/textarea'
import { 
  CreditCard, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Receipt,
  DollarSign,
  Calendar,
  Filter
} from 'lucide-react'
import { getExpenses, addExpense, updateExpense, deleteExpense, getExpenseCategories, addExpenseCategory, updateExpenseCategory, deleteExpenseCategory } from '@/lib/database'

export default function ExpensesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [expenses, setExpenses] = useState<any[]>([])
  const [expenseCategories, setExpenseCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [expensesData, categoriesData] = await Promise.all([
        getExpenses(),
        getExpenseCategories()
      ])
      setExpenses(expensesData)
      setExpenseCategories(categoriesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    try {
      await addExpenseCategory({
        name: formData.get('name') as string,
        description: formData.get('description') as string || undefined
      })
      
      setIsAddCategoryOpen(false)
      await loadData()
      ;(event.target as HTMLFormElement).reset()
    } catch (error) {
      console.error('Error adding expense category:', error)
      alert('Error adding expense category')
    }
  }

  const handleEditCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingCategory) return
    
    const formData = new FormData(event.currentTarget)
    
    try {
      await updateExpenseCategory(editingCategory.id, {
        name: formData.get('name') as string,
        description: formData.get('description') as string || undefined
      })
      
      setIsEditCategoryOpen(false)
      setEditingCategory(null)
      await loadData()
    } catch (error) {
      console.error('Error updating expense category:', error)
      alert('Error updating expense category')
    }
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the expense category "${name}"?`)) {
      try {
        await deleteExpenseCategory(id)
        await loadData()
      } catch (error) {
        console.error('Error deleting expense category:', error)
        alert('Error deleting expense category')
      }
    }
  }

  const openEditCategory = (category: any) => {
    setEditingCategory(category)
    setIsEditCategoryOpen(true)
  }

  // Get all categories for filtering (from database + 'all' option)
  const allCategories = ['all', ...expenseCategories.map(c => c.name)]

  const paymentMethods = ['Cash', 'Credit Card', 'Bank Transfer', 'Check']

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory
    // Add month filtering logic here if needed
    return matchesSearch && matchesCategory
  })

  const getTotalExpenses = () => {
    return filteredExpenses.reduce((total, expense) => total + expense.amount, 0)
  }

  const getCategoryTotal = (category: string) => {
    return expenses
      .filter(expense => expense.category === category)
      .reduce((total, expense) => total + expense.amount, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading expenses...</div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPaymentMethodBadge = (method: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'outline' } = {
      'Cash': 'default',
      'Credit Card': 'secondary',
      'Bank Transfer': 'outline',
      'Check': 'outline'
    }
    return <Badge variant={variants[method] || 'outline'}>{method}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expense Management</h2>
          <p className="text-muted-foreground">
            Track and manage fuel station expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCategoryManagerOpen} onOpenChange={setIsCategoryManagerOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Manage Categories
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
              <DialogHeader className="pb-4">
                <DialogTitle className="text-xl font-semibold">Manage Expense Categories</DialogTitle>
                <p className="text-sm text-muted-foreground">Add, edit, or remove expense categories for better organization</p>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {expenseCategories.length} categories total
                  </div>
                  <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <p className="text-sm text-muted-foreground">Create a new expense category</p>
                      </DialogHeader>
                      <form onSubmit={handleAddCategory} className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="add-category-name">Category Name *</Label>
                          <Input 
                            id="add-category-name" 
                            name="name" 
                            placeholder="e.g., Equipment, Utilities" 
                            required 
                            className="focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-category-description">Description</Label>
                          <Textarea 
                            id="add-category-description" 
                            name="description" 
                            placeholder="Brief description of this category (optional)"
                            rows={3}
                            className="resize-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddCategoryOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" className="flex-1">Add Category</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Category Name</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                        <TableHead className="font-semibold w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenseCategories.map((category) => (
                        <TableRow key={category.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium py-4">{category.name}</TableCell>
                          <TableCell className="py-4 text-muted-foreground">
                            {category.description || 'No description'}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openEditCategory(category)}
                                className="h-8 w-8 p-0 hover:bg-blue-100"
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-red-100"
                                onClick={() => handleDeleteCategory(category.id, category.name)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="expense-category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category: any) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expense-description">Description</Label>
                <Textarea 
                  id="expense-description" 
                  placeholder="Enter expense description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="expense-amount">Amount</Label>
                <Input id="expense-amount" type="number" placeholder="0.00" />
              </div>
              <div>
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vendor">Vendor/Supplier</Label>
                <Input id="vendor" placeholder="Enter vendor name" />
              </div>
              <div>
                <Label htmlFor="receipt-number">Receipt Number</Label>
                <Input id="receipt-number" placeholder="Enter receipt number" />
              </div>
              <Button className="w-full">Add Expense</Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalExpenses().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Purchases</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getCategoryTotal('Fuel Purchase').toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Largest expense category
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getCategoryTotal('Maintenance').toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Equipment & repairs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilities</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getCategoryTotal('Utilities').toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Monthly recurring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses by description, vendor, or receipt..."
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
            {allCategories.map((category: string) => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses ({filteredExpenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Receipt #</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{formatDate(expense.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.category}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>{expense.vendor || '-'}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {expense.receipt_number || '-'}
                  </TableCell>
                  <TableCell>
                    {getPaymentMethodBadge(expense.payment_method)}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ${expense.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500">
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

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <p className="text-sm text-muted-foreground">Update category information</p>
          </DialogHeader>
          <form onSubmit={handleEditCategory} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">Category Name *</Label>
              <Input 
                id="edit-category-name" 
                name="name" 
                defaultValue={editingCategory?.name}
                required 
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category-description">Description</Label>
              <Textarea 
                id="edit-category-description" 
                name="description" 
                defaultValue={editingCategory?.description || ''}
                placeholder="Brief description of this category (optional)"
                rows={3}
                className="resize-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditCategoryOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">Update Category</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
