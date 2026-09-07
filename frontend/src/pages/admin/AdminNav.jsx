import React from 'react';
import { NavLink } from 'react-router-dom';
import { Layers, HelpCircle, Users, FileText, Shield } from 'lucide-react';

export default function AdminNav({ title, subtitle }) {
  const tabs = [
    { to: '/admin/rounds', label: 'Rounds & Event', icon: Layers },
    { to: '/admin/questions', label: 'Questions', icon: HelpCircle },
    { to: '/admin/teams', label: 'Teams', icon: Users },
    { to: '/admin/submissions', label: 'Submissions Audit', icon: FileText }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center space-x-3 mb-2">
        <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Shield className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit'] tracking-tight">
            {title || 'Admin Console'}
          </h1>
          {subtitle && <p className="text-xs sm:text-sm text-gray-400">{subtitle}</p>}
        </div>
      </div>

      <div className="flex border-b border-gray-800 space-x-2 sm:space-x-4 overflow-x-auto mt-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex items-center space-x-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
