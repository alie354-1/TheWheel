import React, { useEffect, useState } from "react";
import {
  listIntegrations,
  connectIntegration,
  disconnectIntegration,
  fetchExternalContent,
  ExternalLMSIntegration,
  ExternalContentResource,
} from "@/lib/services/externalTrainingIntegration.service";

interface ExternalTrainingIntegrationManagerProps {
  companyId: string;
}

const ExternalTrainingIntegrationManager: React.FC<ExternalTrainingIntegrationManagerProps> = ({ companyId }) => {
  const [integrations, setIntegrations] = useState<ExternalLMSIntegration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<ExternalLMSIntegration | null>(null);
  const [content, setContent] = useState<ExternalContentResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listIntegrations(companyId)
      .then(setIntegrations)
      .catch((err) => setError(err.message || "Failed to load integrations"))
      .finally(() => setLoading(false));
  }, [companyId]);

  const handleConnect = async (integration: ExternalLMSIntegration) => {
    setConnecting(true);
    // For demo, use dummy credentials
    const success = await connectIntegration(companyId, integration.id, { token: "demo-token" });
    if (success) {
      setIntegrations((prev) =>
        prev.map((i) => (i.id === integration.id ? { ...i, status: "connected" } : i))
      );
    }
    setConnecting(false);
  };

  const handleDisconnect = async (integration: ExternalLMSIntegration) => {
    setConnecting(true);
    const success = await disconnectIntegration(companyId, integration.id);
    if (success) {
      setIntegrations((prev) =>
        prev.map((i) => (i.id === integration.id ? { ...i, status: "disconnected" } : i))
      );
      setSelectedIntegration(null);
      setContent([]);
    }
    setConnecting(false);
  };

  const handleViewContent = async (integration: ExternalLMSIntegration) => {
    setLoading(true);
    setSelectedIntegration(integration);
    const resources = await fetchExternalContent(companyId, integration.id);
    setContent(resources);
    setLoading(false);
  };

  return (
    <section className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">External Training Integrations</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading ? (
        <div className="text-gray-400">Loading integrations...</div>
      ) : (
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{integration.name}</div>
                <div className="text-xs text-gray-500">{integration.api_url}</div>
                <div className="text-xs text-gray-600">
                  Status:{" "}
                  <span
                    className={
                      integration.status === "connected"
                        ? "text-green-600"
                        : integration.status === "error"
                        ? "text-red-600"
                        : "text-gray-500"
                    }
                  >
                    {integration.status}
                  </span>
                  {integration.last_sync && (
                    <span className="ml-2 text-gray-400">
                      Last sync: {new Date(integration.last_sync).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {integration.status === "connected" ? (
                  <>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleViewContent(integration)}
                      disabled={connecting}
                    >
                      View Content
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => handleDisconnect(integration)}
                      disabled={connecting}
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleConnect(integration)}
                    disabled={connecting}
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* External Content Resources */}
      {selectedIntegration && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">
            Content from {selectedIntegration.name}
          </h3>
          {loading ? (
            <div className="text-gray-400">Loading content...</div>
          ) : content.length === 0 ? (
            <div className="text-gray-500">No content found for this provider.</div>
          ) : (
            <table className="table table-sm w-full">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Provider</th>
                  <th>Rating</th>
                  <th>Usage</th>
                  <th>Cost</th>
                  <th>Link</th>
                </tr>
              </thead>
              <tbody>
                {content.map((resource) => (
                  <tr key={resource.id}>
                    <td>{resource.title}</td>
                    <td>{resource.type}</td>
                    <td>{resource.provider}</td>
                    <td>{resource.rating ?? "-"}</td>
                    <td>{resource.usage_count ?? "-"}</td>
                    <td>{resource.cost !== undefined ? `$${resource.cost}` : "-"}</td>
                    <td>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  );
};

export default ExternalTrainingIntegrationManager;
