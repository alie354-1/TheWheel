import React, { useState, useCallback, useMemo } from 'react'; // Added useMemo
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input"; // Import Input for filter
import { Label } from "@/components/ui/label"; // Import Label for filter
import { journeyContentService } from '../../lib/services/journeyContent.service';

// Define expected CSV Headers for validation and mapping hints
const EXPECTED_STEP_CSV_HEADERS = [
  'Phase', 'Phase Name', 'Step', 'Task', // Core Step Info
  // Optional but mappable Step Info
  'Need to Do? (Yes/No)', 'Explanation for Need', 'Dedicated Tool? (Yes/No)',
  'Explanation for Tool Need', 'Steps w/o Tool', 'Effort/Difficulty',
  'Staff/Freelancers (Optional)', 'Key Considerations', 'Bootstrap Mindset',
  'Founder Skills Needed'
];

const EXPECTED_TOOL_CSV_HEADERS = [
    'Step', // For linking
    'Tool (Name)', // Core Tool Info
    'Website', // Core Tool Info
    // Optional but mappable Tool Info
    'Category', 'Subcategory', 'Summary', 'Pros', 'Cons',
    'Usual Customer Stage', 'Founded', 'Last Funding Round', 'Comp. Svc. Pkg. (1-3)',
    'Ease of Use (1-3)', 'Affordability (1-3)', 'Customer Support (1-3)',
    'Speed of Setup (1-3)', 'Customization (1-3)', 'Range of Services (1-3)',
    'Integration (1-3)', 'Pro. Assistance (1-3)', 'Reputation (1-3)',
    'Reasoning: Comp Svc Pkg', 'Reasoning: Ease of Use', 'Reasoning: Affordability',
    'Reasoning: Customer Support', 'Reasoning: Speed of Setup', 'Reasoning: Customization',
    'Reasoning: Range of Services', 'Reasoning: Integration', 'Reasoning: Pro Assistance',
    'Reasoning: Reputation'
];

// Define all possible target DB columns for the dropdown, prefixed with table name
const ALL_TARGET_DB_COLUMNS = [
    // Phase columns (from schema) - Added back for mapping UI
    'journey_phases.name', // Target for CSV 'Phase Name'
    'journey_phases.description',
    'journey_phases.order_index', // Target for CSV 'Phase'
    'journey_phases.order', // Also target for CSV 'Phase'
    'journey_phases.icon',
    'journey_phases.color',

    // Step columns (from schema + ALTER)
    'journey_steps.name', // Target for CSV 'Task'
    'journey_steps.description',
    'journey_steps.guidance',
    'journey_steps.order_index', // Target for CSV 'Step'
    'journey_steps.order', // Also target for CSV 'Step'
    'journey_steps.estimated_duration',
    'journey_steps.required',
    'journey_steps.is_company_formation_step',
    'journey_steps.ask_wheel_enabled',
    'journey_steps.ask_expert_enabled',
    'journey_steps.use_tool_enabled',
    'journey_steps.diy_enabled',
    'journey_steps.need_to_do', // Target for CSV 'Need to Do? (Yes/No)'
    'journey_steps.need_explanation', // Target for CSV 'Explanation for Need'
    'journey_steps.dedicated_tool', // Target for CSV 'Dedicated Tool? (Yes/No)'
    'journey_steps.tool_explanation', // Target for CSV 'Explanation for Tool Need'
    'journey_steps.steps_without_tool', // Target for CSV 'Steps w/o Tool'
    'journey_steps.effort_difficulty', // Target for CSV 'Effort/Difficulty'
    'journey_steps.staff_freelancers', // Target for CSV 'Staff/Freelancers (Optional)'
    'journey_steps.key_considerations', // Target for CSV 'Key Considerations'
    'journey_steps.bootstrap_mindset', // Target for CSV 'Bootstrap Mindset'
    'journey_steps.founder_skills', // Target for CSV 'Founder Skills Needed'

    // Tool columns (from schema + ALTER)
    'journey_step_tools.name', // Target for CSV 'Tool (Name)'
    'journey_step_tools.description', // Target for CSV 'Summary'
    'journey_step_tools.url', // Target for CSV 'Website'
    'journey_step_tools.category', // Target for CSV 'Category'
    'journey_step_tools.subcategory', // Target for CSV 'Subcategory'
    'journey_step_tools.pros', // Target for CSV 'Pros'
    'journey_step_tools.cons', // Target for CSV 'Cons'
    'journey_step_tools.customer_stage', // Target for CSV 'Usual Customer Stage'
    'journey_step_tools.founded', // Target for CSV 'Founded'
    'journey_step_tools.last_funding_round', // Target for CSV 'Last Funding Round'
    'journey_step_tools.comp_svc_pkg', // Target for CSV 'Comp. Svc. Pkg. (1-3)'
    'journey_step_tools.ease_of_use', // Target for CSV 'Ease of Use (1-3)'
    'journey_step_tools.affordability', // Target for CSV 'Affordability (1-3)'
    'journey_step_tools.customer_support', // Target for CSV 'Customer Support (1-3)'
    'journey_step_tools.speed_of_setup', // Target for CSV 'Speed of Setup (1-3)'
    'journey_step_tools.customization', // Target for CSV 'Customization (1-3)'
    'journey_step_tools.range_of_services', // Target for CSV 'Range of Services (1-3)'
    'journey_step_tools.integration', // Target for CSV 'Integration (1-3)'
    'journey_step_tools.pro_assistance', // Target for CSV 'Pro. Assistance (1-3)'
    'journey_step_tools.reputation', // Target for CSV 'Reputation (1-3)'
    'journey_step_tools.reasoning_comp_svc_pkg', // Target for CSV 'Reasoning: Comp Svc Pkg'
    'journey_step_tools.reasoning_ease_of_use', // Target for CSV 'Reasoning: Ease of Use'
    'journey_step_tools.reasoning_affordability', // Target for CSV 'Reasoning: Affordability'
    'journey_step_tools.reasoning_customer_support', // Target for CSV 'Reasoning: Customer Support'
    'journey_step_tools.reasoning_speed_of_setup', // Target for CSV 'Reasoning: Speed of Setup'
    'journey_step_tools.reasoning_customization', // Target for CSV 'Reasoning: Customization'
    'journey_step_tools.reasoning_range_of_services', // Target for CSV 'Reasoning: Range of Services'
    'journey_step_tools.reasoning_integration', // Target for CSV 'Reasoning: Integration'
    'journey_step_tools.reasoning_pro_assistance', // Target for CSV 'Reasoning: Pro Assistance'
    'journey_step_tools.reasoning_reputation', // Target for CSV 'Reasoning: Reputation'
    'journey_step_tools.logo_url',
    'journey_step_tools.type',
    'journey_step_tools.ranking',
    'journey_step_tools.is_premium'
].sort(); // Sort alphabetically for dropdown

// Define which CSV headers are essential for which import type
const REQUIRED_STEP_CSV_HEADERS = ['Phase', 'Phase Name', 'Step', 'Task'];
const REQUIRED_TOOL_CSV_HEADERS = ['Step', 'Tool (Name)', 'Website'];


type SheetData = {
  name: string;
  headers: string[];
  rows: any[];
};

type Mapping = {
  [excelHeader: string]: string | null; // Map Excel header to DB column (e.g., "journey_steps.name") or null
};

const ExcelImportMapper: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState<number | null>(null);
  const [columnMapping, setColumnMapping] = useState<Mapping>({});
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mappingFilter, setMappingFilter] = useState(''); // State for the filter input

  // Filter dropdown options based on the filter text
  const filteredDbColumns = useMemo(() => {
    if (!mappingFilter) {
      return ALL_TARGET_DB_COLUMNS;
    }
    const lowerFilter = mappingFilter.toLowerCase();
    return ALL_TARGET_DB_COLUMNS.filter(col => col.toLowerCase().includes(lowerFilter));
  }, [mappingFilter]);


  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setSheets([]);
      setSelectedSheetIndex(null);
      setColumnMapping({});
      setImportStatus('idle');
      setErrorMessage(null);
      setMappingFilter(''); // Reset filter on new file
      parseExcelFile(selectedFile);
    }
  }, []);

  const parseExcelFile = (fileToParse: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("Could not read file data.");
        const workbook = XLSX.read(data, { type: 'array' });
        const parsedSheets: SheetData[] = workbook.SheetNames.map(name => {
          const sheet = workbook.Sheets[name];
          const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: null });
          const headers = rows.length > 0 ? rows[0].map(String) : [];
          const dataRows = rows.length > 1 ? rows.slice(1).map(rowArray => {
            const rowObj: any = {};
            headers.forEach((header: string, index: number) => {
              const trimmedHeader = header.trim();
              const value = rowArray[index];
              rowObj[trimmedHeader] = typeof value === 'string' ? value.trim() : value;
            });
            return rowObj;
          }) : [];
          const filteredDataRows = dataRows.filter(row => Object.values(row).some(val => val !== null && val !== ''));
          return { name, headers: headers.map((h: string) => h.trim()), rows: filteredDataRows };
        });
        setSheets(parsedSheets);
        if (parsedSheets.length > 0) {
          handleSheetSelect(0);
        }
      } catch (error: any) {
        console.error("Error parsing Excel file:", error);
        setErrorMessage(`Error parsing Excel file: ${error.message}`);
        setImportStatus('error');
      }
    };
    reader.onerror = (error) => {
      console.error("File reading error:", error);
      setErrorMessage("Failed to read the selected file.");
      setImportStatus('error');
    };
    reader.readAsArrayBuffer(fileToParse);
  };

 const handleSheetSelect = (index: number) => {
    setSelectedSheetIndex(index);
    const selectedSheet = sheets[index];
    if (selectedSheet) {
      // Auto-mapping: Match CSV header (case-insensitive, trimmed) to DB column name part
      const initialMapping: Mapping = {};
      selectedSheet.headers.forEach(header => {
        const lowerHeader = header.toLowerCase().trim();
        let dbCol: string | null | undefined = null;

        // --- Special Mapping Cases ---
        if (lowerHeader === 'phase name') dbCol = 'journey_phases.name';
        else if (lowerHeader === 'phase') dbCol = 'journey_phases.order_index';
        else if (lowerHeader === 'step') dbCol = 'journey_steps.order_index';
        else if (lowerHeader === 'task') dbCol = 'journey_steps.name';
        else if (lowerHeader === 'tool (name)') dbCol = 'journey_step_tools.name';
        else if (lowerHeader === 'summary') dbCol = 'journey_step_tools.description';
        else if (lowerHeader === 'website') dbCol = 'journey_step_tools.url';
        else if (lowerHeader === 'need to do? (yes/no)') dbCol = 'journey_steps.need_to_do';
        else if (lowerHeader === 'dedicated tool? (yes/no)') dbCol = 'journey_steps.dedicated_tool';
        else if (lowerHeader === 'usual customer stage') dbCol = 'journey_step_tools.customer_stage';
        else if (lowerHeader.startsWith('reasoning:')) {
             const baseName = lowerHeader.substring('reasoning:'.length).trim().replace(/[^a-zA-Z0-9_]/g, '_');
             dbCol = `journey_step_tools.reasoning_${baseName}`;
        } else if (lowerHeader.includes('(1-3)')) {
             const baseName = lowerHeader.replace(/\(1-3\)/, '').trim().replace(/[^a-zA-Z0-9_.]/g, '_');
             dbCol = `journey_step_tools.${baseName}`;
        }
        // --- General Case ---
        else {
          dbCol = ALL_TARGET_DB_COLUMNS.find(target =>
            target.split('.').pop()?.toLowerCase() === lowerHeader
          );
        }

        initialMapping[header] = dbCol && ALL_TARGET_DB_COLUMNS.includes(dbCol) ? dbCol : null;
      });
      console.log("Initial mapping:", initialMapping);
      setColumnMapping(initialMapping);
      setMappingFilter(''); // Reset filter when sheet changes
    }
  };


  const handleMappingChange = (excelHeader: string, dbColumn: string | null) => {
    setColumnMapping(prev => ({ ...prev, [excelHeader]: dbColumn }));
  };

  const handleImport = async () => {
    if (!file || selectedSheetIndex === null) {
      setErrorMessage("Please select a file and a sheet to import.");
      setImportStatus('error');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportStatus('idle');
    setErrorMessage(null);

    const selectedSheet = sheets[selectedSheetIndex];
    if (!selectedSheet) {
      setErrorMessage("Selected sheet data not found.");
      setImportStatus('error');
      setIsImporting(false);
      return;
    }

    // --- Validation based on MAPPED columns ---
    const mappedCsvHeaders = Object.keys(columnMapping).filter(key => columnMapping[key] !== null);

    const hasRequiredStepHeaders = REQUIRED_STEP_CSV_HEADERS.every(reqHeader => mappedCsvHeaders.includes(reqHeader));
    const hasRequiredToolHeaders = REQUIRED_TOOL_CSV_HEADERS.every(reqHeader => mappedCsvHeaders.includes(reqHeader));

    let sheetType: 'phase_step' | 'tool' | 'mixed' | 'unknown' = 'unknown';

    if (hasRequiredStepHeaders && hasRequiredToolHeaders) {
        sheetType = 'mixed';
        console.log("Detected sheet type: Mixed (Phases/Steps and Tools)");
    } else if (hasRequiredStepHeaders) {
        sheetType = 'phase_step';
        console.log("Detected sheet type: Phases/Steps");
    } else if (hasRequiredToolHeaders) {
        sheetType = 'tool';
        console.log("Detected sheet type: Tools");
    } else {
        const missingStep = REQUIRED_STEP_CSV_HEADERS.filter(reqHeader => !mappedCsvHeaders.includes(reqHeader));
        const missingTool = REQUIRED_TOOL_CSV_HEADERS.filter(reqHeader => !mappedCsvHeaders.includes(reqHeader));
        let specificError = "Could not determine sheet type based on mapped columns. ";
        if (missingStep.length < REQUIRED_STEP_CSV_HEADERS.length) {
           specificError += `To import Steps, please ensure columns are mapped for: ${missingStep.join(', ')}. `;
        }
        if (missingTool.length < REQUIRED_TOOL_CSV_HEADERS.length) {
            specificError += `To import Tools, please ensure columns are mapped for: ${missingTool.join(', ')}.`;
        }
        if (missingStep.length === REQUIRED_STEP_CSV_HEADERS.length && missingTool.length === REQUIRED_TOOL_CSV_HEADERS.length) {
            specificError += `Please map required columns for either Steps (${REQUIRED_STEP_CSV_HEADERS.join(', ')}) or Tools (${REQUIRED_TOOL_CSV_HEADERS.join(', ')}).`;
        }
        setErrorMessage(specificError);
        setImportStatus('error');
        setIsImporting(false);
        return;
    }

    // --- Data Transformation ---
    const transformedRows = selectedSheet.rows.map(originalRow => {
      const newRow: any = {};
      for (const csvHeader in columnMapping) {
        const targetDbColumn = columnMapping[csvHeader];
        if (targetDbColumn) {
          const columnNameOnly = targetDbColumn.split('.').pop()!;
          const rawValue = originalRow[csvHeader];

          if (csvHeader.includes('(Yes/No)')) {
              const lowerVal = String(rawValue).toLowerCase();
              newRow[columnNameOnly] = lowerVal === 'yes' || lowerVal === 'true';
          } else if (columnNameOnly === 'is_premium') {
              const lowerVal = String(rawValue).toLowerCase();
              newRow[columnNameOnly] = lowerVal === 'yes' || lowerVal === 'true';
          }
          else if (['order', 'order_index', 'ranking'].includes(columnNameOnly)) {
              const numVal = Number(rawValue);
              newRow[columnNameOnly] = isNaN(numVal) ? null : numVal;
          }
          else {
             newRow[columnNameOnly] = (rawValue === null || rawValue === '') ? null : rawValue;
          }
        }
      }
      const phaseOrder = Number(originalRow['Phase']);
      const stepOrder = Number(originalRow['Step']);
      if (!isNaN(phaseOrder)) newRow.csv_phase_order = phaseOrder;
      if (!isNaN(stepOrder)) newRow.csv_step_order = stepOrder;
      if (originalRow['Phase Name'] !== undefined) newRow.csv_phase_name = originalRow['Phase Name'];

      return newRow;
    });
    // --- End Data Transformation ---


    try {
      console.log("Starting import with sheet type:", sheetType);
      console.log("Transformed data (first 2 rows):", transformedRows.slice(0, 2));

      const validSheetType = ['phase_step', 'tool', 'mixed', 'unknown'].includes(sheetType)
          ? sheetType as 'phase_step' | 'tool' | 'mixed' | 'unknown'
          : 'unknown';

      if (validSheetType === 'unknown') {
          throw new Error("Import type could not be determined. Check mappings.");
      }

      await journeyContentService.importWithMapping(
        validSheetType,
        transformedRows,
        (progress) => setImportProgress(progress)
      );

      setImportStatus('success');

    } catch (error: any) {
      console.error("Import failed:", error);
      setErrorMessage(`Import failed: ${error.message}`);
      setImportStatus('error');
    } finally {
      setIsImporting(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
  });

  const selectedSheetData = selectedSheetIndex !== null ? sheets[selectedSheetIndex] : null;

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h2 className="text-xl font-semibold">Import Journey Content from Excel</h2>

      {/* 1. File Dropzone */}
      <div
        {...getRootProps()}
        className={`p-6 border-2 border-dashed rounded-md cursor-pointer text-center transition-colors
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        {file ? (
          <p>Selected file: {file.name}</p>
        ) : isDragActive ? (
          <p>Drop the Excel file here...</p>
        ) : (
          <p>Drag 'n' drop an Excel file here, or click to select</p>
        )}
      </div>

      {/* 2. Sheet Selector */}
      {sheets.length > 0 && (
        <div className="space-y-2">
          <label htmlFor="sheet-select" className="block text-sm font-medium text-gray-700">Select Sheet:</label>
          <select
            id="sheet-select"
            value={selectedSheetIndex ?? ''}
            onChange={(e) => handleSheetSelect(parseInt(e.target.value))}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="" disabled>-- Select a sheet --</option>
            {sheets.map((sheet, index) => (
              <option key={sheet.name} value={index}>{sheet.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* 3. Column Mapping Table */}
      {selectedSheetData && selectedSheetData.headers.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Column Mapping</h3>
          <p className="text-sm text-gray-600">Map Excel columns to database fields. Select 'Do Not Import' to ignore a column.</p>

          {/* Filter Input */}
          <div className="mb-2">
              <Label htmlFor="mapping-filter" className="text-sm font-medium text-gray-700 mr-2">Filter targets:</Label>
              <Input
                id="mapping-filter"
                type="text"
                placeholder="Type to filter..."
                value={mappingFilter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMappingFilter(e.target.value)}
                className="input input-bordered input-sm max-w-xs"
              />
          </div>

          <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Excel Column Header
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Map to Database Field (Table.Column)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedSheetData.headers.map((header, index) => (
                  <tr key={`map-row-${header}-${index}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{header}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select
                        value={columnMapping[header] || ''}
                        onChange={(e) => handleMappingChange(header, e.target.value || null)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="">-- Do Not Import --</option>
                        {/* Use the filtered list for dropdown options */}
                        {filteredDbColumns.map(dbCol => (
                            <option key={dbCol} value={dbCol}>{dbCol}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Data Preview Table - Temporarily Commented Out for Debugging */}
      {/* ... preview table code remains commented out ... */}


      {/* 5. Import Action & Status */}
      <div className="space-y-2">
        <Button
          onClick={handleImport}
          disabled={!file || selectedSheetIndex === null || isImporting}
        >
          {isImporting ? 'Importing...' : 'Start Import'}
        </Button>

        {isImporting && (
          <Progress value={importProgress} className="w-full" />
        )}

        {importStatus === 'success' && (
          <Alert variant="default" className="bg-green-100 border-green-300 text-green-800">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>Data imported successfully.</AlertDescription>
          </Alert>
        )}
        {importStatus === 'error' && errorMessage && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default ExcelImportMapper;
