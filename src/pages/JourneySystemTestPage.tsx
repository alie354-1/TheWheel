/**
 * Journey System Integration Test Page
 * 
 * Tests the enhanced journey system services and database integration.
 */

import React, { useEffect, useState } from 'react';
import { newJourneyFrameworkService } from '../lib/services/new_journey/new_journey_framework.service';
import { newCompanyJourneyService } from '../lib/services/new_journey/new_company_journey.service';
import { newJourneyFeaturesService } from '../lib/services/new_journey/new_journey_features.service';
import { verifyJourneySystem } from '../utils/verifyJourneySchema';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
}

const JourneySystemTestPage: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const testResults: TestResult[] = [];

    // Test 1: Schema verification
    try {
      console.log('🧪 Running schema verification...');
      await verifyJourneySystem();
      testResults.push({
        name: 'Database Schema Verification',
        status: 'success',
        message: 'Schema verification completed. Check console for details.'
      });
    } catch (error) {
      testResults.push({
        name: 'Database Schema Verification',
        status: 'error',
        message: `Schema verification failed: ${error}`
      });
    }

    // Test 2: Framework service
    try {
      const phases = await newJourneyFrameworkService.getPhases();
      testResults.push({
        name: 'Framework Service - Get Phases',
        status: 'success',
        message: `Successfully retrieved ${phases.length} phases`,
        data: phases
      });
    } catch (error) {
      testResults.push({
        name: 'Framework Service - Get Phases',
        status: 'error',
        message: `Error: ${error}`
      });
    }

    // Test 3: Framework domains
    try {
      const domains = await newJourneyFrameworkService.getDomains();
      testResults.push({
        name: 'Framework Service - Get Domains',
        status: 'success',
        message: `Successfully retrieved ${domains.length} domains`,
        data: domains
      });
    } catch (error) {
      testResults.push({
        name: 'Framework Service - Get Domains',
        status: 'error',
        message: `Error: ${error}`
      });
    }

    // Test 4: Framework canonical steps
    try {
      const canonicalSteps = await newJourneyFrameworkService.getFrameworkSteps();
      testResults.push({
        name: 'Framework Service - Get Canonical Steps',
        status: 'success',
        message: `Successfully retrieved ${canonicalSteps.length} canonical steps`,
        data: canonicalSteps.slice(0, 3) // Show first 3 for preview
      });
    } catch (error) {
      testResults.push({
        name: 'Framework Service - Get Canonical Steps',
        status: 'error',
        message: `Error: ${error}`
      });
    }

    // Test 5: Company Journey Service (with dummy company ID)
    try {
      const testCompanyId = 'test-company-id';
      const companyJourney = await newCompanyJourneyService.getOrCreateCompanyJourney(testCompanyId);
      const companySteps = await newCompanyJourneyService.getCompanySteps(companyJourney.id);
      testResults.push({
        name: 'Company Journey Service - Get Company Steps',
        status: 'success',
        message: `Successfully retrieved ${companySteps.length} company steps for test company`,
        data: companySteps.slice(0, 3)
      });
    } catch (error) {
      testResults.push({
        name: 'Company Journey Service - Get Company Steps',
        status: 'error',
        message: `Error: ${error}`
      });
    }

    // Test 6: Journey Progress Service
    try {
      const testCompanyId = 'test-company-id';
      const companyJourney = await newCompanyJourneyService.getOrCreateCompanyJourney(testCompanyId);
      const progressData = await newJourneyFeaturesService.getProgressByDomain(companyJourney.id);
      testResults.push({
        name: 'Journey Progress Service - Get Progress By Domain',
        status: 'success',
        message: `Successfully retrieved progress data for ${progressData.length} domains`,
        data: progressData
      });
    } catch (error) {
      testResults.push({
        name: 'Journey Progress Service - Get Progress Analytics',
        status: 'error',
        message: `Error: ${error}`
      });
    }

    setTests(testResults);
    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Journey System Integration Test</h1>
        <p className="text-gray-600 mb-4">
          Testing the enhanced journey system services and database integration.
        </p>
        <button
          onClick={runTests}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isRunning ? 'Running Tests...' : 'Run Tests Again'}
        </button>
      </div>

      <div className="space-y-4">
        {tests.map((test, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              test.status === 'success'
                ? 'bg-green-50 border-green-200'
                : test.status === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{test.name}</h3>
              <span
                className={`px-2 py-1 rounded text-sm font-medium ${
                  test.status === 'success'
                    ? 'bg-green-100 text-green-800'
                    : test.status === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {test.status.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-700 mb-2">{test.message}</p>
            {test.data && (
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                  View Data
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                  {JSON.stringify(test.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {!isRunning && tests.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No tests run yet. Click "Run Tests" to start.</p>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Console Output</h3>
        <p className="text-sm text-gray-600">
          Additional test details and schema verification results are logged to the browser console.
          Open the developer tools to view detailed output.
        </p>
      </div>
    </div>
  );
};

export default JourneySystemTestPage;
