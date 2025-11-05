'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Edit,
  Trash2,
  Tag
} from 'lucide-react'
import { getCategories, addCategory, updateCategory, deleteCategory } from '@/lib/database'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const categoriesData = await getCategories()
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    try {
      await addCategory({
        name: formData.get('name') as string,
        description: formData.get('description') as string || undefined
      })
      
      setIsAddDialogOpen(false)
      await loadCategories()
      ;(event.target as HTMLFormElement).reset()
    } catch (error) {
      console.error('Error adding category:', error)
      alert('Error adding category')
    }
  }

  const handleEditCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingCategory) return
    
    const formData = new FormData(event.currentTarget)
    
    try {
      await updateCategory(editingCategory.id, {
        name: formData.get('name') as string,
        description: formData.get('description') as string || undefined
      })
      
      setIsEditDialogOpen(false)
      setEditingCategory(null)
      await loadCategories()
    } catch (error) {
      console.error('Error updating category:', error)
      alert('Error updating category')
    }
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the category "${name}"?`)) {
      try {
        await deleteCategory(id)
        await loadCategories()
      } catch (error) {
        console.error('Error deleting category:', error)
        alert('Error deleting category')
      }
    }
  }

  const openEditDialog = (category: any) => {
    setEditingCategory(category)
    setIsEditDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading categories...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Category Management</h2>
          <p className="text-muted-foreground">
            Manage product categories for better organization
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <Label htmlFor="add-name">Category Name</Label>
                <Input 
                  id="add-name" 
                  name="name" 
                  placeholder="e.g., Electronics" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="add-description">Description (Optional)</Label>
                <Textarea 
                  id="add-description" 
                  name="description" 
                  placeholder="Brief description of this category"
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">Add Category</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Categories ({categories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description || '-'}</TableCell>
                  <TableCell>
                    {new Date(category.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openEditDialog(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => handleDeleteCategory(category.id, category.name)}
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

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCategory} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Category Name</Label>
              <Input 
                id="edit-name" 
                name="name" 
                defaultValue={editingCategory?.name}
                required 
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea 
                id="edit-description" 
                name="description" 
                defaultValue={editingCategory?.description || ''}
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full">Update Category</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
