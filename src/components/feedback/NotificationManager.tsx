import React from 'react';
import { useNotification } from '../../lib/hooks/useNotification';
import { Notification, NotificationPosition } from '../../lib/services/notification';

// Helper function to generate CSS class based on position
const getPositionClass = (position: NotificationPosition): string => {
  switch (position) {
    case 'top-right':
      return 'top-4 right-4';
    case 'top-left':
      return 'top-4 left-4';
    case 'bottom-right':
      return 'bottom-4 right-4';
    case 'bottom-left':
      return 'bottom-4 left-4';
    case 'top-center':
      return 'top-4 left-1/2 transform -translate-x-1/2';
    case 'bottom-center':
      return 'bottom-4 left-1/2 transform -translate-x-1/2';
    default:
      return 'top-4 right-4';
  }
};

// Helper function to get type-based styling
const getTypeStyles = (type: Notification['type']): { bgColor: string; iconColor: string } => {
  switch (type) {
    case 'success':
      return { 
        bgColor: 'bg-green-50 border-green-500', 
        iconColor: 'text-green-500' 
      };
    case 'error':
      return { 
        bgColor: 'bg-red-50 border-red-500', 
        iconColor: 'text-red-500' 
      };
    case 'warning':
      return { 
        bgColor: 'bg-yellow-50 border-yellow-500', 
        iconColor: 'text-yellow-500' 
      };
    case 'info':
    default:
      return { 
        bgColor: 'bg-blue-50 border-blue-500', 
        iconColor: 'text-blue-500' 
      };
  }
};

// Type icon component
const TypeIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
  const { iconColor } = getTypeStyles(type);
  
  switch (type) {
    case 'success':
      return (
        <svg className={`h-5 w-5 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'error':
      return (
        <svg className={`h-5 w-5 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'warning':
      return (
        <svg className={`h-5 w-5 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'info':
    default:
      return (
        <svg className={`h-5 w-5 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

// Individual notification component
const NotificationItem: React.FC<{
  notification: Notification;
  onDismiss: (id: string) => void;
}> = ({ notification, onDismiss }) => {
  const { id, type, title, message, dismissible, actionText, actionFn } = notification;
  const { bgColor } = getTypeStyles(type);
  
  return (
    <div 
      className={`max-w-sm w-full rounded-lg border-l-4 shadow-md overflow-hidden mb-3 ${bgColor}`}
      style={{ minWidth: '300px' }}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <TypeIcon type={type} />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            {title && (
              <p className="text-sm font-medium text-gray-900">{title}</p>
            )}
            <p className="text-sm text-gray-700">{message}</p>
            
            {actionText && actionFn && (
              <div className="mt-3">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700 transition ease-in-out duration-150"
                  onClick={() => {
                    actionFn();
                    onDismiss(id);
                  }}
                >
                  {actionText}
                </button>
              </div>
            )}
          </div>
          {dismissible && (
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
                onClick={() => onDismiss(id)}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

type NotificationManagerProps = {
  // Optional props can be added here
  className?: string;
};

export const NotificationManager: React.FC<NotificationManagerProps> = ({ className = '' }) => {
  const { notifications, dismiss } = useNotification();
  
  // Group notifications by position
  const groupedNotifications = notifications.reduce<Record<NotificationPosition, Notification[]>>
    ((acc, notification) => {
      const position = notification.position || 'top-right';
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(notification);
      return acc;
    }, {} as Record<NotificationPosition, Notification[]>);
  
  // If no notifications, don't render anything
  if (notifications.length === 0) return null;
  
  return (
    <>
      {Object.entries(groupedNotifications).map(([position, positionNotifications]) => (
        <div 
          key={position}
          className={`fixed z-50 ${getPositionClass(position as NotificationPosition)} ${className}`}
        >
          {positionNotifications.map(notification => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
              onDismiss={dismiss}
            />
          ))}
        </div>
      ))}
    </>
  );
};

export default NotificationManager;