import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { journeyContentService } from '../../lib/services/journeyContent.service';
import { companyToolsService } from '../../lib/services/companyTools.service';
import { useAuth } from '../../lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import EvaluationHistory, { EvaluationHistoryEntry } from '../../components/company/journey/ToolSelector/EvaluationHistory';
import * as toolSelectionService from '../../lib/services/toolSelection.service';

function CompanyToolsPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const { user } = useAuth();
  const [companyTools, setCompanyTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);
  const [evaluationHistories, setEvaluationHistories] = useState<Record<string, EvaluationHistoryEntry[]>>({});

  useEffect(() => {
    if (companyId) {
      fetchCompanyTools(companyId);
    } else {
      setError("Company ID is missing.");
      setLoading(false);
    }
  }, [companyId]);

  async function fetchCompanyTools(id: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await companyToolsService.getCompanyTools(id);
      setCompanyTools(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch company tools');
      setCompanyTools([]);
      toast.error("Failed to load company tools.");
    } finally {
      setLoading(false);
    }
  }

  async function handleExpandTool(toolId: string) {
    setExpandedToolId(expandedToolId === toolId ? null : toolId);
    if (!evaluationHistories[toolId]) {
      // Fetch evaluation history for this tool
      const evalRes = await toolSelectionService.getToolEvaluations(toolId, "");
      const docRes = await toolSelectionService.getToolDocuments(toolId);
      // Merge evaluations and documents by user/evaluation
      const evals = (evalRes.data || []).map((e: any) => ({
        id: e.id,
        user: { id: e.user?.id, name: e.user?.full_name || "Unknown" },
        created_at: e.created_at,
        scorecard: e.responses,
        notes: e.notes,
        documents: (docRes.data || []).filter((d: any) => d.user_id === e.user_id && d.tool_id === toolId)
      }));
      setEvaluationHistories((prev) => ({ ...prev, [toolId]: evals }));
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Company Tools</h1>
      <p className="text-gray-600 mb-4">Manage the tools your company uses.</p>

      {loading && <p>Loading company tools...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Current Tools</h2>
          {companyTools.length === 0 ? (
            <p>No tools added to this company yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companyTools.map(ct => (
                <Card key={ct.id}>
                  <CardHeader>
                    <CardTitle>{ct.tool_details?.name || ct.tool_id || 'Unknown Tool'}</CardTitle>
                    {ct.tool_details?.category && <CardDescription>{ct.tool_details.category}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Source: {ct.source}</p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExpandTool(ct.tool_id)}
                    >
                      {expandedToolId === ct.tool_id ? "Hide Evaluation History" : "View Evaluation History"}
                    </Button>
                  </CardFooter>
                  {expandedToolId === ct.tool_id && (
                    <CardContent>
                      <EvaluationHistory entries={evaluationHistories[ct.tool_id] || []} />
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CompanyToolsPage;
