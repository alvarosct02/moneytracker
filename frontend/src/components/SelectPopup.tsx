import { useEffect, useRef } from 'react';

interface SelectPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: Array<{ value: string; label: string; icon?: string }>;
  selectedValue: string;
  onSelect: (value: string) => void;
}

export default function SelectPopup({
  isOpen,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
}: SelectPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 animate-fadeIn">
      <div
        ref={popupRef}
        className="bg-white rounded-t-3xl w-full max-w-md max-h-[80vh] flex flex-col animate-slideUp"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSelect(option.value);
                onClose();
              }}
              className={`w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors ${
                selectedValue === option.value ? 'bg-emerald-50' : ''
              }`}
            >
              {option.icon && <span className="text-2xl">{option.icon}</span>}
              <span className={`flex-1 text-base font-medium ${
                selectedValue === option.value ? 'text-emerald-600' : 'text-gray-800'
              }`}>
                {option.label}
              </span>
              {selectedValue === option.value && (
                <span className="text-emerald-500 text-xl">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

