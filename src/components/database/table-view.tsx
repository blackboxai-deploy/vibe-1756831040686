"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Database, DatabaseEntry, DatabaseProperty, PropertyType } from '@/types/database';

interface TableViewProps {
  database: Database;
  onUpdateDatabase: (database: Database) => void;
}

export function TableView({ database, onUpdateDatabase }: TableViewProps) {
  const [entries, setEntries] = useState<DatabaseEntry[]>(database.entries || []);
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newPropertyType, setNewPropertyType] = useState<PropertyType>('text');

  useEffect(() => {
    setEntries(database.entries || []);
  }, [database.entries]);

  const addNewRow = () => {
    const newEntry: DatabaseEntry = {
      id: 'entry_' + Date.now(),
      properties: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current_user',
      lastEditedBy: 'current_user'
    };

    // Initialize properties with empty values
    database.properties.forEach(prop => {
      newEntry.properties[prop.id] = getDefaultValue(prop.type);
    });

    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    updateDatabase({ entries: updatedEntries });
    setIsAddingRow(false);
  };

  const updateEntry = (entryId: string, propertyId: string, value: unknown) => {
    const updatedEntries = entries.map(entry => 
      entry.id === entryId 
        ? { 
            ...entry, 
            properties: { ...entry.properties, [propertyId]: value },
            updatedAt: new Date(),
            lastEditedBy: 'current_user'
          }
        : entry
    );
    setEntries(updatedEntries);
    updateDatabase({ entries: updatedEntries });
  };

  const deleteEntry = (entryId: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    setEntries(updatedEntries);
    updateDatabase({ entries: updatedEntries });
  };

  const addProperty = () => {
    if (!newPropertyName.trim()) return;

    const newProperty: DatabaseProperty = {
      id: 'prop_' + Date.now(),
      name: newPropertyName,
      type: newPropertyType,
      required: false
    };

    const updatedProperties = [...database.properties, newProperty];
    const updatedEntries = entries.map(entry => ({
      ...entry,
      properties: {
        ...entry.properties,
        [newProperty.id]: getDefaultValue(newPropertyType)
      }
    }));

    updateDatabase({ 
      properties: updatedProperties,
      entries: updatedEntries
    });

    setNewPropertyName('');
    setNewPropertyType('text');
    setIsAddingProperty(false);
  };

  const deleteProperty = (propertyId: string) => {
    const updatedProperties = database.properties.filter(prop => prop.id !== propertyId);
    const updatedEntries = entries.map(entry => {
      const { [propertyId]: _deleted, ...restProperties } = entry.properties;
      return { ...entry, properties: restProperties };
    });

    updateDatabase({
      properties: updatedProperties,
      entries: updatedEntries
    });
  };

  const updateDatabase = (updates: Partial<Database>) => {
    const updatedDatabase = { ...database, ...updates, updatedAt: new Date() };
    onUpdateDatabase(updatedDatabase);
  };

  const getDefaultValue = (type: PropertyType) => {
    switch (type) {
      case 'checkbox': return false;
      case 'number': return 0;
      case 'date': return '';
      case 'select': return '';
      case 'multi_select': return [];
      default: return '';
    }
  };

  const renderCell = (entry: DatabaseEntry, property: DatabaseProperty) => {
    const value = entry.properties[property.id];

    switch (property.type) {
      case 'title':
      case 'text':
        return (
          <Input
            value={(value as string) || ''}
            onChange={(e) => updateEntry(entry.id, property.id, e.target.value)}
            className="border-none shadow-none h-8 px-2"
            placeholder={`Enter ${property.name.toLowerCase()}`}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={(value as number) || 0}
            onChange={(e) => updateEntry(entry.id, property.id, parseFloat(e.target.value) || 0)}
            className="border-none shadow-none h-8 px-2"
            placeholder="0"
          />
        );

      case 'checkbox':
        return (
          <div className="flex justify-center">
            <Checkbox
              checked={(value as boolean) || false}
              onCheckedChange={(checked) => updateEntry(entry.id, property.id, checked)}
            />
          </div>
        );

      case 'select':
        return (
          <Select
            value={(value as string) || ''}
            onValueChange={(newValue) => updateEntry(entry.id, property.id, newValue)}
          >
            <SelectTrigger className="border-none shadow-none h-8">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
              <SelectItem value="option3">Option 3</SelectItem>
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={(value as string) || ''}
            onChange={(e) => updateEntry(entry.id, property.id, e.target.value)}
            className="border-none shadow-none h-8 px-2"
          />
        );

      default:
        return (
          <span className="text-gray-500 text-sm px-2">
            {value?.toString() || '—'}
          </span>
        );
    }
  };

  const getPropertyIcon = (type: PropertyType) => {
    switch (type) {
      case 'title': return '📄';
      case 'text': return '📝';
      case 'number': return '#️⃣';
      case 'select': return '📋';
      case 'multi_select': return '🏷️';
      case 'date': return '📅';
      case 'checkbox': return '☑️';
      case 'url': return '🔗';
      case 'email': return '✉️';
      default: return '📝';
    }
  };

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">{database.title}</h3>
          <Badge variant="outline" className="text-xs">
            {entries.length} row{entries.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={isAddingProperty} onOpenChange={setIsAddingProperty}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                + Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Property</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Property Name</label>
                  <Input
                    value={newPropertyName}
                    onChange={(e) => setNewPropertyName(e.target.value)}
                    placeholder="Property name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Property Type</label>
                  <Select value={newPropertyType} onValueChange={(value: PropertyType) => setNewPropertyType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">📝 Text</SelectItem>
                      <SelectItem value="number">#️⃣ Number</SelectItem>
                      <SelectItem value="select">📋 Select</SelectItem>
                      <SelectItem value="date">📅 Date</SelectItem>
                      <SelectItem value="checkbox">☑️ Checkbox</SelectItem>
                      <SelectItem value="url">🔗 URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={addProperty} disabled={!newPropertyName.trim()}>
                    Add Property
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingProperty(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={() => setIsAddingRow(true)} size="sm">
            + Add Row
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {database.properties.map((property) => (
                <TableHead key={property.id} className="min-w-32">
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center space-x-2">
                      <span>{getPropertyIcon(property.type)}</span>
                      <span className="font-medium">{property.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {property.type}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProperty(property.id)}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-500"
                    >
                      ✕
                    </Button>
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id} className="hover:bg-gray-50">
                {database.properties.map((property) => (
                  <TableCell key={property.id} className="p-2">
                    {renderCell(entry, property)}
                  </TableCell>
                ))}
                <TableCell className="p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEntry(entry.id)}
                    className="h-6 w-6 p-0 text-red-500 opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            
            {/* Add Row Button */}
            {isAddingRow && (
              <TableRow>
                <TableCell colSpan={database.properties.length + 1} className="p-4">
                  <div className="flex space-x-2">
                    <Button onClick={addNewRow} size="sm">
                      Add Row
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsAddingRow(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {entries.length === 0 && !isAddingRow && (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">No entries yet</p>
            <Button onClick={addNewRow} variant="outline">
              Add your first row
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}