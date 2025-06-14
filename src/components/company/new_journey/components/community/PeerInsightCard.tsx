import React from 'react';

export interface PeerInsight {
  id: string;
  avatarUrl?: string;
  companyName?: string;
  companyStage?: string;
  companySize?: string;
  industry?: string;
  insight?: string;
  content?: string;
  author?: {
    name: string;
    role?: string;
    initials?: string;
  } | string;
  date?: string;
  timestamp?: string; // Alternative name for date
  likes?: number;
  comments?: number;
  domain?: string;
}

export interface PeerInsightCardProps {
  id?: string;
  avatarUrl?: string;
  companyName?: string;
  companyStage?: string;
  companySize?: string;
  industry?: string;
  insight?: string;
  author?: PeerInsight['author'];
  date?: string;
  likes?: number;
  comments?: number;
  onLike?: () => void;
  onComment?: () => void;
  onView?: (id: string) => void;
  onClick?: () => void;
  insightObj?: PeerInsight; // Allow passing the entire insight object
}

/**
 * PeerInsightCard - Shows an insight shared by a peer company
 */
const PeerInsightCard: React.FC<PeerInsightCardProps> = (props) => {
  // Handle both direct props and insight object
  const insightObj = props.insightObj || {} as Partial<PeerInsight>;
  
  // Extract all properties with fallbacks
  const id = props.id || insightObj.id || '';
  const avatarUrl = props.avatarUrl || insightObj.avatarUrl;
  const companyName = props.companyName || insightObj.companyName || '';
  const companyStage = props.companyStage || insightObj.companyStage;
  const companySize = props.companySize || insightObj.companySize;
  const industry = props.industry || insightObj.industry || insightObj.domain;
  const insight = props.insight || insightObj.insight || insightObj.content || '';
  const date = props.date || insightObj.date || insightObj.timestamp || '';
  const likes = props.likes || insightObj.likes || 0;
  const comments = props.comments || insightObj.comments || 0;
  const onLike = props.onLike;
  const onComment = props.onComment;
  const onView = props.onView;
  const onClick = props.onClick;
  
  // Handle author which can be a string or object
  const author = props.author || insightObj.author;
  const displayName = typeof author === 'string' ? author : (author?.name || companyName);
  
  // Default avatar if no avatarUrl is provided
  const defaultAvatar = (
    <div className="w-10 h-10 bg-indigo-100 flex items-center justify-center rounded-full flex-shrink-0">
      <span className="text-indigo-600 font-medium">
        {typeof author === 'object' && author?.initials ? 
          author.initials : 
          (displayName || '').substring(0, 2).toUpperCase()}
      </span>
    </div>
  );
  
  // Truncate insight if it's too long
  const truncateInsight = (text: string, maxLength: number = 160) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  return (
    <div 
      className="bg-white shadow-sm rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-colors mb-3 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start">
        {/* Avatar or Default */}
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={companyName} 
            className="w-10 h-10 rounded-full mr-3 flex-shrink-0 object-cover"
          />
        ) : (
          <div className="mr-3">{defaultAvatar}</div>
        )}
        
        {/* Content */}
        <div className="flex-grow">
          <div className="flex flex-wrap items-center gap-1">
            <h3 className="text-sm font-medium text-gray-900">{displayName}</h3>
            
            {/* Company metadata tags */}
            <div className="flex flex-wrap gap-1">
              {companyStage && (
                <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                  {companyStage}
                </span>
              )}
              {companySize && (
                <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                  {companySize}
                </span>
              )}
              {industry && (
                <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                  {industry}
                </span>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-1">{truncateInsight(insight)}</p>
          
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-500">{date}</span>
            
            <div className="flex items-center space-x-4">
              {/* Like button */}
              <button 
                className="text-xs text-gray-500 flex items-center hover:text-indigo-600"
                onClick={onLike}
              >
                <i className="far fa-thumbs-up mr-1"></i>
                {likes > 0 && <span>{likes}</span>}
              </button>
              
              {/* Comment button */}
              <button 
                className="text-xs text-gray-500 flex items-center hover:text-indigo-600"
                onClick={onComment}
              >
                <i className="far fa-comment mr-1"></i>
                {comments > 0 && <span>{comments}</span>}
              </button>
              
              {/* View button */}
              <button 
                className="text-xs text-indigo-600 hover:text-indigo-800"
                onClick={() => onView && onView(id)}
              >
                View Insight
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeerInsightCard;
