/**
 * CommandPalette Component - 2025 Design System
 *
 * Quick navigation palette triggered by Cmd+K / Ctrl+K.
 * Provides fast access to common actions and navigation.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Zap,
  Calculator,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  ArrowRight,
  Command,
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
  keywords?: string[];
  category?: string;
}

interface CommandPaletteProps {
  commands: CommandItem[];
  onClose: () => void;
  isOpen: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  commands,
  onClose,
  isOpen,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter commands based on query
  const filteredCommands = commands.filter((cmd) => {
    if (!query) return true;
    const searchText = [cmd.label, cmd.description, ...(cmd.keywords || [])].join(' ').toLowerCase();
    return searchText.includes(query.toLowerCase());
  });

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    const category = cmd.category || 'Actions';
    if (!acc[category]) acc[category] = [];
    acc[category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selectedEl?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [filteredCommands, selectedIndex, onClose]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />

      {/* Palette */}
      <div
        className="relative w-full max-w-xl bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-slideInUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700">
          <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 outline-none text-lg"
            aria-label="Search commands"
            autoComplete="off"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-gray-400 bg-slate-700 rounded-md">
            <span>esc</span>
          </kbd>
        </div>

        {/* Commands list */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-400">No commands found</p>
              <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category}>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {category}
                </div>
                {items.map((cmd) => {
                  const globalIndex = filteredCommands.indexOf(cmd);
                  const isSelected = globalIndex === selectedIndex;
                  const Icon = cmd.icon;

                  return (
                    <button
                      key={cmd.id}
                      data-index={globalIndex}
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3
                        transition-colors duration-100
                        ${isSelected
                          ? 'bg-violet-500/20 text-white'
                          : 'text-gray-300 hover:bg-slate-700/50'
                        }
                      `}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                        ${isSelected ? 'bg-violet-500/30' : 'bg-slate-700'}
                      `}>
                        <Icon className={`h-5 w-5 ${isSelected ? 'text-violet-400' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{cmd.label}</p>
                        {cmd.description && (
                          <p className="text-sm text-gray-500">{cmd.description}</p>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="hidden sm:block px-2 py-1 text-xs text-gray-400 bg-slate-700 rounded">
                          {cmd.shortcut}
                        </kbd>
                      )}
                      {isSelected && (
                        <ArrowRight className="h-4 w-4 text-violet-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded">↵</kbd>
              <span>select</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Command className="h-3 w-3" />
            <span>K to open</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * useCommandPalette hook - Global keyboard shortcut handler
 */
export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
};

/**
 * ThemeToggle - Quick theme switch button
 */
interface ThemeToggleProps {
  theme: 'dark' | 'light';
  onToggle: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggle,
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
  };

  return (
    <button
      onClick={onToggle}
      className={`
        ${sizes[size]} rounded-lg flex items-center justify-center
        bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900
        ${className}
      `}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className={`${iconSizes[size]} text-amber-400`} />
      ) : (
        <Moon className={`${iconSizes[size]} text-violet-400`} />
      )}
    </button>
  );
};

/**
 * Default command set for PropIQ
 */
export const getDefaultCommands = ({
  onAnalyze,
  onCalculator,
  onPricing,
  onHelp,
  onLogout,
  onThemeToggle,
  currentTheme,
}: {
  onAnalyze?: () => void;
  onCalculator?: () => void;
  onPricing?: () => void;
  onHelp?: () => void;
  onLogout?: () => void;
  onThemeToggle?: () => void;
  currentTheme?: 'dark' | 'light';
}): CommandItem[] => [
  {
    id: 'analyze',
    label: 'Analyze Property',
    description: 'Start AI property analysis',
    icon: Zap,
    shortcut: 'A',
    action: () => onAnalyze?.(),
    keywords: ['propiq', 'ai', 'property', 'analysis'],
    category: 'Actions',
  },
  {
    id: 'calculator',
    label: 'Deal Calculator',
    description: 'Open the deal calculator',
    icon: Calculator,
    shortcut: 'C',
    action: () => onCalculator?.(),
    keywords: ['calc', 'roi', 'cash flow'],
    category: 'Actions',
  },
  {
    id: 'pricing',
    label: 'View Pricing',
    description: 'See subscription plans',
    icon: CreditCard,
    action: () => onPricing?.(),
    keywords: ['plans', 'upgrade', 'subscription'],
    category: 'Account',
  },
  {
    id: 'theme',
    label: `Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`,
    description: 'Toggle color theme',
    icon: currentTheme === 'dark' ? Sun : Moon,
    action: () => onThemeToggle?.(),
    keywords: ['dark', 'light', 'appearance'],
    category: 'Settings',
  },
  {
    id: 'help',
    label: 'Help & Support',
    description: 'Get help with PropIQ',
    icon: HelpCircle,
    shortcut: '?',
    action: () => onHelp?.(),
    keywords: ['support', 'faq'],
    category: 'Help',
  },
  {
    id: 'logout',
    label: 'Log Out',
    description: 'Sign out of your account',
    icon: LogOut,
    action: () => onLogout?.(),
    keywords: ['sign out', 'exit'],
    category: 'Account',
  },
];

export default CommandPalette;
