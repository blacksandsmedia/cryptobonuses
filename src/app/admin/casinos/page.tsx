"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { normalizeImagePath } from "@/lib/image-utils";
import CSVImportModal from "@/components/admin/CSVImportModal";

interface Casino {
  id: string;
  name?: string;
  slug?: string;
  logo?: string | null;
  description?: string;
  rating?: number;
  displayOrder?: number;
  bonuses?: any[];
  affiliateLink?: string;
  website?: string;
  bonusCode?: string;
}

interface Bonus {
  id: string;
  title: string;
  description: string;
  code: string | null;
  type: string;
  value: string;
}

export default function CasinosPage() {
  const [casinos, setCasinos] = useState<Casino[]>([]);
  const [filteredCasinos, setFilteredCasinos] = useState<Casino[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCasinos, setSelectedCasinos] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [detailedView, setDetailedView] = useState(false);
  const [editingField, setEditingField] = useState<{ casinoId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchCasinos();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredCasinos(casinos);
    } else {
      const filtered = casinos.filter(
        casino => 
          (casino.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
          (casino.slug || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (casino.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCasinos(filtered);
    }
  }, [searchTerm, casinos]);

  useEffect(() => {
    if (selectAll) {
      setSelectedCasinos(filteredCasinos.map(casino => casino.id));
    } else {
      setSelectedCasinos([]);
    }
  }, [selectAll, filteredCasinos]);

  const fetchCasinos = async () => {
    try {
      setError(null);
      const response = await fetch("/api/casinos");
      if (!response.ok) {
        throw new Error("Failed to fetch casinos");
      }
      const data = await response.json();
      
      // Make sure casinos are sorted by displayOrder
      const sortedCasinos = [...data].sort((a, b) => 
        (a.displayOrder || 0) - (b.displayOrder || 0)
      );
      
      setCasinos(sortedCasinos);
      setFilteredCasinos(sortedCasinos);
    } catch (error) {
      console.error("Failed to fetch casinos:", error);
      setError("Failed to load casinos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/casinos?search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error("Failed to search casinos");
      }
      const data = await response.json();
      
      // Sort by displayOrder
      const sortedCasinos = [...data].sort((a, b) => 
        (a.displayOrder || 0) - (b.displayOrder || 0)
      );
      
      setFilteredCasinos(sortedCasinos);
    } catch (error) {
      console.error("Failed to search casinos:", error);
      setError("Failed to search casinos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this casino?")) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/casinos/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete casino");
      }

      // Update both lists
      const updatedCasinos = casinos.filter((casino) => casino.id !== id);
      setCasinos(updatedCasinos);
      setFilteredCasinos(filteredCasinos.filter((casino) => casino.id !== id));
      setSelectedCasinos(selectedCasinos.filter(casinoId => casinoId !== id));
      router.refresh();
    } catch (error) {
      console.error("Failed to delete casino:", error);
      setError("Failed to delete casino. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCasinos.length === 0) {
      setError("No casinos selected for deletion");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedCasinos.length} casinos?`)) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/casinos/bulk-delete`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedCasinos }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete casinos");
      }

      // Update both lists
      const remainingCasinos = casinos.filter((casino) => !selectedCasinos.includes(casino.id));
      setCasinos(remainingCasinos);
      setFilteredCasinos(remainingCasinos);
      setSelectedCasinos([]);
      setSelectAll(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete casinos:", error);
      setError("Failed to delete casinos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkClearContent = async () => {
    if (selectedCasinos.length === 0) {
      setError("No casinos selected for content clearing");
      return;
    }

    if (!confirm(`Are you sure you want to clear ALL content sections (About, Games, Terms, FAQ, etc.) from ${selectedCasinos.length} casinos? This cannot be undone.`)) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/casinos/bulk-clear-content`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedCasinos }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to clear content");
      }

      const result = await response.json();
      
      toast.success(`Successfully cleared content from ${result.count} casinos`);
      setSelectedCasinos([]);
      setSelectAll(false);
      
      // Refresh to show updated content status
      fetchCasinos();
    } catch (error) {
      console.error("Failed to clear content:", error);
      setError(`Failed to clear content: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error(`Failed to clear content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearContent = async (casinoId: string, casinoName: string) => {
    if (!confirm(`Are you sure you want to clear ALL content sections (About, Games, Terms, FAQ, etc.) from "${casinoName}"? This cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/casinos/bulk-clear-content`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: [casinoId] }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to clear content");
      }

      toast.success(`Successfully cleared content from "${casinoName}"`);
      
      // Refresh to show updated content status
      fetchCasinos();
    } catch (error) {
      console.error("Failed to clear content:", error);
      toast.error(`Failed to clear content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const toggleSelectCasino = (id: string) => {
    if (selectedCasinos.includes(id)) {
      setSelectedCasinos(selectedCasinos.filter(casinoId => casinoId !== id));
      setSelectAll(false);
    } else {
      setSelectedCasinos([...selectedCasinos, id]);
      if (selectedCasinos.length + 1 === filteredCasinos.length) {
        setSelectAll(true);
      }
    }
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  const onDragEnd = async (result: any) => {
    setIsDragging(false);
    
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    // If position didn't change
    if (result.destination.index === result.source.index) {
      return;
    }

    // Create a copy of the current list
    const items = Array.from(filteredCasinos);
    // Remove the dragged item
    const [removed] = items.splice(result.source.index, 1);
    // Insert at the new position
    items.splice(result.destination.index, 0, removed);

    // Update filtered casinos state
    setFilteredCasinos(items);
    
    // Update main casinos list state to match
    // We need to maintain the same order in both lists
    setCasinos(prev => {
      const newOrder = [...prev];
      
      // Find indices in the full list
      const fromIndex = newOrder.findIndex(c => c.id === removed.id);
      const allBeforeDestination = items.slice(0, result.destination.index).map(c => c.id);
      
      if (fromIndex >= 0) {
        // Remove from old position
        newOrder.splice(fromIndex, 1);
        
        // Find new position in the full list
        let toIndex = 0;
        for (let i = newOrder.length - 1; i >= 0; i--) {
          if (allBeforeDestination.includes(newOrder[i].id)) {
            toIndex = i + 1;
            break;
          }
        }
        
        // Insert at new position
        newOrder.splice(toIndex, 0, removed);
      }
      
      return newOrder;
    });
    
    // Set flag to indicate order has changed
    setHasChanges(true);
  };

  const saveNewOrder = async () => {
    try {
      setIsSaving(true);
      
      // Get the current IDs in order
      const orderedIds = filteredCasinos.map(casino => casino.id);
      
      const response = await fetch('/api/casinos/update-order', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for auth
        body: JSON.stringify({ orderedIds }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order');
      }
      
      toast.success('Casino order updated successfully');
      setIsSaving(false);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving new order:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Failed to update order'}`);
      setIsSaving(false);
    }
  };

  const handleImportComplete = () => {
    // Refresh the casino list after import
    fetchCasinos();
    setShowImportModal(false);
  };

  const startEdit = (casinoId: string, field: string, currentValue: string) => {
    setEditingField({ casinoId, field });
    setEditValue(currentValue || '');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveEdit = async () => {
    if (!editingField) return;

    try {
      const response = await fetch(`/api/casinos/${editingField.casinoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          [editingField.field]: editValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update casino');
      }

      const updatedCasino = await response.json();
      
      // Update the casino in both arrays
      setCasinos(prev => prev.map(casino => 
        casino.id === editingField.casinoId ? { ...casino, ...updatedCasino } : casino
      ));
      setFilteredCasinos(prev => prev.map(casino => 
        casino.id === editingField.casinoId ? { ...casino, ...updatedCasino } : casino
      ));

      setEditingField(null);
      setEditValue('');
      toast.success('Casino updated successfully');
    } catch (error) {
      console.error('Error updating casino:', error);
      toast.error('Failed to update casino');
    }
  };

  const renderEditableField = (casino: Casino, field: string, displayValue: string, placeholder: string) => {
    const isEditing = editingField?.casinoId === casino.id && editingField?.field === field;
    
    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 px-2 py-1 bg-[#1d1d25] border border-[#404055] rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#68D08B]"
            placeholder={placeholder}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
          />
          <button
            onClick={saveEdit}
            className="text-green-400 hover:text-green-300 p-1"
            title="Save"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            onClick={cancelEdit}
            className="text-red-400 hover:text-red-300 p-1"
            title="Cancel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      );
    }

    return (
      <div 
        className="flex items-center group cursor-pointer"
        onClick={() => startEdit(casino.id, field, displayValue)}
      >
        <span className="text-sm text-white truncate max-w-[200px]" title={displayValue}>
          {displayValue || 
            <span className="text-[#a7a9b4] italic">{placeholder}</span>
          }
        </span>
        <svg className="w-3 h-3 ml-2 text-[#a7a9b4] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="admin-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="admin-heading">Casinos</h2>
          <p className="text-[#a7a9b4] mt-1">
            Total: {filteredCasinos.length}
            {isDragging && <span className="ml-2 text-yellow-400">(Dragging...)</span>}
          </p>
          {hasChanges && (
            <p className="text-yellow-400 text-sm mt-1">
              Order has been changed. Don't forget to save your changes.
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {hasChanges && (
            <button
              onClick={saveNewOrder}
              disabled={isSaving}
              className="w-full sm:w-auto px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save New Order'}
            </button>
          )}
          <button
            onClick={() => setShowImportModal(true)}
            className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Import CSV
          </button>
          <Link
            href="/admin/casinos/new"
            className="w-full sm:w-auto px-4 py-2 bg-[#68D08B] text-white rounded-md hover:bg-[#5abc7a] transition-colors text-center"
          >
            Add New Casino
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded-md flex items-center">
          {error}
        </div>
      )}

      {/* Search bar and controls - Mobile Responsive */}
      <div className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Search casinos by name, slug, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-[#1d1d25] border border-[#404055] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#68D08B]"
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
            <span className="text-sm text-[#a7a9b4] whitespace-nowrap">Quick Edit:</span>
          <button
            onClick={() => setDetailedView(!detailedView)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              detailedView 
                ? 'bg-[#68D08B] text-white' 
                : 'bg-[#373946] text-[#a7a9b4] hover:bg-[#454655]'
            }`}
          >
            {detailedView ? 'Enabled' : 'Disabled'}
          </button>
        </div>
          <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleSearch}
              className="w-full sm:w-auto px-4 py-2 bg-[#373946] text-white rounded-md hover:bg-[#454655] transition-colors"
        >
          Search
        </button>
        {selectedCasinos.length > 0 && (
          <>
            <button
              onClick={handleBulkClearContent}
              className="w-full sm:w-auto px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Clear Content ({selectedCasinos.length})
            </button>
            <button
              onClick={handleBulkDelete}
              className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Delete Selected ({selectedCasinos.length})
            </button>
          </>
        )}
          </div>
        </div>
      </div>

      {/* Table Container - Mobile Responsive */}
      <div className="admin-container p-0">
        <div className="admin-table-wrapper">
        <DragDropContext 
          onDragStart={() => setIsDragging(true)}
          onDragEnd={onDragEnd}
        >
          <Droppable droppableId="casinos">
            {(provided) => (
              <table 
                  className="admin-table"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <thead className="bg-[#373946]">
                  <tr>
                      <th className="admin-table-th-mobile">
                      Order
                    </th>
                      <th className="admin-table-th-mobile">
                      Logo
                    </th>
                    <th className="px-2 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-[#404055] text-[#68D08B] focus:ring-[#68D08B]"
                      />
                    </th>
                      <th className="admin-table-th-mobile">
                      Name & Slug
                    </th>
                    {detailedView && (
                      <>
                          <th className="admin-table-th-mobile hidden md:table-cell">
                          Website
                        </th>
                          <th className="admin-table-th-mobile hidden lg:table-cell">
                          Affiliate Link
                        </th>
                          <th className="admin-table-th-mobile hidden lg:table-cell">
                          Bonus Code
                        </th>
                      </>
                    )}
                      <th className="admin-table-th-mobile">
                        Rating <span className="text-xs font-normal opacity-75 hidden sm:inline">(from reviews)</span>
                    </th>
                      <th className="admin-table-th-mobile text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#292932] divide-y divide-[#404055]">
                  {filteredCasinos.map((casino, index) => (
                    <Draggable key={casino.id} draggableId={casino.id} index={index}>
                      {(provided, snapshot) => (
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                            className={snapshot.isDragging ? "bg-[#373946] opacity-80" : "hover:bg-[#323240]"}
                          >
                            <td 
                              className="admin-table-td-mobile cursor-move"
                            {...provided.dragHandleProps}
                          >
                              <div className="flex items-center justify-center w-6 h-6 bg-[#373946] rounded-md text-white text-xs">
                              {index + 1}
                            </div>
                          </td>
                            <td className="admin-table-td-mobile">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded overflow-hidden bg-[#2c2f3a] flex items-center justify-center">
                              {casino.logo ? (
                                <Image
                                  src={normalizeImagePath(casino.logo)}
                                  alt={`${casino.name || 'Casino'} Logo`}
                                    width={32}
                                    height={32}
                                    className="object-contain sm:w-10 sm:h-10"
                                  onError={(e) => {
                                    // Fallback to initials when image fails to load
                                    e.currentTarget.style.display = 'none';
                                    const name = casino.name || 'Casino';
                                    const parentElement = e.currentTarget.parentElement;
                                    if (parentElement) {
                                      parentElement.innerHTML = name.substring(0, 2).toUpperCase();
                                    }
                                  }}
                                />
                              ) : (
                                  <span className="text-white text-xs font-medium">
                                  {(casino.name || 'Casino').substring(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                          </td>
                            <td className="px-2 py-3 sm:py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              checked={selectedCasinos.includes(casino.id)}
                              onChange={() => toggleSelectCasino(casino.id)}
                              className="h-4 w-4 rounded border-[#404055] text-[#68D08B] focus:ring-[#68D08B]"
                            />
                          </td>
                            <td className="admin-table-td-mobile">
                            {detailedView ? (
                              <div className="space-y-1">
                                {renderEditableField(casino, 'name', casino.name || '', 'Casino name')}
                                {renderEditableField(casino, 'slug', casino.slug || '', 'URL slug')}
                              </div>
                            ) : (
                                <div 
                                  className="cursor-pointer"
                                  onClick={() => router.push(`/admin/casinos/${casino.id}`)}
                                >
                                  <div className="text-sm font-medium text-white truncate max-w-[120px] sm:max-w-[200px]">
                                  {casino.name || 'Unnamed Casino'}
                                </div>
                                  <div className="text-xs sm:text-sm text-[#a7a9b4] truncate max-w-[120px] sm:max-w-[200px]">
                                    {casino.slug || 'no-slug'}
                                  </div>
                              </div>
                            )}
                          </td>
                          {detailedView && (
                            <>
                                <td className="admin-table-td-mobile hidden md:table-cell">
                                {renderEditableField(casino, 'website', casino.website || '', 'Website URL')}
                              </td>
                                <td className="admin-table-td-mobile hidden lg:table-cell">
                                {renderEditableField(casino, 'affiliateLink', casino.affiliateLink || '', 'Affiliate link')}
                              </td>
                                <td className="admin-table-td-mobile hidden lg:table-cell">
                                {renderEditableField(casino, 'bonusCode', casino.bonusCode || '', 'Bonus code')}
                              </td>
                            </>
                          )}
                            <td className="admin-table-td-mobile">
                              <div className="text-xs sm:text-sm text-white">
                              {casino.rating ? `${casino.rating.toFixed(1)}/5` : '0.0/5'}
                            </div>
                          </td>
                            <td className="admin-table-td-mobile text-right">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-1 sm:gap-2">
                            <button
                              onClick={() => router.push(`/admin/casinos/${casino.id}`)}
                                  className="text-[#68D08B] hover:text-[#5abc7a] text-xs sm:text-sm px-2 py-1 sm:px-0 sm:py-0 rounded sm:rounded-none bg-[#373946] sm:bg-transparent"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleClearContent(casino.id, casino.name || 'Casino')}
                              className="text-orange-400 hover:text-orange-300 text-xs sm:text-sm px-2 py-1 sm:px-0 sm:py-0 rounded sm:rounded-none bg-[#373946] sm:bg-transparent"
                              title="Clear all content sections"
                            >
                              Clear
                            </button>
                            <button
                              onClick={() => handleDelete(casino.id)}
                                  className="text-red-400 hover:text-red-300 text-xs sm:text-sm px-2 py-1 sm:px-0 sm:py-0 rounded sm:rounded-none bg-[#373946] sm:bg-transparent"
                            >
                              Delete
                            </button>
                              </div>
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {filteredCasinos.length === 0 && (
                    <tr>
                        <td colSpan={detailedView ? 10 : 7} className="px-3 sm:px-6 py-8 text-center text-[#a7a9b4] text-sm">
                        {searchTerm ? "No casinos found matching your search." : "No casinos found. Create your first casino by clicking the \"Add New Casino\" button."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </Droppable>
        </DragDropContext>
        </div>
      </div>

      <CSVImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
} 