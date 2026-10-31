import React from 'react';
import contentData from '../data/contentData.json';
import { TabType } from '../types';
import {
  HelpCircle,
  Smartphone,
  Gamepad2,
  Calculator,
  CalendarCheck,
  Sparkles,
  MapPin
} from 'lucide-react';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  HelpCircle,
  Smartphone,
  Gamepad2,
  Calculator,
  CalendarCheck,
  Sparkles,
  MapPin
};

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const { navigation } = contentData;

  return (
    <nav className="bg-white border-b border-slate-200 shadow-2xs sticky top-20 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar scroll-smooth">
          {navigation.map((item, index) => {
            const Icon = ICON_MAP[item.icon] || HelpCircle;
            const isActive = activeTab === item.id;
            const isGame = item.id === 'game';

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as TabType)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#00529C] text-white shadow-xs'
                    : isGame
                    ? 'bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100'
                    : 'text-slate-600 hover:text-[#00529C] hover:bg-slate-100'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? 'text-white'
                      : isGame
                      ? 'text-amber-600'
                      : 'text-slate-500 group-hover:text-[#00529C]'
                  }`}
                />
                <span>{item.shortTitle}</span>
                {isGame && !isActive && (
                  <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                    Quà tặng
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
