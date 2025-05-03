/**
 * Script to analyze the structure of 'tools and steps (1).xlsx'
 * Prints sheet names and first 5 rows of each sheet.
 * Usage: node scripts/analyze-excel.js
 */

const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../tools and steps (1).xlsx');

try {
  const workbook = xlsx.readFile(filePath);
  const sheetNames = workbook.SheetNames;
  console.log('Sheet Names:', sheetNames);

  sheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const json = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`\nSheet: ${sheetName}`);
    json.slice(0, 6).forEach((row, idx) => {
      console.log(`Row ${idx}:`, row);
    });
  });
} catch (err) {
  console.error('Error reading Excel file:', err);
}
