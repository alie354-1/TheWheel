/**
 * Company Tools Service
 * - Fetch all tools used by a company (journey steps, custom, direct)
 * - Add/remove tools from company toolset
 * - Upload/associate contracts and documents
 */

import { Client } from "pg";

const PG_CONNECTION_STRING = process.env.DATABASE_URL || "postgres://user:password@localhost:5432/dbname";

export const companyToolsService = {
  // Fetch all tools used by a company
  async getCompanyTools(companyId: string) {
    const client = new Client({ connectionString: PG_CONNECTION_STRING });
    await client.connect();

    const sql = `
      SELECT
        ct.id AS company_tool_id,
        COALESCE(jst.id, cjst.id) AS tool_id,
        COALESCE(jst.name, cjst.name) AS name,
        COALESCE(jst.category, cjst.category) AS category,
        COALESCE(jst.description, cjst.description) AS description,
        COALESCE(jst.url, cjst.url) AS url,
        ct.source,
        ct.added_by,
        ct.added_at,
        d.id AS document_id,
        d.file_url,
        d.file_name,
        d.doc_type,
        d.uploaded_by,
        d.uploaded_at
      FROM company_tools ct
      LEFT JOIN journey_step_tools jst ON ct.tool_id = jst.id AND ct.source = 'global'
      LEFT JOIN company_journey_step_tools cjst ON ct.tool_id = cjst.id AND ct.source = 'custom'
      LEFT JOIN company_tool_documents d ON d.company_tool_id = ct.id
      WHERE ct.company_id = $1
      ORDER BY ct.added_at DESC
    `;

    const { rows } = await client.query(sql, [companyId]);
    await client.end();

    // Group documents by tool
    const toolMap: Record<string, any> = {};
    for (const row of rows) {
      if (!toolMap[row.company_tool_id]) {
        toolMap[row.company_tool_id] = {
          company_tool_id: row.company_tool_id,
          tool_id: row.tool_id,
          name: row.name,
          category: row.category,
          description: row.description,
          url: row.url,
          source: row.source,
          added_by: row.added_by,
          added_at: row.added_at,
          documents: []
        };
      }
      if (row.document_id) {
        toolMap[row.company_tool_id].documents.push({
          document_id: row.document_id,
          file_url: row.file_url,
          file_name: row.file_name,
          doc_type: row.doc_type,
          uploaded_by: row.uploaded_by,
          uploaded_at: row.uploaded_at
        });
      }
    }
    return Object.values(toolMap);
  },

  // Add a tool to the company toolset
  async addToolToCompany(companyId: string, toolId: string, source: string, addedBy: string) {
    const client = new Client({ connectionString: PG_CONNECTION_STRING });
    await client.connect();
    await client.query(
      `INSERT INTO company_tools (company_id, tool_id, source, added_by) VALUES ($1, $2, $3, $4)
       ON CONFLICT (company_id, tool_id) DO NOTHING`,
      [companyId, toolId, source, addedBy]
    );
    await client.end();
  },

  // Remove a tool from the company toolset
  async removeToolFromCompany(companyId: string, toolId: string) {
    const client = new Client({ connectionString: PG_CONNECTION_STRING });
    await client.connect();
    await client.query(
      `DELETE FROM company_tools WHERE company_id = $1 AND tool_id = $2`,
      [companyId, toolId]
    );
    await client.end();
  },

  // Upload a contract or document for a tool (stub, needs file storage integration)
  async uploadToolDocument(companyId: string, toolId: string, file: File, docType: string, uploadedBy: string) {
    // TODO: Upload file to storage, get file_url
    // const file_url = await uploadFileToStorage(file);
    const file_url = "https://example.com/path/to/file"; // Placeholder
    const file_name = file.name;
    const client = new Client({ connectionString: PG_CONNECTION_STRING });
    await client.connect();
    // Get company_tool_id
    const { rows } = await client.query(
      `SELECT id FROM company_tools WHERE company_id = $1 AND tool_id = $2 LIMIT 1`,
      [companyId, toolId]
    );
    if (rows.length === 0) {
      await client.end();
      throw new Error("Company tool association not found");
    }
    const company_tool_id = rows[0].id;
    await client.query(
      `INSERT INTO company_tool_documents (company_tool_id, file_url, file_name, doc_type, uploaded_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [company_tool_id, file_url, file_name, docType, uploadedBy]
    );
    await client.end();
  },

  // List all documents for a tool
  async getToolDocuments(companyId: string, toolId: string) {
    const client = new Client({ connectionString: PG_CONNECTION_STRING });
    await client.connect();
    const { rows } = await client.query(
      `SELECT d.* FROM company_tool_documents d
       JOIN company_tools ct ON d.company_tool_id = ct.id
       WHERE ct.company_id = $1 AND ct.tool_id = $2
       ORDER BY d.uploaded_at DESC`,
      [companyId, toolId]
    );
    await client.end();
    return rows;
  }
};
