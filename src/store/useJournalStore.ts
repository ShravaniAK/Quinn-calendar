import { useEffect, useState, useCallback } from 'react';
import type { JournalEntry } from '../data/journalEntries';

export type JournalItem = JournalEntry & { id: string };

const STORAGE_KEY = 'quinn_journal_entries_v1';

const read = (): JournalItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const write = (items: JournalItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const useJournalStore = () => {
  const [items, setItems] = useState<JournalItem[]>([]);

  useEffect(() => {
    setItems(read());
  }, []);

  const addItem = useCallback((item: Omit<JournalItem, 'id'>) => {
    setItems(prev => {
      const next = [{ ...item, id: crypto.randomUUID() }, ...prev];
      write(next);
      return next;
    });
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<JournalItem>) => {
    setItems(prev => {
      const next = prev.map(it => (it.id === id ? { ...it, ...updates, id: it.id } : it));
      write(next);
      return next;
    });
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems(prev => {
      const next = prev.filter(it => it.id !== id);
      write(next);
      return next;
    });
  }, []);

  const resetWithSample = useCallback((sample: JournalEntry[]) => {
    const seeded: JournalItem[] = sample.map((e) => ({ ...e, id: crypto.randomUUID() }));
    write(seeded);
    setItems(seeded);
  }, []);

  return { items, addItem, updateItem, deleteItem, resetWithSample } as const;
};
