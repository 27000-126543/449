import { useState, useEffect } from 'react';
import { Shield, Bell, User, Settings, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onToggleLeftPanel?: () => void;
  onToggleRightPanel?: () => void;
}

export default function TopBar({ onToggleLeftPanel, onToggleRightPanel }: TopBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getRoleText = (role: string) => {
    const roles: Record<string, string> = {
      ranger: '巡护员',
      director: '保护区主任',
      bureau: '林业局',
    };
    return roles[role] || role;
  };

  return (
    <header className="h-14 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-4">
        {onToggleLeftPanel && (
          <button
            onClick={onToggleLeftPanel}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">
              野生动物保护区
            </h1>
            <p className="text-xs text-emerald-400 leading-tight">反盗猎监测调度平台</p>
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-col items-center">
        <div className="text-xl font-bold text-white font-mono">{formatTime(currentTime)}</div>
        <div className="text-xs text-gray-400">{formatDate(currentTime)}</div>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium text-white">{currentUser?.name}</div>
              <div className="text-xs text-gray-400">{getRoleText(currentUser?.role || '')}</div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 z-50">
              <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2">
                <Settings size={16} />
                系统设置
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
              >
                <LogOut size={16} />
                退出登录
              </button>
            </div>
          )}
        </div>

        {onToggleRightPanel && (
          <button
            onClick={onToggleRightPanel}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>
        )}
      </div>
    </header>
  );
}
