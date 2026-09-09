import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={twMerge("flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl overflow-x-auto no-scrollbar", className)}>
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap select-none shrink-0",
              isActive
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            )}
          >
            {tab.icon && <span className={isActive ? "text-primary-600" : "text-slate-500"}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={clsx(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                  isActive ? "bg-primary-50 text-primary-700" : "bg-slate-200/80 text-slate-600"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
