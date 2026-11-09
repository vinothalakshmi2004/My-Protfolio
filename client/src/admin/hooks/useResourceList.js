/**
 * useResourceList(api) — state + actions for one orderable resource list
 * (projects, experience, skills, education, certifications, achievements).
 *
 *  items, loading, error, reload()
 *  save(id|null, data)  -> create or update, then refresh the list
 *  remove(id)           -> delete (server also deletes the record's GridFS files)
 *  reorder(newItems)    -> optimistic: UI updates immediately, rolled back on failure
 *  setVisible(id, bool) -> optimistic visibility toggle
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../lib/apiClient';

export const useResourceList = (api) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const reload = useCallback(async () => {
    setError('');
    try {
      setItems(await api.list());
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load items'));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    reload();
  }, [reload]);

  const save = useCallback(
    async (id, data) => {
      const saved = id ? await api.update(id, data) : await api.create(data);
      setItems((prev) => (id ? prev.map((it) => (it._id === id ? saved : it)) : [...prev, saved]));
      return saved;
    },
    [api]
  );

  const remove = useCallback(
    async (id) => {
      const result = await api.remove(id);
      setItems((prev) => prev.filter((it) => it._id !== id));
      return result;
    },
    [api]
  );

  const reorder = useCallback(
    async (nextItems) => {
      const previous = itemsRef.current;
      const withOrder = nextItems.map((item, order) => ({ ...item, order }));
      setItems(withOrder);
      try {
        await api.reorder(withOrder.map((item) => ({ id: item._id, order: item.order })));
        toast.success('Order saved', { id: 'reorder' });
      } catch (err) {
        setItems(previous);
        toast.error(getErrorMessage(err, 'Could not save the new order'));
      }
    },
    [api]
  );

  const setVisible = useCallback(
    async (id, visible) => {
      setItems((prev) => prev.map((it) => (it._id === id ? { ...it, visible } : it)));
      try {
        await api.setVisible(id, visible);
        toast.success(visible ? 'Now visible on the site' : 'Hidden from the site', { id: `vis-${id}` });
      } catch (err) {
        setItems((prev) => prev.map((it) => (it._id === id ? { ...it, visible: !visible } : it)));
        toast.error(getErrorMessage(err, 'Could not change visibility'));
      }
    },
    [api]
  );

  return { items, loading, error, reload, save, remove, reorder, setVisible };
};

export default useResourceList;
