import React from 'react';

interface DomainProgress {
  id: string;
  name: string;
  description?: string;
  totalSteps: number;
  completedSteps: number;
  activeSteps: number;
  maturityScore?: number;
  color?: string;
  icon?: string;
}

interface DomainProgressCardProps {
  domain: DomainProgress;
  onClick?: () => void;
  compact?: boolean;
}

/**
 * DomainProgressCard - Displays domain progress with completion metrics
 */
const DomainProgressCard: React.FC<DomainProgressCardProps> = ({
  domain,
  onClick,
  compact = false
}) => {
  // Calculate completion percentage
  const completionPercentage = Math.round((domain.completedSteps / domain.totalSteps) * 100);
  
  // Default domain color if not provided
  const domainColor = domain.color || 'indigo';
  
  // Map color to Tailwind classes
  const colorClasses = {
    indigo: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      progress: 'bg-indigo-600',
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-200',
      progress: 'bg-blue-600',
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
      progress: 'bg-green-600',
    },
    amber: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-200',
      progress: 'bg-amber-600',
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      border: 'border-orange-200',
      progress: 'bg-orange-600',
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
      progress: 'bg-red-600',
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-200',
      progress: 'bg-purple-600',
    },
    gray: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
      progress: 'bg-gray-600',
    }
  };
  
  // Get correct color set based on domain color
  const colorSet = colorClasses[domainColor as keyof typeof colorClasses] || colorClasses.indigo;

  return (
    <div 
      className={`rounded-lg border ${colorSet.border} hover:shadow-sm transition-all cursor-pointer p-3 bg-white`}
      onClick={onClick}
    >
      {/* Domain header */}
      <div className="flex items-center mb-2">
        <div className={`flex-shrink-0 h-8 w-8 rounded-full ${colorSet.bg} flex items-center justify-center mr-2`}>
          {domain.icon ? (
            <i className={`${domain.icon} ${colorSet.text}`}></i>
          ) : (
            <span className={`font-bold text-sm ${colorSet.text}`}>
              {domain.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <h3 className="font-medium text-gray-900">{domain.name}</h3>
      </div>

      {/* Domain description (non-compact mode only) */}
      {!compact && domain.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{domain.description}</p>
      )}

      {/* Progress bar */}
      <div className="mt-2 mb-1">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`${colorSet.progress} h-2 rounded-full`} 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Progress metrics */}
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600">{completionPercentage}% complete</span>
        <span className="text-gray-600">{domain.completedSteps}/{domain.totalSteps} steps</span>
      </div>

      {/* Domain stats (non-compact mode only) */}
      {!compact && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="text-center p-1 bg-gray-50 rounded">
            <div className="text-lg font-semibold text-gray-800">{domain.totalSteps}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center p-1 bg-blue-50 rounded">
            <div className="text-lg font-semibold text-blue-700">{domain.activeSteps}</div>
            <div className="text-xs text-blue-500">Active</div>
          </div>
          <div className="text-center p-1 bg-green-50 rounded">
            <div className="text-lg font-semibold text-green-700">{domain.completedSteps}</div>
            <div className="text-xs text-green-500">Done</div>
          </div>
        </div>
      )}

      {/* Maturity score (if provided) */}
      {domain.maturityScore !== undefined && (
        <div className="mt-3 flex justify-end">
          <div className={`px-2 py-1 rounded-full ${colorSet.bg} ${colorSet.text} text-xs font-medium`}>
            Maturity: {domain.maturityScore}/10
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainProgressCard;
