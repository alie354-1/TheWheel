import React, { useState, useEffect } from 'react';
import { journeyFrameworkService, TemplateUpdateNotification } from '../../../../lib/services/journeyFramework.service';

interface TemplateUpdateNotificationsProps {
  companyId: string;
  onNotificationClick?: (notification: TemplateUpdateNotification) => void;
}

const TemplateUpdateNotifications: React.FC<TemplateUpdateNotificationsProps> = ({
  companyId,
  onNotificationClick
}) => {
  const [notifications, setNotifications] = useState<TemplateUpdateNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [companyId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await journeyFrameworkService.getTemplateUpdateNotifications(companyId);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await journeyFrameworkService.markNotificationRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: TemplateUpdateNotification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    onNotificationClick?.(notification);
  };

  const getNotificationIcon = (updateType: string) => {
    switch (updateType) {
      case 'new_version':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
        );
      case 'content_change':
        return (
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case 'deprecation':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getPriorityColor = (actionRequired: boolean, isRead: boolean) => {
    if (actionRequired && !isRead) return 'border-l-red-500';
    if (!isRead) return 'border-l-blue-500';
    return 'border-l-gray-300';
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const displayNotifications = showAll ? notifications : notifications.slice(0, 5);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Updates</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6h6V7l4-4H4v16z" />
            </svg>
          </div>
          <p className="text-gray-500">No template updates available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Template Updates</h3>
          {unreadNotifications.length > 0 && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              {unreadNotifications.length} new
            </span>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {displayNotifications.map(notification => (
          <div
            key={notification.id}
            className={`border-l-4 ${getPriorityColor(notification.actionRequired, notification.isRead)} bg-white hover:bg-gray-50 cursor-pointer transition-colors`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="p-4">
              <div className="flex items-start space-x-3">
                {getNotificationIcon(notification.updateType)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                      {notification.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {notification.actionRequired && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                          Action Required
                        </span>
                      )}
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-600'}`}>
                    {notification.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notifications.length > 5 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAll ? 'Show Less' : `Show All ${notifications.length} Notifications`}
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplateUpdateNotifications;
