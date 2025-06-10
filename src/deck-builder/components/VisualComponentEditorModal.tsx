import React, { useState, useEffect, useCallback } from 'react';
import { RichTextEditor } from './editors/RichTextEditor.tsx';
import { RichFeatureListEditor } from './editors/RichFeatureListEditor.tsx';
import { VisualComponent, VisualComponentLayout as Layout } from '../types/index.ts';
import { BLOCK_REGISTRY, BlockType, EditableProp, ImageBlock } from '../types/blocks.ts'; 
import { X, Save, Trash2, UploadCloud, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { uploadImage, deleteImage } from '../services/ImageUploadService.ts';
import { useAuth } from '../../lib/contexts/AuthContext.tsx';
import { supabase } from '../../lib/supabase.ts';
// import { VisualComponentRenderer } from './VisualComponentRenderer.tsx';
import { EnhancedDraggableComponent, ColorTheme as EditorModalColorTheme } from './EnhancedVisualDeckBuilderHelpers.tsx'; // Use alias for clarity
import { ThemeSettings } from './ThemeCustomizationPanel.tsx'; // Import ThemeSettings for mapping if needed here, though mapping is in parent


interface VisualComponentEditorModalProps {
  component: VisualComponent | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (componentId: string, data: any, newLayout?: Layout) => void;
  onDelete: (componentId: string) => void;
  currentTheme: EditorModalColorTheme; // Explicitly use the imported and aliased ColorTheme
}

export const VisualComponentEditorModal: React.FC<VisualComponentEditorModalProps> = ({
  component,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  currentTheme,
}) => {
  const { user } = useAuth();
  const [editData, setEditData] = useState<any>({});
  const [previewLayout, setPreviewLayout] = useState<Layout | undefined>(component?.layout);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!component || !user) return;

    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    handleInputChange('uploading', true);

    try {
      const storagePath = await uploadImage(file, user.id);
      const publicUrl = supabase.storage.from('deck_images').getPublicUrl(storagePath).data.publicUrl;
      
      handleInputChange('src', publicUrl);
      handleInputChange('storagePath', storagePath);
    } catch (error) {
      console.error("Upload failed", error);
      // Optionally, show an error message to the user
    } finally {
      setIsUploading(false);
      handleInputChange('uploading', false);
    }
  }, [component, user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.webp'] },
    multiple: false,
  });

  // Helper function to attempt to singularize a label
  const labelSingular = (label: string): string => {
    if (label.toLowerCase().endsWith('s')) {
      return label.slice(0, -1);
    }
    return label;
  };

  useEffect(() => {
    if (component) {
      const blockMeta = component.type ? BLOCK_REGISTRY[component.type] : undefined;
      let initialData = { ...blockMeta?.sampleData, ...component.data };
      setPreviewLayout(component.layout || { x: 0, y: 0, width: 300, height: 200, zIndex: 1 });


      // Ensure array fields are properly initialized as arrays
      blockMeta?.editableProps?.forEach((prop: EditableProp) => {
        const fieldName = prop.name;
        let currentValue = initialData[fieldName];

        if (prop.type === 'string_array') {
          if (typeof currentValue === 'string') {
            try {
              currentValue = JSON.parse(currentValue);
            } catch (e) {
              console.error(`Failed to parse JSON string for ${fieldName}:`, currentValue, e);
              currentValue = blockMeta?.sampleData?.[fieldName] || [];
            }
          }
          if (!Array.isArray(currentValue)) {
            currentValue = blockMeta?.sampleData?.[fieldName] || [];
          }
          initialData[fieldName] = currentValue;
        } else if (prop.type === 'object_array') {
          if (typeof currentValue === 'string') {
            try {
              currentValue = JSON.parse(currentValue);
            } catch (e) {
              console.error(`Failed to parse JSON string for object array ${fieldName}:`, currentValue, e);
              currentValue = blockMeta?.sampleData?.[fieldName] || [];
            }
          }
          if (!Array.isArray(currentValue)) {
            currentValue = blockMeta?.sampleData?.[fieldName] || [];
          }
           const itemSchema = prop.itemSchema || [];
           initialData[fieldName] = currentValue.map((item: any) => {
             const newItem = { ...item }; 
             itemSchema.forEach((schemaProp: EditableProp) => {
               if (newItem[schemaProp.name] === undefined) {
                 const sampleVal = blockMeta?.sampleData?.[fieldName]?.[0]?.[schemaProp.name]; 
                 newItem[schemaProp.name] = sampleVal !== undefined ? sampleVal : (schemaProp.type === 'number' ? 0 : '');
               }
             });
             return newItem;
           });
        }
      });
      setEditData(initialData);
    }
  }, [component]);

  const handleSave = () => {
    if (component) {
      // Pass both data and potentially updated layout
      onUpdate(component.id, editData, previewLayout); 
      onClose();
    }
  };

  const handleDelete = () => {
    if (component && window.confirm('Are you sure you want to delete this component?')) {
      onDelete(component.id);
      onClose();
    }
  };

  const handleInputChange = (fieldName: string, value: any, itemIndex?: number, subFieldName?: string) => {
    setEditData((prev: any) => {
      const componentType = component!.type as BlockType;
      const currentPropInfo = BLOCK_REGISTRY[componentType]?.editableProps?.find((p: EditableProp) => p.name === fieldName);

      if (currentPropInfo?.type === 'string_array' && typeof itemIndex === 'number') {
        const newArray = [...(prev[fieldName] || [])];
        newArray[itemIndex] = value;
        return { ...prev, [fieldName]: newArray };
      } else if (currentPropInfo?.type === 'object_array' && typeof itemIndex === 'number' && subFieldName) {
        const newArray = [...(prev[fieldName] || [])];
        if (newArray[itemIndex]) {
          newArray[itemIndex] = { ...newArray[itemIndex], [subFieldName]: value };
        }
        return { ...prev, [fieldName]: newArray };
      }
      return { ...prev, [fieldName]: value };
    });
  };

  const handleAddItemToStringArray = (fieldName: string) => {
    setEditData((prev: any) => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] || []), 'New Item']
    }));
  };

  const handleRemoveItemFromStringArray = (fieldName: string, index: number) => {
    setEditData((prev: any) => {
      const newArray = [...(prev[fieldName] || [])];
      newArray.splice(index, 1);
      return { ...prev, [fieldName]: newArray };
    });
  };

  const handleAddItemToObjectArray = (fieldName: string, itemSchema: EditableProp[]) => {
    setEditData((prev: any) => {
      const newItem: any = {};
      itemSchema.forEach(prop => {
        // Initialize with default/empty values based on type
        if (prop.type === 'number') newItem[prop.name] = 0;
        else if (prop.type === 'checkbox') newItem[prop.name] = false;
        else newItem[prop.name] = ''; // Default for text, textarea, select, etc.
      });
      return {
        ...prev,
        [fieldName]: [...(prev[fieldName] || []), newItem]
      };
    });
  };
  
  const handleRemoveItemFromObjectArray = (fieldName: string, index: number) => {
    setEditData((prev: any) => {
      const newArray = [...(prev[fieldName] || [])];
      newArray.splice(index, 1);
      return { ...prev, [fieldName]: newArray };
    });
  };

  const renderEditorFields = () => {
    if (!component || !component.type) return null;

    const blockMeta = BLOCK_REGISTRY[component.type];

    // Special handling for 'customHtml' to provide a raw HTML editor
    if (component.type === 'customHtml') {
      return (
        <div key="customHtml-editor" className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">HTML Content</label>
          <textarea
            value={editData.html || ''}
            onChange={(e) => handleInputChange('html', e.target.value)}
            className="w-full h-64 p-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your HTML code here..."
          />
        </div>
      );
    }

    if (!blockMeta || !blockMeta.editableProps || blockMeta.editableProps.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>This component type doesn't have other custom editing options defined.</p>
          <p className="text-sm mt-2">You can still move and delete it.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {component.type === 'image' && (
          <div {...getRootProps()} className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center">
              {isUploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                  <p className="mt-2 text-sm text-gray-600">Uploading...</p>
                </>
              ) : (
                <>
                  <UploadCloud className="h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    {isDragActive ? "Drop the image here..." : "Drag 'n' drop an image here, or click to select"}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </>
              )}
            </div>
            {editData.src && !isUploading && (
              <div className="mt-4">
                <img src={editData.src} alt="Preview" className="max-h-32 mx-auto rounded-md" />
              </div>
            )}
          </div>
        )}
        {blockMeta.editableProps.map((propInfo: EditableProp) => {
          const fieldName = propInfo.name;
          const label = propInfo.label;
          const type = propInfo.type || 'text';
          const options = propInfo.type === 'select' ? propInfo.options : [];

          // Define fields that should use Rich Text Editor
          const richTextFields = ['text', 'description', 'quote', 'caption', 'headline', 'subheadline', 'problem', 'solution', 'html']; // Add more as needed

          if (type === 'textarea' || (type === 'text' && richTextFields.includes(fieldName))) {
            return (
              <div key={fieldName} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <RichTextEditor
                  content={editData[fieldName] || ''}
                  onChange={(content: string) => handleInputChange(fieldName, content)}
                />
              </div>
            );
          } else if (propInfo.type === 'rich_text_array' && fieldName === 'features') {
            return (
              <div key={fieldName} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <RichFeatureListEditor
                  items={editData[fieldName] || []}
                  onChange={(items) => handleInputChange(fieldName, items)}
                />
              </div>
            );
          } else if (type === 'string_array') {
            const items: string[] = Array.isArray(editData[fieldName]) ? editData[fieldName] : [];
            return (
              <div key={fieldName} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                {items.map((item: string, index: number) => (
                  <div key={`${fieldName}-${index}`} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleInputChange(fieldName, e.target.value, index)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleRemoveItemFromStringArray(fieldName, index)}
                      className="p-2 text-red-500 hover:text-red-700 flex-shrink-0"
                      title="Remove Item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddItemToStringArray(fieldName)}
                  className="mt-2 px-3 py-1.5 text-xs bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Add Item
                </button>
              </div>
            );
          } else if (type === 'object_array' && propInfo.itemSchema) {
            const items: any[] = Array.isArray(editData[fieldName]) ? editData[fieldName] : [];
            const itemSchema = propInfo.itemSchema;
            return (
              <div key={fieldName} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                {items.map((item, itemIndex) => (
                  <div key={`${fieldName}-${itemIndex}`} className="p-3 border border-gray-200 rounded-md space-y-2 bg-gray-50">
                    <div className="flex justify-between items-center">
                       <h4 className="text-xs font-semibold text-gray-600">Item {itemIndex + 1}</h4>
                       <button
                        onClick={() => handleRemoveItemFromObjectArray(fieldName, itemIndex)}
                        className="p-1 text-red-500 hover:text-red-700"
                        title={`Remove ${label} Item ${itemIndex + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {itemSchema.map((subProp: EditableProp) => (
                      <div key={`${fieldName}-${itemIndex}-${subProp.name}`}>
                        <label className="block text-xs font-medium text-gray-600 mb-0.5">{subProp.label}</label>
                        {subProp.type === 'textarea' ? (
                          <textarea
                            value={item[subProp.name] || ''}
                            onChange={(e) => handleInputChange(fieldName, e.target.value, itemIndex, subProp.name)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            rows={2}
                          />
                        ) : subProp.type === 'select' && subProp.options ? (
                          <select
                            value={item[subProp.name] || ''}
                            onChange={(e) => handleInputChange(fieldName, e.target.value, itemIndex, subProp.name)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {subProp.options.map((opt: {value: string; label: string}) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : subProp.type === 'checkbox' ? (
                          <input
                            type="checkbox"
                            checked={!!item[subProp.name]}
                            onChange={(e) => handleInputChange(fieldName, e.target.checked, itemIndex, subProp.name)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        ) : (
                          <input
                            type={subProp.type === 'color' ? 'color' : subProp.type === 'number' ? 'number' : 'text'}
                            value={item[subProp.name] || (subProp.type === 'number' ? 0 : (subProp.type === 'color' ? '#000000' : ''))}
                            onChange={(e) => handleInputChange(fieldName, subProp.type === 'number' ? parseFloat(e.target.value) : e.target.value, itemIndex, subProp.name)}
                            className={`w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${subProp.type === 'color' ? 'h-8 p-0.5' : ''}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
                <button
                  onClick={() => handleAddItemToObjectArray(fieldName, itemSchema)}
                  className="mt-2 px-3 py-1.5 text-xs bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Add {labelSingular(label)}
                </button>
              </div>
            );
          } else if (type === 'select' && options) {
            return (
              <div key={fieldName}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <select
                  value={editData[fieldName] || ''}
                  onChange={(e) => handleInputChange(fieldName, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {options?.map((opt: { value: string; label: string }) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            );
          } else if (type === 'number') {
            return (
              <div key={fieldName}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="number"
                  value={editData[fieldName] || 0}
                  onChange={(e) => handleInputChange(fieldName, parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            );
          }
          // Default to text input
          return (
            <div key={fieldName}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type === 'color' ? 'color' : 'text'}
                value={editData[fieldName] || ''}
                onChange={(e) => handleInputChange(fieldName, e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${type === 'color' ? 'h-10' : ''}`}
              />
            </div>
          );
        })}
      </div>
    );
  };

  if (!isOpen || !component) return null;

  const livePreviewComponent: VisualComponent | null = component && previewLayout ? {
    ...component,
    data: editData,
    layout: previewLayout, // Use the local previewLayout state
  } : null;
  
  const handlePreviewLayoutUpdate = (updates: Partial<VisualComponent>) => {
    if (updates.layout) {
      setPreviewLayout((prev: Layout | undefined) => ({...(prev || component!.layout), ...updates.layout!}));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      {/* Changed max-w-md to max-w-3xl for wider modal, and added flex-row for content */}
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800">
            Edit: {component.type ? (BLOCK_REGISTRY[component.type]?.label || component.type) : 'Component'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main content area with flex layout */}
        <div className="flex flex-grow overflow-hidden">
          {/* Editor Fields */}
          <div className="w-full overflow-y-auto pr-2 space-y-4">
            {renderEditorFields()}
          </div>
        </div>

        <div className="flex space-x-3 mt-6 pt-4 border-t">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <Save className="inline-block h-4 w-4 mr-2" />
            Save Changes
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            <Trash2 className="inline-block h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
