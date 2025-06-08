import React from 'react';
import { VerificationState } from '../../lib/types/community.types';

interface ExpertResponseBadgeProps {
  expertiseArea: string;
  confidenceScore: number;
  verificationStatus: VerificationState;
  verifiedBy?: string;
  verifiedAt?: string;
}

/**
 * ExpertResponseBadge Component
 * 
 * A badge that displays information about an expert response, including
 * the expertise area, confidence score, and verification status.
 */
const ExpertResponseBadge: React.FC<ExpertResponseBadgeProps> = ({
  expertiseArea,
  confidenceScore,
  verificationStatus,
  verifiedBy,
  verifiedAt
}) => {
  // Get background color based on verification status
  const getBgColor = () => {
    switch (verificationStatus) {
      case 'verified':
        return 'bg-green-50 border-green-200';
      case 'disputed':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'self_reported':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };
  
  // Get text color based on verification status
  const getTextColor = () => {
    switch (verificationStatus) {
      case 'verified':
        return 'text-green-700';
      case 'disputed':
        return 'text-red-700';
      case 'pending':
        return 'text-yellow-700';
      case 'self_reported':
      default:
        return 'text-blue-700';
    }
  };
  
  // Get icon based on verification status
  const getIcon = () => {
    switch (verificationStatus) {
      case 'verified':
        return (
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'disputed':
        return (
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'self_reported':
      default:
        return (
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
          </svg>
        );
    }
  };
  
  // Get verification status display text
  const getStatusText = () => {
    switch (verificationStatus) {
      case 'verified':
        return 'Verified';
      case 'disputed':
        return 'Disputed';
      case 'pending':
        return 'Pending Verification';
      case 'self_reported':
        return 'Self-Reported';
      default:
        return 'Expert Response';
    }
  };
  
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-md border ${getBgColor()}`}>
      <div className={`flex items-center ${getTextColor()}`}>
        {getIcon()}
        <span className="font-medium text-sm">Expert Response</span>
      </div>
      
      <div className="mx-2 h-4 border-l border-gray-300"></div>
      
      <div className="text-xs">
        <span className="font-medium">{expertiseArea}</span>
        <span className="mx-1">•</span>
        <span>{confidenceScore}% confidence</span>
        <span className="mx-1">•</span>
        <span>{getStatusText()}</span>
        
        {verificationStatus === 'verified' && verifiedAt && (
          <div className="text-xs text-gray-500 mt-0.5">
            Verified on {new Date(verifiedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertResponseBadge;
