import React from 'react';

interface ReviewerAvatarProps {
  displayName?: string | null;
  avatarUrl?: string | null; // For future use if avatars are implemented
  size?: number;
  style?: React.CSSProperties;
}

export const ReviewerAvatar: React.FC<ReviewerAvatarProps> = ({
  displayName,
  avatarUrl,
  size = 32,
  style,
}) => {
  const avatarStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    backgroundColor: '#cccccc', // Default placeholder color
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: `${Math.max(10, size * 0.4)}px`, // Adjust font size based on avatar size
    overflow: 'hidden',
    ...style,
  };

  const getInitials = (name?: string | null): string => {
    if (!name) return 'A'; // Anonymous
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName || 'Reviewer'}
        style={avatarStyle}
      />
    );
  }

  return (
    <div style={avatarStyle} title={displayName || 'Anonymous Reviewer'}>
      {getInitials(displayName)}
    </div>
  );
};
