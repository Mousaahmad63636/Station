'use client'

import { useState } from 'react'
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

export default function ExpensesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('all')

  // Mock data - will be replaced with real data from Supabase
  const expenses = [
    {
      id: '1',
      category: 'Utilities',
      description: 'Electricity Bill - November',
      amount: 450.00,
      payment_method: 'Bank Transfer',
      receipt_number: 'ELC-2024-001',
      vendor: 'City Electric Company',
      created_at: '2024-11-01T10:30:00Z'
    },
    {
      id: '2',
      category: 'Maintenance',
      description: 'Pump A Repair - Nozzle Replacement',
      amount: 125.50,
      payment_method: 'Cash',
      receipt_number: 'MNT-2024-015',
      vendor: 'Fuel Tech Services',
      created_at: '2024-11-02T14:15:00Z'
    },
    {
      id: '3',
      category: 'Inventory',
      description: 'Engine Oil Stock Purchase',
      amount: 850.00,
      payment_method: 'Credit Card',
      receipt_number: 'INV-2024-087',
      vendor: 'Oil Suppliers Ltd',
      created_at: '2024-11-03T09:45:00Z'
    },
    {
      id: '4',
      category: 'Insurance',
      description: 'Monthly Insurance Premium',
      amount: 320.00,
      payment_method: 'Bank Transfer',
      receipt_number: 'INS-2024-011',
      vendor: 'SafeGuard Insurance',
      created_at: '2024-11-04T11:00:00Z'
    },
    {
      id: '5',
      category: 'Fuel Purchase',
      description: 'Gasoline Tank Refill - 5000L',
      amount: 7250.00,
      payment_method: 'Bank Transfer',
      receipt_number: 'FUEL-2024-023',
      vendor: 'Petro Wholesale Corp',
      created_at: '2024-11-05T08:30:00Z'
    }
  ]

  const categories = [
    'all', 'Utilities', 'Maintenance', 'Inventory', 'Insurance', 
    'Fuel Purchase', 'Salaries', 'Marketing', 'Office Supplies', 'Other'
  ]

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
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
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
            {categories.map((category) => (
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
    </div>
  )
}
