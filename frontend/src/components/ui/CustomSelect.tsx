'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
  badge?: string;
  description?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  label,
  icon,
  className = '',
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Calculate if dropdown should open upward or downward based on viewport clearance
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If less than 240px space below and more space above, open upwards
      if (spaceBelow < 240 && rect.top > 240) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      className={`relative ${isOpen ? 'z-[9999]' : 'z-20'} ${className}`}
      ref={containerRef}
    >
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 text-left text-sm rounded-xl border transition-all duration-200 select-none ${
          isOpen
            ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10 shadow-sm'
            : 'border-slate-200 bg-slate-50/80 hover:bg-white hover:border-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
          {selectedOption?.icon && (
            <span className="text-emerald-600 shrink-0">{selectedOption.icon}</span>
          )}
          <span
            className={`truncate font-medium ${
              selectedOption ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ml-auto shrink-0 ${
                selectedOption.badge.toLowerCase().includes('staff') ||
                selectedOption.badge.toLowerCase().includes('internal')
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu (Solid Background, Highest Z-Index) */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute z-[99999] left-0 min-w-full w-max max-w-[min(100vw-2rem,460px)] ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } max-h-64 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-2xl p-1.5 divide-y divide-slate-100 animate-in fade-in-0 zoom-in-95 duration-150`}
          style={{ boxShadow: '0 20px 40px -15px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)' }}
        >
          <div className="space-y-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-start justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    {option.icon && (
                      <span
                        className={`shrink-0 mt-0.5 ${
                          isSelected ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        {option.icon}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-bold leading-tight">{option.label}</div>
                      {option.description && (
                        <div className="text-[10px] text-slate-400 font-normal truncate mt-0.5 leading-normal max-w-full">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-3 mt-0.5">
                    {option.badge && (
                      <span
                        className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 ${
                          option.badge.toLowerCase().includes('staff') ||
                          option.badge.toLowerCase().includes('internal')
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {option.badge}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
