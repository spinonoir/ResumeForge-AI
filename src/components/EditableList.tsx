"use client";

import React, { useState, type ReactNode, useImperativeHandle } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit2Icon, PlusCircleIcon, CheckIcon, Trash2Icon } from 'lucide-react';

interface Item {
  id: string;
  [key: string]: string | number | boolean | null;
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
  customAddButton?: ReactNode;
  transformInitialDataForForm?: (initialData: Partial<Omit<T, 'id'>>) => Partial<Omit<T, 'id'>>;
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
    transformInitialDataForForm,
  }: EditableListProps<T>,
  ref: React.ForwardedRef<EditableListRef<T>>
) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<Partial<Omit<T, 'id'>>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setCurrentItem({});
  };

  const handleSave = () => {
    if (Object.keys(currentItem).length === 0 && fields.some(f => !(f.name in currentItem))) {
      resetForm();
      return;
    }

    let itemToSave = { ...currentItem };

    if (editingId) {
      onUpdateItem(editingId, itemToSave);
    } else {
      const newItemData = { ...itemToSave } as Omit<T, 'id'>;
      fields.forEach(field => {
        if (!(field.name in newItemData)) {
          (newItemData as any)[field.name] = ''; 
        }
      });
      onAddItem(newItemData);
    }
    resetForm();
  };

  const handleEdit = (item: T) => {
    setEditingId(item.id);
    let dataForForm: Partial<Omit<T, 'id'>> = { ...item };
    if (transformInitialDataForForm) {
      dataForForm = transformInitialDataForForm(dataForForm);
    }
    setCurrentItem(dataForForm);
    setIsAdding(false); 
  };

  const handleInitiateAddItem = (initialData?: Partial<Omit<T, 'id'>>) => {
    setIsAdding(true);
    setEditingId(null);
    let dataForForm = initialData || {};
    if (transformInitialDataForForm && initialData) {
      dataForForm = transformInitialDataForForm(initialData);
    }
    setCurrentItem(dataForForm);
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
              value={(currentItem as Record<string, string>)[field.name] || ''}
              onChange={handleInputChange}
              placeholder={field.placeholder || field.label}
              rows={field.name.toLowerCase().includes('skills') ? 2 : (field.name.toLowerCase().includes('description') ? 4 : 3)}
              className="w-full"
            />
          ) : (
            <Input
              id={field.name}
              name={field.name}
              type="text"
              value={(currentItem as Record<string, string>)[field.name] || ''}
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
                renderItem ? renderItem(item, () => handleEdit(item), () => onRemoveItem(item.id)) :
                <div className="flex items-start justify-between">
                  <div className="flex-grow pr-2">
                    <span className="text-sm text-foreground">{itemToString(item)}</span>
                  </div>
                  <div className="space-x-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} aria-label="Edit item">
                      <Edit2Icon className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id)} aria-label="Remove item">
                      <Trash2Icon className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
export const EditableList = React.forwardRef(EditableListInner);

