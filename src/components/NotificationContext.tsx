'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface NotificationContextType {
  hasActiveNotifications: boolean;
  setHasActiveNotifications: (hasActive: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [hasActiveNotifications, setHasActiveNotifications] = useState(false);

  return (
    <NotificationContext.Provider value={{ hasActiveNotifications, setHasActiveNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 