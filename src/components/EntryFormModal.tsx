import React, { useEffect, useState } from 'react';
import type { JournalItem } from '../store/useJournalStore';

interface EntryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<JournalItem, 'id'>, id?: string) => void;
  initial?: JournalItem | null;
}

const defaultData: Omit<JournalItem, 'id'> = {
  imgUrl: '',
  rating: 3,
  categories: [],
  date: '',
  description: ''
};

const EntryFormModal: React.FC<EntryFormModalProps> = ({ isOpen, onClose, onSubmit, initial }) => {
  const [data, setData] = useState<Omit<JournalItem, 'id'>>(defaultData);
  const [categoryInput, setCategoryInput] = useState('');

  useEffect(() => {
    if (initial) {
      const { id, ...rest } = initial;
      setData(rest);
      setCategoryInput('');
    } else {
      setData(defaultData);
      setCategoryInput('');
    }
  }, [initial, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data, (initial as any)?.id);
  };

  const addCategory = () => {
    if (!categoryInput.trim()) return;
    setData(prev => ({ ...prev, categories: [...prev.categories, categoryInput.trim()] }));
    setCategoryInput('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h3 className="text-lg font-semibold">{initial ? 'Edit Entry' : 'Add Entry'}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input value={data.imgUrl} onChange={e => setData({ ...data, imgUrl: e.target.value })} className="w-full border rounded-md p-2" placeholder="https://..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date (MM/DD/YYYY)</label>
              <input value={data.date} onChange={e => setData({ ...data, date: e.target.value })} className="w-full border rounded-md p-2" placeholder="09/15/2025" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rating (0-5)</label>
              <input type="number" min={0} max={5} step={0.1} value={data.rating} onChange={e => setData({ ...data, rating: Number(e.target.value) })} className="w-full border rounded-md p-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categories</label>
            <div className="flex gap-2 mb-2">
              <input value={categoryInput} onChange={e => setCategoryInput(e.target.value)} className="flex-1 border rounded-md p-2" placeholder="Type a category" />
              <button type="button" onClick={addCategory} className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.categories.map((c, i) => (
                <span key={i} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={data.description} onChange={e => setData({ ...data, description: e.target.value })} className="w-full border rounded-md p-2" rows={4} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">{initial ? 'Save' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntryFormModal;
