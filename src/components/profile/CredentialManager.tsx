import React, { useEffect, useState } from "react";
import { fetchCredentials, ExternalLMSIntegration } from "@/lib/services/externalTrainingIntegration.service";

interface CredentialManagerProps {
  userId: string;
  companyId: string;
  integrations: ExternalLMSIntegration[];
}

interface Credential {
  id: string;
  provider: string;
  title: string;
  issued_at: string;
  expires_at?: string;
  url?: string;
  status: "valid" | "expired" | "revoked";
}

const CredentialManager: React.FC<CredentialManagerProps> = ({ userId, companyId, integrations }) => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllCredentials = async () => {
      setLoading(true);
      setError(null);
      try {
        // For demo, simulate credentials for each integration
        const creds: Credential[] = [];
        for (const integration of integrations) {
          const data = await fetchCredentials(companyId, integration.id);
          if (data) {
            creds.push({
              id: `${integration.id}-cred`,
              provider: integration.name,
              title: "Certified Course Completion",
              issued_at: new Date().toISOString(),
              status: "valid",
              url: "https://provider.com/certificate/123"
            });
          }
        }
        setCredentials(creds);
      } catch (err: any) {
        setError(err.message || "Failed to fetch credentials.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllCredentials();
  }, [userId, companyId, integrations]);

  return (
    <section className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">External Credentials & Certificates</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading ? (
        <div className="text-gray-400">Loading credentials...</div>
      ) : credentials.length === 0 ? (
        <div className="text-gray-500">No credentials found from external providers.</div>
      ) : (
        <table className="table table-sm w-full">
          <thead>
            <tr>
              <th>Title</th>
              <th>Provider</th>
              <th>Issued</th>
              <th>Status</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {credentials.map((cred) => (
              <tr key={cred.id}>
                <td>{cred.title}</td>
                <td>{cred.provider}</td>
                <td>{new Date(cred.issued_at).toLocaleDateString()}</td>
                <td>
                  <span
                    className={
                      cred.status === "valid"
                        ? "text-green-600"
                        : cred.status === "expired"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }
                  >
                    {cred.status}
                  </span>
                </td>
                <td>
                  {cred.url ? (
                    <a
                      href={cred.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default CredentialManager;
