import React, { useEffect, useState } from "react";
import { financialHubService } from "../../lib/services/financialHub.service";

// Assume companyId and userId are available via props, context, or authentication
const companyId = "REPLACE_WITH_COMPANY_ID";
const userId = "REPLACE_WITH_USER_ID";

function CompanyBudgetPage() {
  const [budget, setBudget] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  // For adding/editing budget lines
  const [editingLine, setEditingLine] = useState<any | null>(null);
  const [newLine, setNewLine] = useState({ category: "", description: "", amount: "", period: "" });
  const [savingLine, setSavingLine] = useState(false);

  useEffect(() => {
    fetchBudget();
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchBudget() {
    setLoading(true);
    const data = await financialHubService.getCompanyBudget(companyId);
    setBudget(data || []);
    setLoading(false);
  }

  async function fetchTemplates() {
    const data = await financialHubService.getBudgetTemplates();
    setTemplates(data || []);
  }

  async function handleImportTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTemplateId) return;
    setImporting(true);
    try {
      await financialHubService.importTemplateToCompanyBudget(companyId, selectedTemplateId, userId);
      await fetchBudget();
    } finally {
      setImporting(false);
    }
  }

  async function handleSaveLine(e: React.FormEvent) {
    e.preventDefault();
    setSavingLine(true);
    try {
      if (editingLine) {
        await financialHubService.updateBudgetLine(editingLine.id, {
          category: editingLine.category,
          description: editingLine.description,
          amount: parseFloat(editingLine.amount),
          period: editingLine.period
        });
        setEditingLine(null);
      } else {
        await financialHubService.addBudgetLine(companyId, {
          ...newLine,
          amount: parseFloat(newLine.amount),
          added_by: userId
        });
        setNewLine({ category: "", description: "", amount: "", period: "" });
      }
      await fetchBudget();
    } finally {
      setSavingLine(false);
    }
  }

  async function handleRemoveLine(budgetId: string) {
    if (!window.confirm("Remove this budget line?")) return;
    await financialHubService.removeBudgetLine(budgetId);
    await fetchBudget();
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Company Budget</h1>
      <form onSubmit={handleImportTemplate} className="flex items-center mb-4 gap-2">
        <select
          className="input input-bordered"
          value={selectedTemplateId || ""}
          onChange={e => setSelectedTemplateId(e.target.value)}
          disabled={importing}
        >
          <option value="">Import from template...</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" type="submit" disabled={importing || !selectedTemplateId}>
          {importing ? "Importing..." : "Import Template"}
        </button>
      </form>
      <div className="border p-4 rounded bg-gray-50">
        {loading ? (
          <span>Loading budget...</span>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Period</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {budget.map(line => (
                <tr key={line.id}>
                  <td>
                    {editingLine && editingLine.id === line.id ? (
                      <input
                        className="input input-bordered"
                        value={editingLine.category}
                        onChange={e => setEditingLine({ ...editingLine, category: e.target.value })}
                      />
                    ) : (
                      line.category
                    )}
                  </td>
                  <td>
                    {editingLine && editingLine.id === line.id ? (
                      <input
                        className="input input-bordered"
                        value={editingLine.description}
                        onChange={e => setEditingLine({ ...editingLine, description: e.target.value })}
                      />
                    ) : (
                      line.description
                    )}
                  </td>
                  <td>
                    {editingLine && editingLine.id === line.id ? (
                      <input
                        className="input input-bordered"
                        type="number"
                        value={editingLine.amount}
                        onChange={e => setEditingLine({ ...editingLine, amount: e.target.value })}
                      />
                    ) : (
                      line.amount
                    )}
                  </td>
                  <td>
                    {editingLine && editingLine.id === line.id ? (
                      <input
                        className="input input-bordered"
                        value={editingLine.period}
                        onChange={e => setEditingLine({ ...editingLine, period: e.target.value })}
                      />
                    ) : (
                      line.period
                    )}
                  </td>
                  <td>
                    {editingLine && editingLine.id === line.id ? (
                      <button
                        className="btn btn-xs btn-success"
                        onClick={handleSaveLine}
                        disabled={savingLine}
                      >
                        Save
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn btn-xs btn-outline"
                          onClick={() => setEditingLine(line)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-xs btn-error ml-2"
                          onClick={() => handleRemoveLine(line.id)}
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              <tr>
                <td>
                  <input
                    className="input input-bordered"
                    value={newLine.category}
                    onChange={e => setNewLine({ ...newLine, category: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="input input-bordered"
                    value={newLine.description}
                    onChange={e => setNewLine({ ...newLine, description: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="input input-bordered"
                    type="number"
                    value={newLine.amount}
                    onChange={e => setNewLine({ ...newLine, amount: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="input input-bordered"
                    value={newLine.period}
                    onChange={e => setNewLine({ ...newLine, period: e.target.value })}
                  />
                </td>
                <td>
                  <button
                    className="btn btn-xs btn-primary"
                    onClick={handleSaveLine}
                    disabled={savingLine}
                  >
                    Add
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default CompanyBudgetPage;
