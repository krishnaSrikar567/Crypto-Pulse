import React, { createContext, useContext, useState } from 'react';
import { Bell, CheckCircle, X } from 'lucide-react';

// Create the context
export const NotificationContext = createContext();

// Provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const addNotification = (notification) => {
    setNotifications(prev => [...prev, notification]);
  };

  const value = {
    notifications,
    addNotification,
    removeNotification
  };

  console.log('NotificationProvider value:', value);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm pointer-events-auto notification-container">
        {notifications.length > 0 && (
          <div className="flex justify-end mb-2">
            <button
              onClick={clearAll}
              className="px-3 py-1 text-xs bg-red-500/30 border border-red-500/50 text-red-200 rounded hover:bg-red-500/50 transition-colors cursor-pointer"
              title="Clear all notifications"
            >
              Clear All ({notifications.length})
            </button>
          </div>
        )}
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification-item p-4 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 transform pointer-events-auto ${
              notification.type === 'success'
                ? 'bg-green-500/20 border-green-500/30 text-green-100'
                : notification.type === 'error'
                ? 'bg-red-500/20 border-red-500/30 text-red-100'
                : 'bg-blue-500/20 border-blue-500/30 text-blue-100'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {notification.icon && <notification.icon className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{notification.title}</h4>
                <p className="text-sm opacity-90 mt-1">{notification.message}</p>
                <div className="mt-3 flex items-center gap-2">
                  {notification.primaryActionLabel && (
                    <button
                      className="text-xs px-3 py-1 rounded bg-white/20 hover:bg-white/30 border border-white/30"
                      onClick={() => {
                        if (typeof notification.onPrimaryAction === 'function') {
                          notification.onPrimaryAction();
                        }
                        removeNotification(notification.id);
                      }}
                    >
                      {notification.primaryActionLabel}
                    </button>
                  )}
                  {notification.secondaryActionLabel && (
                    <button
                      className="text-xs px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 border border-red-400/30"
                      onClick={async () => {
                        try {
                          if (typeof notification.onSecondaryAction === 'function') {
                            await notification.onSecondaryAction();
                          }
                        } finally {
                          removeNotification(notification.id);
                        }
                      }}
                    >
                      {notification.secondaryActionLabel}
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeNotification(notification.id);
                }}
                onMouseDown={(e) => {
                  // Mouse down event for debugging
                }}
                className="flex-shrink-0 p-2 hover:bg-white/30 rounded-full transition-all duration-200 cursor-pointer z-10 relative border border-white/20 hover:border-white/40 bg-white/10 hover:bg-white/20"
                title="Close notification"
                type="button"
                style={{ minWidth: '32px', minHeight: '32px' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
