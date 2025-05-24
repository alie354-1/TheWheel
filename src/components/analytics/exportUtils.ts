/**
 * Utility to export tabular data to CSV.
 * Accepts an array of objects (rows) and a filename.
 */
export function exportToCSV(rows: Record<string, any>[], filename: string) {
  if (!rows.length) return;

  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(",") +
    "\n" +
    rows
      .map(row =>
        keys
          .map(k => {
            const val = row[k];
            if (val == null) return "";
            // Escape quotes and commas
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
