import { useEffect, useRef, useState } from 'react';

interface DatePopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelect: (date: string) => void;
}

export default function DatePopup({
  isOpen,
  onClose,
  selectedDate,
  onSelect,
}: DatePopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [localDate, setLocalDate] = useState(selectedDate);

  useEffect(() => {
    if (isOpen) {
      setLocalDate(selectedDate);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSave = () => {
    onSelect(localDate);
    onClose();
  };

  const getQuickDates = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return [
      { label: 'Hoy', date: today.toISOString().split('T')[0] },
      { label: 'Ayer', date: yesterday.toISOString().split('T')[0] },
      { label: 'Mañana', date: tomorrow.toISOString().split('T')[0] },
    ];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 animate-fadeIn">
      <div
        ref={popupRef}
        className="bg-white rounded-t-3xl w-full max-w-md max-h-[80vh] flex flex-col animate-slideUp"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Seleccionar Fecha</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Quick Dates */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Fechas Rápidas
          </div>
          <div className="flex flex-col gap-2">
            {getQuickDates().map((quick) => (
              <button
                key={quick.date}
                onClick={() => {
                  setLocalDate(quick.date);
                  handleSave();
                }}
                className={`text-left px-4 py-3 rounded-xl transition-colors ${
                  localDate === quick.date
                    ? 'bg-emerald-50 text-emerald-600 font-medium'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{quick.label}</div>
                <div className="text-xs text-gray-500">{formatDate(quick.date)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Date Picker */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Seleccionar Fecha
          </div>
          <input
            type="date"
            value={localDate}
            onChange={(e) => setLocalDate(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-base"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="w-full bg-emerald-500 text-white py-3 px-4 rounded-xl hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

