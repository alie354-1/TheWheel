import React, { useState, useEffect } from 'react';
import { DeckService } from '../services/deckService';
import { 
  X, 
  Copy, 
  Check, 
  Globe, 
  Lock, 
  Share2, 
  Eye,
  BarChart3,
  Users,
  Calendar
} from 'lucide-react';

interface SharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckId: string;
  deckTitle: string;
  isOwner?: boolean;
}

export function SharingModal({ isOpen, onClose, deckId, deckTitle, isOwner = true }: SharingModalProps) {
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const shareUrl = shareToken ? `${window.location.origin}/shared/${shareToken}` : '';

  useEffect(() => {
    if (isOpen && isOwner) {
      loadAnalytics();
    }
  }, [isOpen, deckId, isOwner]);

  const loadAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const data = await DeckService.getAnalytics(deckId);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const generateShareLink = async () => {
    if (!isOwner) return;
    
    try {
      setLoading(true);
      const token = await DeckService.generateShareToken(deckId);
      setShareToken(token);
      setIsPublic(true);
    } catch (error) {
      console.error('Failed to generate share link:', error);
      alert('Failed to generate share link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const revokeAccess = async () => {
    if (!isOwner) return;

    try {
      setLoading(true);
      await DeckService.revokeShareToken(deckId);
      setShareToken(null);
      setIsPublic(false);
    } catch (error) {
      console.error('Failed to revoke access:', error);
      alert('Failed to revoke access. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Share Presentation</h2>
            <p className="text-sm text-gray-500 mt-1 truncate">{deckTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isOwner ? (
            <>
              {/* Sharing Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isPublic ? (
                      <Globe className="h-5 w-5 text-green-600" />
                    ) : (
                      <Lock className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {isPublic ? 'Public Access' : 'Private'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {isPublic 
                          ? 'Anyone with the link can view' 
                          : 'Only you can access this presentation'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {isPublic ? (
                    <button
                      onClick={revokeAccess}
                      disabled={loading}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      Revoke
                    </button>
                  ) : (
                    <button
                      onClick={generateShareLink}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                  )}
                </div>

                {/* Share Link */}
                {shareUrl && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1">Share Link</p>
                        <p className="text-sm text-gray-600 truncate">{shareUrl}</p>
                      </div>
                      <button
                        onClick={copyToClipboard}
                        className="ml-3 p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        title="Copy link"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {copied && (
                      <p className="text-xs text-green-600 mt-1">Link copied to clipboard!</p>
                    )}
                  </div>
                )}
              </div>

              {/* Analytics */}
              {isPublic && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Viewing Analytics
                  </h3>
                  
                  {loadingAnalytics ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : analytics ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Eye className="h-5 w-5 text-blue-600 mr-2" />
                          <div>
                            <p className="text-2xl font-bold text-blue-900">{analytics.totalViews}</p>
                            <p className="text-sm text-blue-600">Total Views</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-green-600 mr-2" />
                          <div>
                            <p className="text-2xl font-bold text-green-900">{analytics.uniqueViewers}</p>
                            <p className="text-sm text-green-600">Unique Viewers</p>
                          </div>
                        </div>
                      </div>
                      
                      {analytics.avgSessionDuration > 0 && (
                        <div className="bg-purple-50 rounded-lg p-4 col-span-2">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                            <div>
                              <p className="text-lg font-bold text-purple-900">
                                {Math.round(analytics.avgSessionDuration / 60)} min
                              </p>
                              <p className="text-sm text-purple-600">Average Session Duration</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No analytics data available yet</p>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Read-only view for non-owners */
            <div className="text-center py-8">
              <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Shared Presentation</h3>
              <p className="text-gray-500">
                You're viewing a shared presentation. Only the owner can modify sharing settings.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t rounded-b-lg">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
