import React, { useRef, useEffect } from 'react';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext.js';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose, onNavigate }) => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-red-600" />
          <h4 className="text-sm font-semibold text-slate-800">Notifications</h4>
          {unreadCount > 0 && (
            <span className="text-[11px] font-bold bg-red-100 text-red-700 px-1.5 py-0.2 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-700 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => {
                if (!n.isRead) markAsRead(n._id);
                if (n.link) {
                  onNavigate(n.link.replace('/', ''));
                  onClose();
                }
              }}
              className={`p-3.5 text-xs cursor-pointer transition-colors hover:bg-slate-50 ${
                !n.isRead ? 'bg-red-50/30 font-medium' : 'text-slate-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="leading-relaxed flex-1 text-slate-800">{n.message}</p>
                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 mt-1" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{formatTime(n.createdAt)}</span>
                {n.link && (
                  <span className="flex items-center gap-0.5 text-red-600 ml-auto">
                    View <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
