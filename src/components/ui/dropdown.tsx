"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface DropdownContextValue {
  isOpen: boolean;
  close: () => void;
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) {
    throw new Error('Dropdown subcomponents must be used within <Dropdown>');
  }
  return ctx;
}

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

/**
 * Dropdown menu container with click-outside-to-close behavior.
 * Use <DropdownTrigger> (rendered via `trigger` prop) and <DropdownItem> children.
 */
export function Dropdown({ trigger, children, align = 'right', className = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const alignClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <DropdownContext.Provider value={{ isOpen, close }}>
      <div className={`relative inline-block ${className}`} ref={containerRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center focus:outline-none"
        >
          {trigger}
        </button>
        {isOpen && (
          <div
            className={`absolute mt-2 ${alignClass} w-60 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50`}
            role="menu"
          >
            <div className="py-1">{children}</div>
          </div>
        )}
      </div>
    </DropdownContext.Provider>
  );
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  className?: string;
}

export function DropdownItem({
  children,
  onClick,
  variant = 'default',
  disabled = false,
  className = '',
}: DropdownItemProps) {
  const { close } = useDropdownContext();

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    close();
  };

  const variantClass =
    variant === 'danger'
      ? 'text-red-600 hover:bg-red-50'
      : 'text-gray-700 hover:bg-gray-100';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`w-full text-left px-4 py-2 text-sm ${variantClass} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      role="menuitem"
    >
      {children}
    </button>
  );
}

interface DropdownLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownLabel({ children, className = '' }: DropdownLabelProps) {
  return (
    <div className={`px-4 py-2 text-sm text-gray-700 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

interface DropdownSeparatorProps {
  className?: string;
}

export function DropdownSeparator({ className = '' }: DropdownSeparatorProps) {
  return <div className={`border-t border-gray-100 my-1 ${className}`} />;
}