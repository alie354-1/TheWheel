import React from "react";

export interface EvaluationHistoryEntry {
  id: string;
  user: { id: string; name: string };
  created_at: string;
  scorecard: { [criterion: string]: any };
  notes?: string;
  documents?: Array<{
    id: string;
    file_url: string;
    file_type?: string;
    description?: string;
    uploaded_at: string;
  }>;
}

interface EvaluationHistoryProps {
  entries: EvaluationHistoryEntry[];
}

const EvaluationHistory: React.FC<EvaluationHistoryProps> = ({ entries }) => {
  if (!entries || entries.length === 0) return <div className="text-base-content/50">No evaluations yet.</div>;
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Evaluation History</h3>
      <ul className="space-y-4">
        {entries.map((entry) => (
          <li key={entry.id} className="card bg-base-100 shadow-md p-4">
            <div className="mb-1 text-sm text-base-content/70">
              <span className="font-semibold">{entry.user.name}</span> &middot;{" "}
              {new Date(entry.created_at).toLocaleString()}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Scorecard:</span>
              <ul className="ml-4 list-disc">
                {Object.entries(entry.scorecard).map(([criterion, value]) => (
                  <li key={criterion}>
                    <span className="font-semibold">{criterion}:</span> {String(value)}
                  </li>
                ))}
              </ul>
            </div>
            {entry.notes && (
              <div className="mb-2">
                <span className="font-semibold">Notes:</span> {entry.notes}
              </div>
            )}
            {entry.documents && entry.documents.length > 0 && (
              <div>
                <span className="font-semibold">Documents:</span>
                <ul className="ml-4 list-disc">
                  {entry.documents.map((doc) => (
                    <li key={doc.id}>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        {doc.description || doc.file_type || "Document"}
                      </a>{" "}
                      <span className="text-xs text-base-content/50">
                        ({new Date(doc.uploaded_at).toLocaleString()})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EvaluationHistory;
