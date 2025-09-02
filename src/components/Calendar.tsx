import React, { useState, useEffect, useRef, useCallback } from 'react';
import { formatDate, getMonthDates, isToday, isSameMonth, addMonths, formatDateKey } from '../utils/dateUtils';
import { journalEntries, JournalEntry } from '../data/journalEntries';
import JournalCard from './JournalCard';
import { useJournalStore, JournalItem } from '../store/useJournalStore';
import EntryFormModal from './EntryFormModal';

interface CalendarProps {}

const BATCH = 6;

const Calendar: React.FC<CalendarProps> = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [visibleMonths, setVisibleMonths] = useState<Date[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [initialEntryIndex, setInitialEntryIndex] = useState<number>(0);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JournalItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const lastScrollTopRef = useRef(0);

  const { items, resetWithSample, addItem, updateItem, deleteItem } = useJournalStore();

  useEffect(() => {
    if (items.length === 0) {
      resetWithSample(journalEntries);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entriesByDate = React.useMemo(() => {
    const map = new Map<string, JournalEntry[]>();
    items.forEach(entry => {
      const dateKey = entry.date;
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(entry);
    });
    return map;
  }, [items]);

  useEffect(() => {
    const today = new Date();
    const months: Date[] = [];
    for (let i = -6; i <= 6; i++) months.push(addMonths(today, i));
    setVisibleMonths(months);
  }, []);

  const appendFuture = useCallback(() => {
    setVisibleMonths(prev => {
      const next = [...prev];
      const last = next[next.length - 1];
      for (let i = 1; i <= BATCH; i++) next.push(addMonths(last, i));
      return next;
    });
  }, []);

  const prependPast = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const before = container.scrollHeight;
    setVisibleMonths(prev => {
      const next = [...prev];
      const first = next[0];
      const toAdd: Date[] = [];
      for (let i = BATCH; i >= 1; i--) toAdd.push(addMonths(first, -i));
      return [...toAdd, ...next];
    });
    // After DOM updates, keep the viewport anchored by compensating the added height
    requestAnimationFrame(() => {
      const after = container.scrollHeight;
      const delta = after - before;
      container.scrollTop += delta;
    });
  }, []);

  // Scroll listener only updates header month based on center
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    if (Math.abs(scrollTop - lastScrollTopRef.current) < 50) return;
    lastScrollTopRef.current = scrollTop;

    requestAnimationFrame(() => {
      const monthElements = container.querySelectorAll('[data-month-date]');
      let closest: Date | null = null;
      let min = Infinity;
      const centerY = container.getBoundingClientRect().top + container.clientHeight / 2;
      monthElements.forEach((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        const d = Math.abs(centerY - mid);
        if (d < min) { min = d; closest = new Date((el as HTMLElement).dataset.monthDate || ''); }
      });
      if (closest) setCurrentDate(closest);
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const throttled = () => requestAnimationFrame(handleScroll);
    container.addEventListener('scroll', throttled);
    return () => container.removeEventListener('scroll', throttled);
  }, [handleScroll]);

  // IntersectionObserver sentinels for infinite load
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (isLoadingRef.current) return;
        if (e.isIntersecting && e.target === bottomSentinelRef.current) {
          isLoadingRef.current = true;
          appendFuture();
          setTimeout(() => { isLoadingRef.current = false; }, 100);
        }
        if (e.isIntersecting && e.target === topSentinelRef.current) {
          isLoadingRef.current = true;
          prependPast();
          setTimeout(() => { isLoadingRef.current = false; }, 100);
        }
      });
    }, { root, rootMargin: '200px', threshold: 0.01 });

    if (bottomSentinelRef.current) observer.observe(bottomSentinelRef.current);
    if (topSentinelRef.current) observer.observe(topSentinelRef.current);

    return () => observer.disconnect();
  }, [appendFuture, prependPast]);

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    const idx = items.findIndex((e) => e.date === entry.date && e.description === entry.description);
    setInitialEntryIndex(idx >= 0 ? idx : 0);
    setIsCardOpen(true);
  };

  const closeCard = () => { setIsCardOpen(false); setSelectedEntry(null); };
  const openCreate = () => { setEditingItem(null); setIsFormOpen(true); };
  const handleSubmitForm = (data: Omit<JournalItem, 'id'>, id?: string) => { if (id) updateItem(id, data); else addItem(data); setIsFormOpen(false); };

  const renderMonth = (monthDate: Date) => {
    const dates = getMonthDates(monthDate.getFullYear(), monthDate.getMonth());
    const monthKey = monthDate.toISOString();

    return (
      <div key={monthKey} data-month-date={monthKey} className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-4">{formatDate(monthDate)}</h2>
        <div className="grid grid-cols-7 gap-px md:gap-1">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => (
            <div key={day} className="p-1 md:p-2 text-center font-semibold text-gray-600 text-xs md:text-sm">{day}</div>
          ))}
          {dates.map((date, dateIndex) => {
            const dateKey = formatDateKey(date);
            const entries = entriesByDate.get(dateKey) || [];
            const isCurrentMonth = isSameMonth(date, monthDate);
            const isTodayDate = isToday(date);
            return (
              <div key={dateIndex} className={`border border-gray-200 min-h-[90px] md:min-h-[120px] p-1 md:p-2 relative ${isTodayDate ? 'bg-blue-50 border-blue-300' : ''} ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}`}>
                <div className="text-[11px] md:text-sm font-medium mb-1">{date.getDate()}</div>
                <div className="space-y-1">
                  {entries.map((entry, entryIndex) => (
                    <button key={entryIndex} onClick={() => handleEntryClick(entry)} className="relative w-full overflow-hidden rounded-lg shadow-sm border border-gray-200 bg-white transition-all duration-200 hover:shadow-md">
                      <div className="relative">
                        <img src={entry.imgUrl} alt="Journal" className="w-full h-16 md:h-20 object-cover" />
                        <div className="absolute right-1 top-1 flex items-center gap-1 bg-white/90 rounded-full px-1.5 py-0.5 shadow">
                          <span className="text-yellow-400 text-base md:text-lg">★</span>
                          <span className="text-[10px] md:text-xs text-gray-700 font-medium">{entry.rating}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{formatDate(currentDate)}</h1>
        </div>
      </header>

      <div ref={containerRef} className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-6 overflow-y-auto" style={{ height: 'calc(100vh - 64px)' }}>
        <div ref={topSentinelRef} />
        {visibleMonths.length > 0 ? visibleMonths.map((month) => renderMonth(month)) : (
          <div className="text-center py-8"><p className="text-gray-500">Loading calendar...</p></div>
        )}
        <div ref={bottomSentinelRef} />
      </div>

      <button onClick={openCreate} className="fixed bottom-6 right-6 md:bottom-8 md:right-8 rounded-full w-14 h-14 md:w-16 md:h-16 bg-blue-600 text-white shadow-xl flex items-center justify-center text-3xl">+</button>

      {isCardOpen && selectedEntry && (
        <JournalCard entry={selectedEntry} onClose={closeCard} allEntries={items} initialIndex={initialEntryIndex} onEditRequest={(e) => { setEditingItem(items.find(it => it.date === e.date && it.description === e.description) as any); setIsFormOpen(true); }} onDeleteRequest={(e) => { const target = items.find(it => it.date === e.date && it.description === e.description) as any; if (target && window.confirm('Delete this entry?')) { deleteItem((target as any).id); closeCard(); } }} />
      )}

      <EntryFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleSubmitForm} initial={editingItem as any} />
    </div>
  );
};

export default Calendar;
