import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyToolEvaluationService } from '../../lib/services/companyToolEvaluation.service';
import { companyToolsService } from '../../lib/services/companyTools.service';
import { useAuth } from '../../lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Assuming CardFooter is exported here too
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // Import Input
import { toast } from 'sonner';

// Define evaluation criteria (example)
const EVALUATION_CRITERIA = [
  { key: 'feature_completeness', label: 'Feature Completeness (1-5)' },
  { key: 'ease_of_use', label: 'Ease of Use (1-5)' },
  { key: 'affordability', label: 'Affordability (1-5)' },
  { key: 'customer_support', label: 'Customer Support (1-5)' },
  { key: 'integration_capability', label: 'Integration Capability (1-5)' },
  { key: 'scalability', label: 'Scalability (1-5)' },
  { key: 'overall_fit', label: 'Overall Fit (1-5)' },
];

// Interface for the evaluation record in company_tool_evaluations table
interface EvaluationRecord {
    id: string;
    company_id: string;
    tool_id: string; // This seems to be the ID from journey_step_tools or custom
    added_by: string;
    added_at: string;
    notes?: string | null;
    is_selected?: boolean;
    // Add other fields if they exist in your table
}

// Interface for scorecard entries
interface ScorecardEntry {
    id: string;
    evaluation_id: string;
    criterion: string;
    rating: number;
    notes?: string | null;
}


function CompanyToolEvaluationPage() {
  // companyToolId from URL likely refers to the ID in the company_tools table,
  // which links company and the actual tool (journey_step_tools.id or custom).
  // The evaluation table seems to use this company_tool link ID. Let's rename for clarity.
  const { companyId, companyToolLinkId } = useParams<{ companyId: string; companyToolLinkId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [companyToolLink, setCompanyToolLink] = useState<any>(null); // Details of the company_tools link
  const [toolDetails, setToolDetails] = useState<any>(null); // Details from journey_step_tools if linked
  const [evaluation, setEvaluation] = useState<EvaluationRecord | null>(null); // Existing evaluation record
  const [scorecardEntries, setScorecardEntries] = useState<ScorecardEntry[]>([]); // Existing scores
  const [scores, setScores] = useState<Record<string, number | null>>({}); // Local state for editing scores
  const [scoreNotes, setScoreNotes] = useState<Record<string, string>>({}); // Local state for score notes (if service supports it)
  const [comments, setComments] = useState(''); // Local state for overall comments
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (companyId && companyToolLinkId) {
      fetchData(companyId, companyToolLinkId);
    } else {
      setError("Company ID or Company Tool Link ID is missing.");
      setLoading(false);
    }
  }, [companyId, companyToolLinkId]);

  async function fetchData(cId: string, ctLinkId: string) {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch the company_tools link entry (assuming service exists)
      //    We need this to potentially get the actual tool_id if needed later
      //    Let's assume companyToolsService.getCompanyToolById(ctLinkId) exists for now
      //    If not, this needs adjustment.
      // const ctLinkData = await companyToolsService.getCompanyToolById(ctLinkId);
      // if (!ctLinkData) throw new Error("Company tool link not found.");
      // setCompanyToolLink(ctLinkData);
      // const actualToolId = ctLinkData.tool_id; // ID from journey_step_tools or custom

      // 2. Fetch the evaluation record using company_id and tool_id
      //    The service has getEvaluationList, let's filter that.
      //    NOTE: This assumes tool_id is unique within a company's evaluation list.
      //    If ctLinkId IS the evaluation ID, this logic changes. Let's assume ctLinkId is NOT the evaluation ID for now.

      // TODO: Clarify if companyToolLinkId from URL maps to company_tools.id or company_tool_evaluations.id
      // Assuming it maps to company_tool_evaluations.id for now as it makes more sense for an *evaluation* page.
      const evaluationId = ctLinkId; // Assuming the ID in the URL IS the evaluation ID.

      // Fetch evaluation details directly (Need a service method for this)
      // Placeholder: Fetch list and filter (less efficient)
      const evalList = await companyToolEvaluationService.getEvaluationList(cId);
      const foundEval = evalList.find((ev: EvaluationRecord) => ev.id === evaluationId);

      if (foundEval) {
        setEvaluation(foundEval);
        setComments(foundEval.notes || '');

        // 3. Fetch existing scorecard entries for this evaluation
        const scoresData = await companyToolEvaluationService.getScorecards(foundEval.id);
        setScorecardEntries(scoresData);

        // Populate local state
        const initialScores: Record<string, number | null> = {};
        const initialScoreNotes: Record<string, string> = {};
        EVALUATION_CRITERIA.forEach(c => initialScores[c.key] = null); // Default null
        scoresData.forEach((sc: ScorecardEntry) => {
            initialScores[sc.criterion] = sc.rating;
            initialScoreNotes[sc.criterion] = sc.notes || '';
        });
        setScores(initialScores);
        setScoreNotes(initialScoreNotes);

      } else {
        // No evaluation found for this ID - this shouldn't happen if linking is correct
        console.error("Evaluation record not found for ID:", evaluationId);
        setError("Evaluation record not found.");
        // Initialize scores
        const initialScores: Record<string, number | null> = {};
        EVALUATION_CRITERIA.forEach(c => initialScores[c.key] = null);
        setScores(initialScores);
        setComments('');
      }

      // TODO: Fetch actual tool details (name, url etc.) based on evaluation.tool_id if needed


    } catch (err: any) {
      setError(err.message || 'Failed to load evaluation data');
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const handleScoreChange = (key: string, value: string) => {
    const numValue = parseInt(value);
    setScores(prev => ({
      ...prev,
      [key]: isNaN(numValue) ? null : Math.max(1, Math.min(5, numValue)) // Clamp between 1 and 5
    }));
  };

  // Handler for score-specific notes (if UI added)
  const handleScoreNoteChange = (key: string, value: string) => {
    setScoreNotes(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluation || !user) {
        toast.error("Cannot save evaluation: Missing evaluation context or user.");
        return;
    }

    setSaving(true);
    setError(null);
    const evaluationId = evaluation.id;

    try {
        // Use Promise.all to save all scorecards concurrently
        await Promise.all(
            EVALUATION_CRITERIA.map(criterion => {
                const rating = scores[criterion.key];
                const notes = scoreNotes[criterion.key] || ''; // Get notes for this score
                if (rating !== null) { // Only save if a rating was given
                    return companyToolEvaluationService.upsertScorecard(
                        evaluationId,
                        criterion.key,
                        rating,
                        notes // Pass notes to service
                    );
                }
                return Promise.resolve(); // Return resolved promise if no rating
            })
        );

        // Update the overall comments/notes
        await companyToolEvaluationService.updateEvaluationNotes(evaluationId, comments);

        toast.success("Evaluation saved successfully.");
        // Optionally refetch data
        // fetchData(companyId, evaluationId);

    } catch (err: any) {
      setError(err.message || 'Failed to save evaluation');
      toast.error(`Failed to save evaluation: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };


  if (loading) return <p className="p-8">Loading evaluation...</p>;
  if (error) return <p className="p-8 text-red-500">Error: {error}</p>;
  // If evaluation is null after loading and no error, it means not found
  if (!evaluation) return <p className="p-8">Evaluation record not found.</p>;

  // TODO: Get tool name from toolDetails when implemented
  const toolName = toolDetails?.name || evaluation?.tool_id || 'Unknown Tool'; // Use evaluation.tool_id as fallback

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Button variant="outline" onClick={() => navigate(`/company/${companyId}/tools`)} className="mb-4">
        &larr; Back to Company Tools
      </Button>
      <h1 className="text-3xl font-bold mb-2">Evaluate Tool: {toolName}</h1>
      <p className="text-gray-600 mb-6">Rate the tool based on the following criteria (1-5).</p>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {EVALUATION_CRITERIA.map(criterion => (
              <div key={criterion.key} className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor={criterion.key} className="text-right">{criterion.label}</Label>
                <Input
                  id={criterion.key}
                  type="number"
                  min="1"
                  max="5"
                  value={scores[criterion.key] ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScoreChange(criterion.key, e.target.value)} // Added type
                  className="col-span-2"
                />
                {/* Optional: Add input for notes per criterion */}
                {/* <Textarea placeholder="Notes..." value={scoreNotes[criterion.key] ?? ''} onChange={(e) => handleScoreNoteChange(criterion.key, e.target.value)} /> */}
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor="comments">Overall Comments</Label>
              <Textarea
                id="comments"
                placeholder="Add any additional comments about the tool..."
                value={comments}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComments(e.target.value)} // Added type
                rows={4}
              />
            </div>
          </CardContent>
          {/* Assuming CardFooter is exported from '@/components/ui/card' */}
          <div className="flex items-center justify-end space-x-2 p-6 pt-0">
             <Button type="submit" disabled={saving}>
               {saving ? 'Saving...' : 'Save Evaluation'}
             </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

export default CompanyToolEvaluationPage;
