/**
 * App Settings Service
 * - Fetch and update app-wide settings (e.g., benchmark_min_count)
 */

import { Client } from "pg";

const PG_CONNECTION_STRING = process.env.DATABASE_URL || "postgres://user:password@localhost:5432/dbname";

export const appSettingsService = {
  // Fetch all app settings
  async getAppSettings() {
    const client = new Client({ connectionString: PG_CONNECTION_STRING });
    await client.connect();
    const { rows } = await client.query(
      `SELECT * FROM app_settings ORDER BY key`
    );
    await client.end();
    return rows;
  },

  // Fetch a single app setting by key
  async getAppSetting(key: string) {
    const client = new Client({ connectionString: PG_CONNECTION_STRING });
    await client.connect();
    const { rows } = await client.query(
      `SELECT * FROM app_settings WHERE key = $1 LIMIT 1`,
      [key]
    );
    await client.end();
    return rows[0];
  },

  // Update an app setting
  async updateAppSetting(key: string, value: string) {
    const client = new Client({ connectionString: PG_CONNECTION_STRING });
    await client.connect();
    await client.query(
      `UPDATE app_settings SET value = $2 WHERE key = $1`,
      [key, value]
    );
    await client.end();
  }
};
