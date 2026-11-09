/**
 * useAdminSettings — loads the full settings document (GET /api/admin/settings)
 * and saves partial updates (PUT /api/settings). Used by Profile, Contact & Social,
 * Resume, Sections and SEO pages.
 */
import { useCallback, useEffect, useState } from 'react';
import { settingsApi } from '../../services/adminApi';
import { getErrorMessage } from '../../lib/apiClient';

export const useAdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setSettings(await settingsApi.get());
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load settings'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  /** Sends only the changed part; resolves to the full updated settings. */
  const save = useCallback(async (partial) => {
    const updated = await settingsApi.update(partial);
    setSettings(updated);
    return updated;
  }, []);

  return { settings, loading, error, reload, save };
};

export default useAdminSettings;
