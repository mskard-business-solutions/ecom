"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Category } from "@/types/types";
import { categoryApi } from "@/lib/api/categories";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable item component
function SortableItem({ category, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between px-6 py-4 border-b border-gray-200 last:border-b-0 bg-white"
    >
      <div className="flex items-center">
        <div
          className="mr-3 cursor-grab text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
              Priority: {category.priority}
            </span>
          </div>
          <p className="text-sm text-gray-500">{category.productCount} products</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onEdit(category)}
          className="text-indigo-600 hover:text-indigo-900"
        >
          <Edit size={18} />
        </button>
        <button
          onClick={() => onDelete(category.id)}
          className="text-red-600 hover:text-red-900"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </li>
  );
}

// Editable item component
function EditableItem({ category, onUpdate, onCancel }) {
  return (
    <li className="flex items-center justify-between px-6 py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center flex-grow mr-4">
        <div className="mr-3 text-gray-400">
          <GripVertical size={20} />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-2">
            <input
              type="text"
              defaultValue={category.name}
              className="flex-grow px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f507f]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onUpdate(category.id, e.currentTarget.value);
                } else if (e.key === "Escape") {
                  onCancel();
                }
              }}
              onBlur={(e) => onUpdate(category.id, e.target.value)}
              autoFocus
            />
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
              Priority: {category.priority}
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}

export function CategoriesList() {
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const queryClient = useQueryClient();

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.getAll,
  });

  // Sync local state with query data when not dragging
  useEffect(() => {
    if (data && !isDragging) {
      // Sort by priority to ensure consistent order
      const sortedData = [...data].sort((a, b) => a.priority - b.priority);
      setLocalCategories(sortedData);
    }
  }, [data, isDragging]);

  const addCategoryMutation = useMutation({
    mutationFn: (newCategory: string) => categoryApi.addCategory(newCategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (category: { id: string; name: string }) =>
      categoryApi.updateCategory(category.id, category.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategory(null);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  // Modified to handle batch updates
  const updatePriorityMutation = useMutation({
    mutationFn: async ({ id, priority }: { id: string; priority: number }) => {
      return categoryApi.updatePriorities(id, priority);
    },
  });

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    addCategoryMutation.mutate(newCategory);
    setNewCategory("");
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
  };

  const handleUpdateCategory = (id: string, newName: string) => {
    if (!newName.trim()) return;
    updateCategoryMutation.mutate({ id, name: newName });
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategoryMutation.mutate(id);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id && over) {
      const oldIndex = localCategories.findIndex((cat) => cat.id === active.id);
      const newIndex = localCategories.findIndex((cat) => cat.id === over.id);
      const newOrder = arrayMove([...localCategories], oldIndex, newIndex);
      const updatedCategories = newOrder.map((cat, index) => ({
        ...cat,
        priority: index, // Update the priority based on new position
      }));
      
      setLocalCategories(updatedCategories);
      
      try {
        await updatePriorityMutation.mutateAsync({
          id: active.id as string,
          priority: newIndex,
        });
        if (oldIndex < newIndex) {
          for (let i = oldIndex + 1; i <= newIndex; i++) {
            const cat = localCategories[i];
            if (cat.id !== active.id) {
              await updatePriorityMutation.mutateAsync({
                id: cat.id,
                priority: i - 1,
              });
            }
          }
        } 
        else if (oldIndex > newIndex) {
          for (let i = newIndex; i < oldIndex; i++) {
            const cat = localCategories[i];
            if (cat.id !== active.id) {
              await updatePriorityMutation.mutateAsync({
                id: cat.id,
                priority: i + 1,
              });
            }
          }
        }
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      } catch (error) {
        console.error("Failed to update priorities:", error);
      } finally {
        setTimeout(() => {
          setIsDragging(false);
        }, 500);
      }
    } else {
      setIsDragging(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            className="flex-grow px-3 py-2 bg-white border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#4f507f]"
          />
          <button
            onClick={handleAddCategory}
            className="px-4 py-[0.6rem] bg-[#4f507f] border-2 border-[#4f507f] text-white rounded-r-md hover:bg-[#3e3f63] transition-colors flex items-center">
            <Plus size={20} />
          </button>
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          Drag and drop categories to change their priority. Lower priority number appears first.
        </p>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localCategories.map((cat) => cat.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul>
            {localCategories.map((category: Category) => (
              editingCategory?.id === category.id ? (
                <EditableItem 
                  key={category.id}
                  category={category}
                  onUpdate={handleUpdateCategory}
                  onCancel={() => setEditingCategory(null)}
                />
              ) : (
                <SortableItem
                  key={category.id}
                  category={category}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                />
              )
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}