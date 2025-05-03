import React, { useEffect, useState } from "react";
import { appSettingsService } from "../lib/services/appSettings.service";

function AdminAppSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    const data = await appSettingsService.getAppSettings();
    setSettings(data || []);
  }

  async function handleSave(key: string) {
    await appSettingsService.updateAppSetting(key, editingValue);
    setEditingKey(null);
    setEditingValue("");
    await fetchSettings();
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">App Settings</h1>
      <table className="w-full">
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {settings.map(setting => (
            <tr key={setting.key}>
              <td>{setting.key}</td>
              <td>
                {editingKey === setting.key ? (
                  <input
                    className="input input-bordered"
                    value={editingValue}
                    onChange={e => setEditingValue(e.target.value)}
                  />
                ) : (
                  setting.value
                )}
              </td>
              <td>{setting.description}</td>
              <td>
                {editingKey === setting.key ? (
                  <button className="btn btn-xs btn-success" onClick={() => handleSave(setting.key)}>
                    Save
                  </button>
                ) : (
                  <button
                    className="btn btn-xs btn-outline"
                    onClick={() => {
                      setEditingKey(setting.key);
                      setEditingValue(setting.value);
                    }}
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminAppSettingsPage;
