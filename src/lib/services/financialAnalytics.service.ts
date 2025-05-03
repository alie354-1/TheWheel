/**
 * Financial Analytics Service
 * - Calculate benchmarks and peer comparisons for company budgets
 * - Provide analytics and recommendations
 */

import { Client } from "pg";

const PG_CONNECTION_STRING = process.env.DATABASE_URL || "postgres://user:password@localhost:5432/dbname";

export const financialAnalyticsService = {
  // Get average budget by category for all companies (or by template), with count
  async getCategoryBenchmarks(templateId: string | null = null) {
    const client = new Client({ connectionString: PG_CONNECTION_STRING });
    await client.connect();
    let sql = `
      SELECT category, AVG(amount) AS avg_amount, COUNT(*) AS count
      FROM company_budget
      WHERE amount IS NOT NULL
    `;
    const params: any[] = [];
    if (templateId) {
      sql += " AND template_id = $1";
      params.push(templateId);
    }
    sql += " GROUP BY category ORDER BY category";
    const { rows } = await client.query(sql, params);
    await client.end();
    return rows;
  },

  // Get total budget and burn rate for a company
  async getCompanyBudgetStats(companyId: string) {
    const client = new Client({ connectionString: PG_CONNECTION_STRING });
    await client.connect();
    const { rows } = await client.query(
      `SELECT
         SUM(amount) AS total_budget,
         SUM(CASE WHEN period = 'monthly' THEN amount ELSE 0 END) AS monthly_burn
       FROM company_budget
       WHERE company_id = $1`,
      [companyId]
    );
    await client.end();
    return rows[0];
  }
};
