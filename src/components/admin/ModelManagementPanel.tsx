import React, { useState, useEffect } from 'react';
import { modelManager } from '../../lib/services/model-manager.service';
import { supabase } from '../../lib/supabase';

interface Company {
  id: string;
  name: string;
  modelStatus?: {
    exists: boolean;
    lastUpdated: string | null;
    embeddingsCount: number;
  };
}

interface TrainingLog {
  id: string;
  company_id: string;
  status: string;
  message: string;
  duration_ms: number;
  created_at: string;
  companies: {
    name: string;
  };
}

interface QueryLog {
  id: string;
  user_id: string;
  company_id: string | null;
  query_text: string;
  response_length: number;
  duration_ms: number;
  created_at: string;
  profiles: {
    full_name: string;
  };
  companies?: {
    name: string;
  };
}

const ModelManagementPanel: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>([]);
  const [queryLogs, setQueryLogs] = useState<QueryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'models' | 'logs' | 'test'>('models');
  const [testQuery, setTestQuery] = useState('');
  const [testCompanyId, setTestCompanyId] = useState('');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Fetch companies
      const { data: companiesData } = await supabase
        .from('companies')
        .select('id, name');
      
      if (companiesData) {
        // Get model status for each company
        const companiesWithStatus = await Promise.all(
          companiesData.map(async (company) => {
            const modelStatus = await modelManager.getCompanyModelStatus(company.id);
            return {
              ...company,
              modelStatus
            };
          })
        );
        
        setCompanies(companiesWithStatus);
      }
      
      // Fetch system status
      const status = await modelManager.checkSystemStatus();
      setSystemStatus(status);
      
      // Fetch logs
      const trainingLogs = await modelManager.getTrainingLogs();
      setTrainingLogs(trainingLogs);
      
      const queryLogs = await modelManager.getQueryLogs();
      setQueryLogs(queryLogs);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error fetching data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTrainModel = async (companyId: string) => {
    setLoading(true);
    setMessage('');
    
    try {
      const result = await modelManager.trainCompanyModel(companyId);
      setMessage(result.message);
      
      // Refresh data
      await fetchData();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateAbstraction = async () => {
    if (selectedCompanies.length === 0) {
      setMessage('Please select at least one company');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      const result = await modelManager.generateAbstraction(selectedCompanies);
      setMessage(result.success ? 'Abstraction generated successfully' : result.message || 'Error generating abstraction');
      
      // Refresh data
      await fetchData();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCompanySelection = (companyId: string) => {
    setSelectedCompanies(prev => 
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };
  
  const handleTestQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testQuery) {
      setMessage('Please enter a query');
      return;
    }
    
    setTestLoading(true);
    setTestResponse(null);
    
    try {
      const result = await modelManager.query(testQuery, {
        userId: (await supabase.auth.getUser()).data.user?.id || '',
        companyId: testCompanyId || undefined,
        useExistingModels: true
      });
      
      setTestResponse(result);
      
      // Refresh logs
      const queryLogs = await modelManager.getQueryLogs();
      setQueryLogs(queryLogs);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setTestLoading(false);
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Hierarchical LLM System</h2>
      
      {/* System Status */}
      {systemStatus && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">System Status</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-gray-500">Company Models</p>
              <p className="text-lg font-medium">{systemStatus.companyModelsCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Abstractions</p>
              <p className="text-lg font-medium">{systemStatus.abstractionsCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Queries</p>
              <p className="text-lg font-medium">{systemStatus.totalQueries}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Queries Today</p>
              <p className="text-lg font-medium">{systemStatus.queriesToday}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Query Time</p>
              <p className="text-lg font-medium">{systemStatus.avgQueryTime.toFixed(2)} ms</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="text-lg font-medium">
                {systemStatus.lastUpdated 
                  ? new Date(systemStatus.lastUpdated).toLocaleString() 
                  : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className={`text-lg font-medium ${systemStatus.isOperational ? 'text-green-600' : 'text-red-600'}`}>
                {systemStatus.isOperational ? 'Operational' : 'Error'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('models')}
            className={`${
              activeTab === 'models'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Models
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`${
              activeTab === 'logs'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Logs
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`${
              activeTab === 'test'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Test
          </button>
        </nav>
      </div>
      
      {/* Models Tab */}
      {activeTab === 'models' && (
        <>
          {/* Company Models */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Company Models</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Embeddings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {companies.map(company => (
                    <tr key={company.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedCompanies.includes(company.id)}
                          onChange={() => handleCompanySelection(company.id)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          company.modelStatus?.exists
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {company.modelStatus?.exists ? 'Trained' : 'Not Trained'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {company.modelStatus?.lastUpdated
                          ? new Date(company.modelStatus.lastUpdated).toLocaleString()
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {company.modelStatus?.embeddingsCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleTrainModel(company.id)}
                          disabled={loading}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
                        >
                          {loading ? 'Processing...' : 'Train Model'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Abstraction Generation */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Generate Abstraction</h3>
            <p className="text-sm text-gray-500 mb-4">
              Select companies above and click the button below to generate an abstraction.
              Abstractions combine insights from multiple company models to identify patterns.
            </p>
            <button
              onClick={handleGenerateAbstraction}
              disabled={loading || selectedCompanies.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Generate Abstraction'}
            </button>
          </div>
        </>
      )}
      
      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <>
          {/* Training Logs */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Training Logs</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trainingLogs.map(log => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{log.companies.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.message}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.duration_ms} ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {trainingLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No training logs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Query Logs */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Query Logs</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Query
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response Length
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {queryLogs.map(log => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{log.profiles.full_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.companies?.name || 'General'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {log.query_text}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.response_length} chars
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.duration_ms} ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {queryLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No query logs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      
      {/* Test Tab */}
      {activeTab === 'test' && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Test Hierarchical LLM</h3>
          <p className="text-sm text-gray-500 mb-4">
            Test the hierarchical LLM system by sending a query. You can optionally specify a company
            to use company-specific context.
          </p>
          
          <form onSubmit={handleTestQuery} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company (Optional)</label>
              <select
                value={testCompanyId}
                onChange={(e) => setTestCompanyId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">General LLM (No Company)</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name} {company.modelStatus?.exists ? '(Trained)' : '(Not Trained)'}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Query</label>
              <textarea
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your query here..."
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={testLoading || !testQuery}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {testLoading ? 'Processing...' : 'Send Query'}
              </button>
            </div>
          </form>
          
          {testResponse && (
            <div className="mt-6">
              <h4 className="text-md font-medium mb-2">Response</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                {testResponse.success ? (
                  <div className="prose max-w-none">
                    <p>{testResponse.data.content}</p>
                  </div>
                ) : (
                  <p className="text-red-600">{testResponse.message}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-md ${message.includes('successfully') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}
      
      {/* Refresh Button */}
      <div className="mt-4">
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
    </div>
  );
};

export default ModelManagementPanel;
