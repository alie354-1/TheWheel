import React, { useEffect, useState } from "react";
import { toolSubmissionService } from "../lib/services/toolSubmission.service";

function AdminToolModerationPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moderatingId, setModeratingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    setLoading(true);
    try {
      const data = await toolSubmissionService.listPendingToolSubmissions();
      setSubmissions(data || []);
    } catch (err) {
      setSubmissions([]);
    }
    setLoading(false);
  }

  async function handleEnrich(submissionId: string) {
    setModeratingId(submissionId);
    try {
      await toolSubmissionService.enrichToolSubmission(submissionId);
      await fetchSubmissions();
    } finally {
      setModeratingId(null);
    }
  }

  async function handleApprove(submissionId: string) {
    setModeratingId(submissionId);
    try {
      // Assume admin userId is available
      const adminUserId = "REPLACE_WITH_ADMIN_USER_ID";
      await toolSubmissionService.promoteToolSubmission(submissionId, adminUserId);
      await fetchSubmissions();
    } finally {
      setModeratingId(null);
    }
  }

  async function handleReject(submissionId: string) {
    const reason = window.prompt("Reason for rejection?");
    if (!reason) return;
    setModeratingId(submissionId);
    try {
      const adminUserId = "REPLACE_WITH_ADMIN_USER_ID";
      await toolSubmissionService.rejectToolSubmission(submissionId, adminUserId, reason);
      await fetchSubmissions();
    } finally {
      setModeratingId(null);
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tool Submissions Moderation</h1>
      <div className="border p-4 rounded bg-gray-50">
        {loading ? (
          <span>Loading submissions...</span>
        ) : (
          <ul>
            {submissions.length === 0 ? (
              <li>No pending submissions.</li>
            ) : (
              submissions.map((sub: any) => (
                <li key={sub.id} className="mb-4 border-b pb-2">
                  <div>
                    <strong>{sub.name}</strong> ({sub.url})<br />
                    <span>Category: {sub.category}</span><br />
                    <span>Description: {sub.description}</span><br />
                    <span>Submitted by: {sub.submitted_by}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="btn btn-xs"
                      onClick={() => handleEnrich(sub.id)}
                      disabled={moderatingId === sub.id}
                    >
                      Enrich (AI)
                    </button>
                    <button
                      className="btn btn-xs btn-success"
                      onClick={() => handleApprove(sub.id)}
                      disabled={moderatingId === sub.id}
                    >
                      Approve & Promote
                    </button>
                    <button
                      className="btn btn-xs btn-error"
                      onClick={() => handleReject(sub.id)}
                      disabled={moderatingId === sub.id}
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AdminToolModerationPage;
