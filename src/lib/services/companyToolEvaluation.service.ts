/**
 * Company Tool Evaluation Service
 * - Manage tool evaluation list, scorecards, notes, and selection
 * - Integrate with company budget when a tool is selected
 */

import { Client } from "pg";

const PG_CONNECTION_STRING = process.env.DATABASE_URL || "postgres://user:password@localhost:5432/dbname";

export const companyToolEvaluationService = {
  // Add a tool to the evaluation list
  async addToolToEvaluation(companyId: string, toolId: string, addedBy: string) {
    const client = new Client({ connectionString: PG_CONNECTION_STRING });
    await client.connect();
    await client.query(
      `INSERT INTO company_tool_evaluations (company_id, tool_id, added_by) VALUES ($1, $2, $3)
       ON CONFLICT (company_id, tool_id) DO NOTHING`,
      [companyId, toolId, addedBy]
    );
    await client.end();
  },

  // Remove a tool from the evaluation list
  async removeToolFromEvaluation(companyId: string, toolId: string) {
    const client = new Client({ connectionString: PG_CONNECTION_STRING });
    await client.connect();
    await client.query(
      `DELETE FROM company_tool_evaluations WHERE company_id = $1 AND tool_id = $2`,
      [companyId, toolId]
    );
    await client.end();
  },

  // List all tools in the evaluation list
  async getEvaluationList(companyId: string) {
    const client = new Client({ connectionString: PG_CONNECTION_STRING });
    await client.connect();
    const { rows } = await client.query(
      `SELECT * FROM company_tool_evaluations WHERE company_id = $1 ORDER BY added_at DESC`,
      [companyId]
    );
    await client.end();
    return rows;
  },

  // Add or update a scorecard entry for a tool
  async upsertScorecard(evaluationId: string, criterion: string, rating: number, notes: string) {
    const client = new Client({ connectionString: PG_CONNECTION_STRING });
    await client.connect();
    await client.query(
      `INSERT INTO company_tool_scorecards (evaluation_id, criterion, rating, notes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (evaluation_id, criterion) DO UPDATE SET rating = $3, notes = $4`,
      [evaluationId, criterion, rating, notes]
    );
    await client.end();
  },

  // List all scorecard entries for a tool evaluation
  async getScorecards(evaluationId: string) {
    const client = new Client({ connectionString: PG_CONNECTION_STRING });
    await client.connect();
    const { rows } = await client.query(
      `SELECT * FROM company_tool_scorecards WHERE evaluation_id = $1 ORDER BY created_at ASC`,
      [evaluationId]
    );
    await client.end();
    return rows;
  },

  // Add or update notes for a tool evaluation
  async updateEvaluationNotes(evaluationId: string, notes: string) {
    const client = new Client({ connectionString: PG_CONNECTION_STRING });
    await client.connect();
    await client.query(
      `UPDATE company_tool_evaluations SET notes = $1 WHERE id = $2`,
      [notes, evaluationId]
    );
    await client.end();
  },

  // Mark a tool as selected (and optionally add to budget)
  async selectTool(evaluationId: string, price: number | null = null, budgetCategory: string | null = null) {
    const client = new Client({ connectionString: PG_CONNECTION_STRING });
    await client.connect();
    await client.query(
      `UPDATE company_tool_evaluations SET is_selected = TRUE WHERE id = $1`,
      [evaluationId]
    );
    // TODO: If price and budgetCategory provided, add to company budget
    await client.end();
  }
};
