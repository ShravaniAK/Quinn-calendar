import React, { useState, useEffect, useRef } from 'react';
import { JournalEntry } from '../data/journalEntries';
import { parseDateString } from '../utils/dateUtils';

interface JournalCardProps {
  entry: JournalEntry;
  onClose: () => void;
  allEntries: JournalEntry[];
  initialIndex?: number;
  onEditRequest?: (entry: JournalEntry) => void;
  onDeleteRequest?: (entry: JournalEntry) => void;
}

const JournalCard: React.FC<JournalCardProps> = ({ entry, onClose, allEntries, initialIndex, onEditRequest, onDeleteRequest }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragDx, setDragDx] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [slideWidth, setSlideWidth] = useState<number>(() => Math.round(Math.min(560, Math.max(300, (typeof window !== 'undefined' ? window.innerWidth : 360) * 0.86))));
  const GAP = 16;

  useEffect(() => {
    if (typeof initialIndex === 'number' && initialIndex >= 0 && initialIndex < allEntries.length) {
      setCurrentIndex(initialIndex);
    } else {
      const index = allEntries.findIndex(e => e.date === entry.date && (e as any)['description'] === (entry as any)['description']);
      setCurrentIndex(index >= 0 ? index : 0);
    }
  }, [entry, allEntries, initialIndex]);

  useEffect(() => {
    const measure = () => {
      const vp = viewportRef.current;
      const fallback = Math.round(Math.min(560, Math.max(300, window.innerWidth * 0.86)));
      if (!vp) { setSlideWidth(fallback); return; }
      const w = vp.getBoundingClientRect().width;
      setSlideWidth(Math.round((w || fallback) * 0.86));
    };
    const id = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', measure); };
  }, []);

  const begin = (x: number) => { setIsDragging(true); setStartX(x); setDragDx(0); };
  const move = (x: number) => { if (!isDragging) return; setDragDx(x - startX); };
  const end = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = Math.max(60, slideWidth * 0.2);
    if (dragDx > threshold && currentIndex > 0) setCurrentIndex(currentIndex - 1);
    else if (dragDx < -threshold && currentIndex < allEntries.length - 1) setCurrentIndex(currentIndex + 1);
    setDragDx(0);
  };

  const onTouchStart = (e: React.TouchEvent) => { e.stopPropagation(); begin(e.touches[0].clientX); };
  const onTouchMove = (e: React.TouchEvent) => { if (isDragging) { e.preventDefault(); move(e.touches[0].clientX); } };
  const onTouchEnd = () => end();
  const onMouseDown = (e: React.MouseEvent) => { e.preventDefault(); begin(e.clientX); };
  const onMouseMove = (e: React.MouseEvent) => move(e.clientX);
  const onMouseUp = () => end();
  const onMouseLeave = () => end();

  const baseOffset = -(currentIndex * (slideWidth + GAP));
  const trackStyle: React.CSSProperties = { transform: `translateX(${baseOffset + dragDx}px)`, transition: isDragging ? 'none' : 'transform 300ms ease-out' };

  const formatDate = (dateString: string) => parseDateString(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
  const renderStars = (rating: number) => Array.from({ length: 5 }, (_, i) => (<span key={i} className={i < Math.round(rating) ? 'text-blue-400' : 'text-gray-300'}>★</span>));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <div
        ref={viewportRef}
        className="w-full max-w-md md:max-w-2xl overflow-hidden mx-auto"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'pan-y' }}
      >
        <div className="flex items-stretch" style={{ gap: GAP, ...trackStyle }}>
          {allEntries.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-2xl overflow-hidden flex-none" style={{ width: slideWidth }}>
              <div className="px-4 pt-4">
                <div className="rounded-xl overflow-hidden shadow ring-1 ring-black/5">
                  <img src={item.imgUrl} alt="Journal entry" className="w-full h-72 object-cover" />
                </div>
              </div>
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-2">{item.categories.slice(0,2).map((c, i) => (<span key={i} className="badge badge-soft">{c}</span>))}</div>
                  <div className="flex items-center gap-1">{renderStars(item.rating)}</div>
                </div>
                <div className="text-base md:text-lg font-bold text-gray-900 mb-2">{formatDate(item.date)}</div>
                <p className="text-gray-700 line-clamp-3">{item.description}</p>
                <div className="mt-5"><button className="w-full rounded-xl border border-gray-300 py-3 font-semibold text-gray-900 hover:bg-gray-50">View full Post</button></div>
                {idx === currentIndex && (onEditRequest || onDeleteRequest) && (
                  <div className="mt-4 flex justify-end gap-2 text-sm">
                    {onEditRequest && (<button onClick={() => onEditRequest(item)} className="px-3 py-1 rounded-md border hover:bg-gray-100">Edit</button>)}
                    {onDeleteRequest && (<button onClick={() => onDeleteRequest(item)} className="px-3 py-1 rounded-md border text-red-600 hover:bg-red-50">Delete</button>)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-4 space-x-2">{allEntries.map((_, index) => (<div key={index} className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'}`} />))}</div>
      </div>
    </div>
  );
};

export default JournalCard;
