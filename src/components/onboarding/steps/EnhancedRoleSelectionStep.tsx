import React, { useState } from 'react';
import { UserRoleType } from '../../../lib/types/enhanced-profile.types';

interface EnhancedRoleSelectionStepProps {
  onNext: (data: { primaryRole: UserRoleType; additionalRoles?: UserRoleType[] }) => void;
  onBack: () => void;
  initialValue?: UserRoleType;
  initialAdditionalRoles?: UserRoleType[];
}

export const EnhancedRoleSelectionStep: React.FC<EnhancedRoleSelectionStepProps> = ({
  onNext,
  onBack,
  initialValue,
  initialAdditionalRoles = []
}) => {
  const [primaryRole, setPrimaryRole] = useState<UserRoleType | null>(initialValue || null);
  const [additionalRoles, setAdditionalRoles] = useState<UserRoleType[]>(initialAdditionalRoles);
  const [loading, setLoading] = useState(false);

  const roleOptions = [
    {
      id: 'founder' as UserRoleType,
      title: 'Founder',
      description: 'I have a business idea or have already founded a company',
      icon: 'lightbulb'
    },
    {
      id: 'company_member' as UserRoleType,
      title: 'Company Member',
      description: 'I work at a company and want to join my team',
      icon: 'users'
    },
    {
      id: 'service_provider' as UserRoleType,
      title: 'Service Provider',
      description: 'I provide professional services to companies',
      icon: 'briefcase'
    }
  ];

  const handleToggleAdditionalRole = (role: UserRoleType) => {
    // Can't add primary role as additional role
    if (role === primaryRole) return;
    
    if (additionalRoles.includes(role)) {
      setAdditionalRoles(additionalRoles.filter(r => r !== role));
    } else {
      setAdditionalRoles([...additionalRoles, role]);
    }
  };

  const handleContinue = () => {
    if (!primaryRole) return;
    
    setLoading(true);
    
    // Send to parent component to handle navigation
    onNext({
      primaryRole,
      additionalRoles: additionalRoles.length > 0 ? additionalRoles : undefined
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">What's your primary role?</h2>
      <p className="text-gray-600 mb-8">
        Select your primary role at Wheel99. This helps us personalize your experience.
      </p>
      
      <div className="space-y-6 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {roleOptions.map((role) => (
            <div
              key={role.id}
              onClick={() => setPrimaryRole(role.id)}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                primaryRole === role.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow'
              }`}
            >
              <div className="flex items-center mb-2">
                <div className={`rounded-full p-2 mr-2 ${
                  primaryRole === role.id ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}>
                  <i className={`fas fa-${role.icon} text-sm`}></i>
                </div>
                <h4 className="font-medium">{role.title}</h4>
              </div>
              <p className="text-sm text-gray-600">{role.description}</p>
            </div>
          ))}
        </div>

        {primaryRole && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-md font-semibold mb-2">Do you have additional roles? (Optional)</h3>
            <p className="text-sm text-gray-600 mb-4">
              You can select multiple roles if you fulfill different functions.
            </p>
            
            <div className="flex flex-wrap gap-3 mt-2">
              {roleOptions
                .filter(role => role.id !== primaryRole)
                .map(role => (
                  <div
                    key={role.id}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer ${
                      additionalRoles.includes(role.id)
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                    onClick={() => handleToggleAdditionalRole(role.id)}
                  >
                    <i className={`fas fa-${role.icon} mr-2 text-xs`}></i>
                    {role.title}
                    {additionalRoles.includes(role.id) && (
                      <i className="fas fa-check ml-2 text-xs"></i>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-12">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={loading}
        >
          Back
        </button>
        
        <button
          onClick={handleContinue}
          disabled={!primaryRole || loading}
          className={`px-6 py-2 rounded-md ${
            primaryRole && !loading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <i className="fas fa-spinner fa-spin mr-2"></i> Processing...
            </span>
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </div>
  );
};
