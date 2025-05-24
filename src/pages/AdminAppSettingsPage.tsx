import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { appSettingsService, AppSetting } from '../lib/services/appSettings.service'; // Import type directly
import { useAuth } from '../lib/hooks/useAuth'; // To get admin user ID for upsert
import { toast } from 'sonner'; // For feedback

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className="p-4 border rounded bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-700 dark:text-red-200">
    <p><strong>Error:</strong> {message}</p>
  </div>
);

/**
 * AdminAppSettingsPage allows administrators to view and manage application settings.
 */
const AdminAppSettingsPage: React.FC = () => {
  const { user } = useAuth(); // Get current user
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSettingKey, setEditingSettingKey] = useState<string | null>(null); // Tracks which setting is being edited
  const [editFormData, setEditFormData] = useState<Partial<AppSetting>>({}); // Holds data for the setting being edited
  const [isAdding, setIsAdding] = useState<boolean>(false); // State to control add form visibility
  const [newSettingData, setNewSettingData] = useState<Partial<AppSetting>>({ scope: 'global', value: '' }); // State for new setting form
  const [filterScope, setFilterScope] = useState<'all' | 'global' | 'company'>('all'); // Filter state
  const [filterCompanyId, setFilterCompanyId] = useState<string>(''); // Company ID filter state

  const generateSettingUniqueKey = (setting: AppSetting): string => {
    return `${setting.scope}-${setting.company_id || 'global'}-${setting.key}`;
  };

  const fetchSettings = useCallback(async () => {
    // Use filter state
    const scopeToFetch = filterScope === 'all' ? undefined : filterScope;
    // Only apply companyId filter if scope is 'company' or 'all' and filterCompanyId is not empty
    const companyIdToFetch = (filterScope === 'company' || filterScope === 'all') && filterCompanyId.trim() !== '' 
      ? filterCompanyId.trim() 
      : undefined;

    setIsLoading(true);
    setError(null);
    try {
        // Fetch settings based on scope/companyId
        const data = await appSettingsService.getAllSettings(scopeToFetch, companyIdToFetch);
        if (data) {
          setSettings(data);
        } else {
          setError('Failed to fetch settings. The service returned null.');
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred while fetching settings.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, [filterScope, filterCompanyId]); // Add filter states as dependencies

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleEditClick = (setting: AppSetting) => {
    const uniqueKey = generateSettingUniqueKey(setting);
    setEditingSettingKey(uniqueKey);
    // Initialize form data with current setting values
    setEditFormData({
      key: setting.key,
      value: setting.value,
      description: setting.description,
      scope: setting.scope,
      company_id: setting.company_id,
    });
  };

  const handleCancelEdit = () => {
    setEditingSettingKey(null);
    setEditFormData({});
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;

    // Handle boolean specifically if needed (e.g., from a checkbox or select)
    // For simplicity, assuming text input for now. A real implementation
    // might need type-specific inputs.
    if (name === 'value') {
       // Attempt to parse if it looks like a boolean or number
       if (value.toLowerCase() === 'true') processedValue = true;
       else if (value.toLowerCase() === 'false') processedValue = false;
       else if (!isNaN(Number(value)) && value.trim() !== '') processedValue = Number(value);
       // Otherwise keep as string
    }

    setEditFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSaveEdit = async () => {
    if (!editingSettingKey || !editFormData.key || !editFormData.scope || !user) {
      toast.error("Cannot save setting: Missing required data or user information.");
      return;
    }

    // Basic validation for company scope
    if (editFormData.scope === 'company' && !editFormData.company_id) {
       toast.error("Company ID is required for company-scoped settings.");
       return;
    }

    setIsLoading(true); // Indicate saving process
    try {
      const settingToSave: Omit<AppSetting, 'created_at' | 'updated_at'> = {
        key: editFormData.key,
        value: editFormData.value,
        scope: editFormData.scope,
        description: editFormData.description || undefined, // Ensure optional fields are handled
        company_id: editFormData.scope === 'company' ? editFormData.company_id : null,
      };

      const updatedSetting = await appSettingsService.upsertSetting(settingToSave, user.id);

      if (updatedSetting) {
        toast.success(`Setting "${updatedSetting.key}" saved successfully.`);
        setEditingSettingKey(null); // Exit edit mode
        setEditFormData({});
        await fetchSettings(); // Refresh the settings list
      } else {
        throw new Error("Failed to save setting. Service returned null.");
      }
    } catch (err: any) {
      console.error("Error saving setting:", err);
      toast.error(`Error saving setting: ${err.message || 'Unknown error'}`);
      // Optionally keep edit mode open on error?
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSettingFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
     let processedValue: any = value;

    // Similar processing as edit form
    if (name === 'value') {
       if (value.toLowerCase() === 'true') processedValue = true;
       else if (value.toLowerCase() === 'false') processedValue = false;
       else if (!isNaN(Number(value)) && value.trim() !== '') processedValue = Number(value);
    }

    setNewSettingData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewSettingData({ scope: 'global', value: '' }); // Reset form
  };

  const handleAddNewSetting = async () => {
     if (!newSettingData.key || !newSettingData.scope || !user) {
      toast.error("Cannot add setting: Missing key or scope, or user information.");
      return;
    }
     if (newSettingData.scope === 'company' && !newSettingData.company_id) {
       toast.error("Company ID is required for company-scoped settings.");
       return;
    }

    setIsLoading(true);
    try {
       const settingToAdd: Omit<AppSetting, 'created_at' | 'updated_at'> = {
        key: newSettingData.key,
        value: newSettingData.value,
        scope: newSettingData.scope,
        description: newSettingData.description || undefined,
        company_id: newSettingData.scope === 'company' ? newSettingData.company_id : null,
      };

      const addedSetting = await appSettingsService.upsertSetting(settingToAdd, user.id);

      if (addedSetting) {
        toast.success(`Setting "${addedSetting.key}" added successfully.`);
        setIsAdding(false); // Hide form
        setNewSettingData({ scope: 'global', value: '' }); // Reset form
        await fetchSettings(); // Refresh list
      } else {
        throw new Error("Failed to add setting. Service returned null.");
      }
    } catch (err: any) {
       console.error("Error adding setting:", err);
       toast.error(`Error adding setting: ${err.message || 'Unknown error'}`);
    } finally {
       setIsLoading(false);
     }
  };

  const handleDeleteSetting = async (setting: AppSetting) => {
    if (!user) {
       toast.error("Cannot delete setting: User information missing.");
       return;
    }
    
    // Confirmation dialog
    if (!window.confirm(`Are you sure you want to delete the setting "${setting.key}" for scope "${setting.scope}"${setting.company_id ? ` (Company: ${setting.company_id})` : ''}? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    try {
      // The deleteSetting function in the service needs the primary key components: key, scope, and company_id (or null for global)
      const deleted = await appSettingsService.deleteSetting(
        setting.key,
        setting.scope,
        setting.company_id ?? null // Pass company_id or explicitly null
      );

      if (deleted) {
        toast.success(`Setting "${setting.key}" deleted successfully.`);
        await fetchSettings(); // Refresh list
      } else {
        // This might happen if the setting didn't exist or RLS prevented deletion
        throw new Error("Failed to delete setting. It might have already been removed or you lack permissions.");
      }
    } catch (err: any) {
      console.error("Error deleting setting:", err);
      toast.error(`Error deleting setting: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Application Settings Management</h1>

      {/* Add/Filter Controls */}
      <div className="mb-4 flex flex-wrap justify-between items-center gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
           <div>
             <label htmlFor="filter-scope" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Scope:</label>
             <select
               id="filter-scope"
               value={filterScope}
               onChange={(e) => setFilterScope(e.target.value as any)}
               className="border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
             >
               <option value="all">All</option>
               <option value="global">Global</option>
               <option value="company">Company</option>
             </select>
           </div>
           {(filterScope === 'company' || filterScope === 'all') && (
             <div>
               <label htmlFor="filter-company-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Company ID:</label>
               <input
                 type="text"
                 id="filter-company-id"
                 placeholder="Enter Company ID..."
                 value={filterCompanyId}
                 onChange={(e) => setFilterCompanyId(e.target.value)}
                 className="border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
               />
             </div>
           )}
        </div>
        {/* Add Button */}
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add New Setting
        </button>
      </div>

      {/* Add New Setting Form */}
      {isAdding && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
          <h2 className="text-lg font-medium mb-4">Add New Setting</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key */}
            <div>
              <label htmlFor="new-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Key*</label>
              <input
                type="text"
                id="new-key"
                name="key"
                value={newSettingData.key ?? ''}
                onChange={handleNewSettingFormChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            {/* Scope */}
            <div>
              <label htmlFor="new-scope" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Scope*</label>
              <select
                id="new-scope"
                name="scope"
                value={newSettingData.scope ?? 'global'}
                onChange={handleNewSettingFormChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="global">Global</option>
                <option value="company">Company</option>
              </select>
            </div>
            {/* Company ID (Conditional) */}
            {newSettingData.scope === 'company' && (
              <div>
                <label htmlFor="new-company_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company ID*</label>
                <input
                  type="text"
                  id="new-company_id"
                  name="company_id"
                  value={newSettingData.company_id ?? ''}
                  onChange={handleNewSettingFormChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter Company UUID"
                />
              </div>
            )}
             {/* Value */}
             <div className={newSettingData.scope === 'company' ? '' : 'md:col-span-1'}> {/* Adjust span based on company_id visibility */}
              <label htmlFor="new-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Value*</label>
              <input
                type="text"
                id="new-value"
                name="value"
                value={String(newSettingData.value ?? '')}
                onChange={handleNewSettingFormChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter value (string, number, true/false)"
              />
            </div>
            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="new-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                id="new-description"
                name="description"
                rows={2}
                value={newSettingData.description ?? ''}
                onChange={handleNewSettingFormChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Optional description"
              />
            </div>
          </div>
          {/* Form Actions */}
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={handleCancelAdd}
              disabled={isLoading}
              className="px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNewSetting}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Setting'}
            </button>
          </div>
        </div>
      )}


      {isLoading && settings.length === 0 ? ( // Show spinner only on initial load
        <LoadingSpinner />
      ) : error ? (
        <ErrorDisplay message={error} />
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Key
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Value
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Scope / Company ID
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {settings.length > 0 ? (
                settings.map((setting) => {
                  const uniqueKey = generateSettingUniqueKey(setting);
                  const isEditingThis = editingSettingKey === uniqueKey;

                  return (
                    <tr key={uniqueKey} className={isEditingThis ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{setting.key}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {isEditingThis ? (
                          <input
                            type="text"
                            name="value"
                            value={String(editFormData.value ?? '')} // Display current edit value
                            onChange={handleEditFormChange}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        ) : (
                          // Display value appropriately based on type
                          typeof setting.value === 'boolean' ? (setting.value ? 'Enabled' : 'Disabled') : String(setting.value)
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                         {isEditingThis ? (
                          <textarea
                            name="description"
                            rows={2}
                            value={editFormData.description ?? ''}
                            onChange={handleEditFormChange}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Optional description"
                          />
                        ) : (
                          setting.description || '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {setting.scope}
                        {setting.scope === 'company' && setting.company_id && ` (${setting.company_id.substring(0, 8)}...)`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isEditingThis ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              disabled={isLoading}
                              className="text-green-600 hover:text-green-900 dark:hover:text-green-400 mr-3 disabled:opacity-50"
                            >
                              {isLoading ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isLoading}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClick(setting)}
                              className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400 mr-3"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteSetting(setting)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-900 dark:hover:text-red-400 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No settings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAppSettingsPage;
