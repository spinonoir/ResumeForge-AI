
"use client";

import React, { useState, type ReactNode, useImperativeHandle } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XIcon, Edit2Icon, PlusCircleIcon, CheckIcon, Trash2Icon } from 'lucide-react';

interface Item {
  id: string;
  [key: string]: any;
}

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea';
  placeholder?: string;
}

export interface EditableListRef<T extends Item> {
  initiateAddItem: (initialData?: Partial<Omit<T, 'id'>>) => void;
}

interface EditableListProps<T extends Item> {
  title: string;
  items: T[];
  fields: FieldConfig[];
  onAddItem: (item: Omit<T, 'id'>) => void;
  onUpdateItem: (id: string, item: Partial<Omit<T, 'id'>>) => void;
  onRemoveItem: (id: string) => void;
  renderItem?: (item: T, onEdit: () => void, onRemove: () => void) => ReactNode;
  itemToString: (item: T) => string; 
  icon?: ReactNode;
  customAddButton?: ReactNode; // To allow replacing the plus icon button
}

const EditableListInner = <T extends Item>(
  {
    title,
    items,
    fields,
    onAddItem,
    onUpdateItem,
    onRemoveItem,
    renderItem,
    itemToString,
    icon,
    customAddButton,
  }: EditableListProps<T>,
  ref: React.ForwardedRef<EditableListRef<T>>
) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<Partial<Omit<T, 'id'>>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCurrentItem({ ...currentItem, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setCurrentItem({});
  };

  const handleSave = () => {
    if (Object.keys(currentItem).length === 0 && fields.some(f => !(f.name in currentItem))) {
      // If currentItem is empty and some fields are not in it, don't save.
      // This prevents saving an empty item if the form was just opened.
      // Or, provide a more specific check based on your needs.
      // For now, let's assume at least one field should have some value or specific check.
      // This behavior might need refinement based on exact requirements for "empty" items.
      resetForm();
      return;
    }

    if (editingId) {
      onUpdateItem(editingId, currentItem);
    } else {
      const newItemData = { ...currentItem } as Omit<T, 'id'>;
      fields.forEach(field => {
        if (!(field.name in newItemData)) {
          (newItemData as any)[field.name] = field.type === 'textarea' ? '' : ''; 
        }
      });
      onAddItem(newItemData);
    }
    resetForm();
  };

  const handleEdit = (item: T) => {
    setEditingId(item.id);
    setCurrentItem(item);
    setIsAdding(false); 
  };

  const handleInitiateAddItem = (initialData?: Partial<Omit<T, 'id'>>) => {
    setIsAdding(true);
    setEditingId(null);
    setCurrentItem(initialData || {});
  };

  useImperativeHandle(ref, () => ({
    initiateAddItem: handleInitiateAddItem
  }));

  const renderFormFields = () => (
    <div className="space-y-4 mb-4 p-4 border rounded-lg bg-card">
      {fields.map(field => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-medium text-foreground mb-1">
            {field.label}
          </label>
          {field.type === 'textarea' ? (
            <Textarea
              id={field.name}
              name={field.name}
              value={(currentItem as any)[field.name] || ''}
              onChange={handleInputChange}
              placeholder={field.placeholder || field.label}
              rows={3}
              className="w-full"
            />
          ) : (
            <Input
              id={field.name}
              name={field.name}
              type="text"
              value={(currentItem as any)[field.name] || ''}
              onChange={handleInputChange}
              placeholder={field.placeholder || field.label}
              className="w-full"
            />
          )}
        </div>
      ))}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={resetForm}>Cancel</Button>
        <Button onClick={handleSave}><CheckIcon className="mr-2 h-4 w-4" /> Save</Button>
      </div>
    </div>
  );

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-headline">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
          {customAddButton ? (
            <div className="ml-auto">{customAddButton}</div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => handleInitiateAddItem()}
              aria-label={`Add new ${title.slice(0, -1).toLowerCase()}`}
            >
              <PlusCircleIcon className="h-5 w-5 text-primary" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {(isAdding && !editingId) && renderFormFields()}
        
        {items.length === 0 && !isAdding && (
          <p className="text-muted-foreground">No {title.toLowerCase()} added yet. Click the '+' button or use AI to add one.</p>
        )}

        <ul className="space-y-3">
          {items.map(item => (
            <li key={item.id} className="p-3 border rounded-lg bg-secondary/30 hover:shadow-md transition-shadow">
              {editingId === item.id ? (
                renderFormFields()
              ) : (
                renderItem ? renderItem(item, () => handleEdit(item), () => onRemoveItem(item.id)) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground flex-grow">{itemToString(item)}</span>
                    <div className="space-x-1 flex-shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} aria-label="Edit item">
                        <Edit2Icon className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id)} aria-label="Remove item">
                        <Trash2Icon className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                )
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
export const EditableList = React.forwardRef(EditableListInner);
