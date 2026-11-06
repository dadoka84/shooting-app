import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppColors } from '@/constants/theme';
import * as SQLite from 'expo-sqlite';
import { DB_NAME, runMigrations } from '@/lib/db/migrations';

type DatabaseContextValue = {
  db: SQLite.SQLiteDatabase;
  ready: boolean;
  refreshKey: number;
  bumpRefresh: () => void;
};

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [ready, setReady] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const database = await SQLite.openDatabaseAsync(DB_NAME);
      await runMigrations(database);
      if (cancelled) {
        return;
      }
      setDb(database);
      setReady(true);
    })().catch((err) => {
      console.error('Database init failed', err);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const bumpRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const value = useMemo(() => {
    if (!db) {
      return null;
    }
    return { db, ready, refreshKey, bumpRefresh };
  }, [db, ready, refreshKey, bumpRefresh]);

  if (!value) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}

export function useDatabase(): DatabaseContextValue {
  const ctx = useContext(DatabaseContext);
  if (!ctx) {
    throw new Error('useDatabase must be used within DatabaseProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.background,
  },
});
