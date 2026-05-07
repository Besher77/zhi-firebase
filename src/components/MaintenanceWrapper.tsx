import { ReactNode, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import MaintenanceScreen from './MaintenanceScreen';

export default function MaintenanceWrapper({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
      if (doc.exists()) {
        setIsMaintenanceMode(doc.data()?.maintenanceMode === true);
      } else {
        setIsMaintenanceMode(false);
      }
      setSettingsLoading(false);
    }, (error) => {
      console.error("Error fetching maintenance setting:", error);
      setSettingsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-coffee-dark flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Allow admins to bypass maintenance mode
  if (isMaintenanceMode && (!user || user.role !== 'admin')) {
    return <MaintenanceScreen />;
  }

  return <>{children}</>;
}
