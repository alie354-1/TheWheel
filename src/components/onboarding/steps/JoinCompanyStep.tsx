import React, { useState } from 'react';

interface JoinCompanyStepProps {
  onJoin: (companyId: string, code?: string) => void;
  onCreateCompany: () => void;
  onSkip?: () => void;
  onBack?: () => void;
}

const JoinCompanyStep: React.FC<JoinCompanyStepProps> = ({
  onJoin,
  onCreateCompany,
  onSkip,
  onBack
}) => {
  const [joinMethod, setJoinMethod] = useState<'search' | 'code' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; logo?: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulated search function - in a real implementation, this would call an API
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setError('Please enter a company name');
      return;
    }

    setError(null);
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      if (searchQuery.toLowerCase().includes('wheel') || searchQuery.toLowerCase().includes('tech')) {
        setSearchResults([
          { id: 'company-1', name: 'Wheel Technologies', logo: 'https://via.placeholder.com/40' },
          { id: 'company-2', name: 'TechWheel Solutions', logo: 'https://via.placeholder.com/40' }
        ]);
      } else if (searchQuery.toLowerCase().includes('innovation')) {
        setSearchResults([
          { id: 'company-3', name: 'Innovation Labs', logo: 'https://via.placeholder.com/40' }
        ]);
      } else {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 800);
  };

  const handleJoinWithCode = () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    // In a real implementation, validate the code on the server
    if (inviteCode.length < 6) {
      setError('Invalid invite code format');
      return;
    }

    setError(null);
    onJoin('unknown', inviteCode);
  };

  const selectCompany = (companyId: string) => {
    onJoin(companyId);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Join Your Company</h2>
      <p className="text-center mb-6">Connect to your company or create a new one</p>
      
      {!joinMethod ? (
        <div className="space-y-4">
          <button
            onClick={() => setJoinMethod('search')}
            className="w-full border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-lg p-4 text-left transition-colors"
          >
            <div className="flex items-center">
              <span className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </span>
              <div>
                <h3 className="font-medium">Search for my company</h3>
                <p className="text-sm text-gray-600">Find your company by name</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setJoinMethod('code')}
            className="w-full border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-lg p-4 text-left transition-colors"
          >
            <div className="flex items-center">
              <span className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </span>
              <div>
                <h3 className="font-medium">I have an invite code</h3>
                <p className="text-sm text-gray-600">Join with a code from your company admin</p>
              </div>
            </div>
          </button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>
          
          <button
            onClick={onCreateCompany}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-4 text-center transition-colors"
          >
            Create a new company
          </button>
        </div>
      ) : joinMethod === 'search' ? (
        <div className="space-y-4">
          <div className="mb-4">
            <label htmlFor="companySearch" className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="companySearch"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter company name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          
          {searchResults.length > 0 ? (
            <div className="space-y-2">
              <h3 className="font-medium">Results</h3>
              <div className="border rounded-md divide-y">
                {searchResults.map(company => (
                  <div
                    key={company.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => selectCompany(company.id)}
                  >
                    <div className="flex items-center">
                      {company.logo ? (
                        <img src={company.logo} alt={company.name} className="h-10 w-10 rounded-md object-cover mr-3" />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-gray-500 font-medium">
                            {company.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="font-medium">{company.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : searchQuery && !isSearching ? (
            <div className="text-center py-6 text-gray-500">
              No companies found matching your search.
            </div>
          ) : null}
          
          <div className="mt-4">
            <button
              onClick={() => setJoinMethod(null)}
              className="text-indigo-600 hover:text-indigo-800"
            >
              ← Back to options
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
              Invitation Code
            </label>
            <input
              type="text"
              id="inviteCode"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter your invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            <p className="mt-2 text-sm text-gray-500">
              This is usually sent to you by email or provided by your company administrator.
            </p>
          </div>
          
          <button
            onClick={handleJoinWithCode}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-3 text-center transition-colors"
          >
            Join Company
          </button>
          
          <div className="mt-4">
            <button
              onClick={() => setJoinMethod(null)}
              className="text-indigo-600 hover:text-indigo-800"
            >
              ← Back to options
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-6 flex justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Back
          </button>
        )}
        
        {onSkip && (
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 transition-colors ml-auto"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

export default JoinCompanyStep;
