import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  description: string;
}

export const ManageCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [newCategory, setNewCategory] = useState({ name: "", icon: "" });
  const [newSubcategory, setNewSubcategory] = useState({
    category_id: "",
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Failed to fetch categories");
      return;
    }

    setCategories(data || []);
  };

  const fetchSubcategories = async () => {
    const { data, error } = await supabase
      .from("subcategories")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Failed to fetch subcategories");
      return;
    }

    setSubcategories(data || []);
  };

  const addCategory = async () => {
    if (!newCategory.name || !newCategory.icon) {
      toast.error("Please fill in all fields");
      return;
    }

    const { error } = await supabase
      .from("categories")
      .insert([newCategory]);

    if (error) {
      toast.error("Failed to add category");
      return;
    }

    toast.success("Category added successfully");
    setNewCategory({ name: "", icon: "" });
    fetchCategories();
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete category");
      return;
    }

    toast.success("Category deleted successfully");
    fetchCategories();
    fetchSubcategories();
  };

  const addSubcategory = async () => {
    if (!newSubcategory.category_id || !newSubcategory.name) {
      toast.error("Please fill in all required fields");
      return;
    }

    const { error } = await supabase
      .from("subcategories")
      .insert([newSubcategory]);

    if (error) {
      toast.error("Failed to add subcategory");
      return;
    }

    toast.success("Subcategory added successfully");
    setNewSubcategory({ category_id: "", name: "", description: "" });
    fetchSubcategories();
  };

  const deleteSubcategory = async (id: string) => {
    const { error } = await supabase
      .from("subcategories")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete subcategory");
      return;
    }

    toast.success("Subcategory deleted successfully");
    fetchSubcategories();
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Category Name"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
            />
            <Input
              placeholder="Icon (emoji)"
              value={newCategory.icon}
              onChange={(e) =>
                setNewCategory({ ...newCategory, icon: e.target.value })
              }
              className="w-24"
            />
            <Button onClick={addCategory}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteCategory(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Subcategories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <div>
              <Label>Category</Label>
              <Select
                value={newSubcategory.category_id}
                onValueChange={(value) =>
                  setNewSubcategory({ ...newSubcategory, category_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Subcategory Name"
              value={newSubcategory.name}
              onChange={(e) =>
                setNewSubcategory({ ...newSubcategory, name: e.target.value })
              }
            />
            <Input
              placeholder="Description (optional)"
              value={newSubcategory.description}
              onChange={(e) =>
                setNewSubcategory({
                  ...newSubcategory,
                  description: e.target.value,
                })
              }
            />
            <Button onClick={addSubcategory}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subcategory
            </Button>
          </div>

          <div className="space-y-2">
            {subcategories.map((subcategory) => (
              <div
                key={subcategory.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <div className="font-medium">{subcategory.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {getCategoryName(subcategory.category_id)} •{" "}
                    {subcategory.description}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteSubcategory(subcategory.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
