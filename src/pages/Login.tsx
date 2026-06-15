import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Eye, EyeOff, Camera } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import type { RangerRole } from '@/types';
import { cn } from '@/lib/utils';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [selectedRole, setSelectedRole] = useState<RangerRole>('ranger');
  const [username, setUsername] = useState('');
  const [showFaceScan, setShowFaceScan] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef<number | null>(null);
  const loginStartedRef = useRef(false);

  const roles = [
    { id: 'ranger' as RangerRole, label: '巡护员', names: ['张伟', '李芳', '王强', '赵敏'] },
    { id: 'director' as RangerRole, label: '保护区主任', names: ['陈主任'] },
    { id: 'bureau' as RangerRole, label: '林业局', names: ['刘局长'] },
  ];

  const currentRole = roles.find((r) => r.id === selectedRole);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleStartFaceScan = () => {
    if (!username) {
      setError('请选择或输入用户名');
      return;
    }
    if (loginStartedRef.current) return;
    loginStartedRef.current = true;
    setError('');
    setShowFaceScan(true);
    setIsScanning(true);
    setScanProgress(0);

    const step = () => {
      setScanProgress((prev) => {
        const next = Math.min(prev + 5, 100);
        if (next >= 100) {
          setIsScanning(false);
          timerRef.current = window.setTimeout(() => {
            const success = login(selectedRole, username);
            loginStartedRef.current = false;
            if (success) {
              navigate('/dashboard');
            } else {
              setError('登录失败，请重试');
              setShowFaceScan(false);
            }
          }, 600);
        } else {
          timerRef.current = window.setTimeout(step, 30);
        }
        return next;
      });
    };
    timerRef.current = window.setTimeout(step, 30);
  };

  const handleSelectUser = (name: string) => {
    setUsername(name);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/30 mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">野生动物保护区</h1>
          <p className="text-emerald-400 text-sm">反盗猎监测调度平台</p>
        </div>

        <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-6">
          <h2 className="text-xl font-bold text-white mb-6 text-center">人脸识别登录</h2>

          {!showFaceScan ? (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  选择角色
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => {
                        setSelectedRole(role.id);
                        setUsername('');
                        setError('');
                      }}
                      className={cn(
                        'py-3 px-2 rounded-lg text-sm font-medium transition-all',
                        selectedRole === role.id
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                      )}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  选择用户
                </label>
                <div className="space-y-2">
                  {currentRole?.names.map((name) => (
                    <button
                      key={name}
                      onClick={() => handleSelectUser(name)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg transition-all',
                        username === name
                          ? 'bg-emerald-500/20 border border-emerald-500/50 text-white'
                          : 'bg-gray-700/30 border border-gray-600/30 text-gray-300 hover:bg-gray-700/50'
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                      <span>{name}</span>
                      {username === name && (
                        <span className="ml-auto text-emerald-400 text-sm">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleStartFaceScan}
                disabled={!username}
                className={cn(
                  'w-full py-3 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2',
                  username
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/30'
                    : 'bg-gray-600 cursor-not-allowed'
                )}
              >
                <Camera size={20} />
                开始人脸识别
              </button>
            </>
          ) : (
            <div className="text-center">
              <div className="relative w-48 h-48 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/30" />
                <div
                  className="absolute inset-4 rounded-full border-2 border-emerald-400"
                  style={{
                    clipPath: `polygon(0 0, 100% 0, 100% ${scanProgress}%, 0 ${scanProgress}%)`,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {isScanning ? (
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center mb-2 animate-pulse mx-auto">
                        <Camera size={32} className="text-emerald-400" />
                      </div>
                      <p className="text-emerald-400 text-sm">识别中...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center mb-2 mx-auto">
                        <span className="text-3xl">✓</span>
                      </div>
                      <p className="text-green-400 text-sm font-medium">识别成功</p>
                    </div>
                  )}
                </div>
                <div className="absolute -inset-2 rounded-full border border-emerald-500/20 animate-ping" />
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>识别进度</span>
                  <span className="text-emerald-400 font-medium">{scanProgress}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-100"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>

              <p className="text-gray-400 text-sm">
                正在验证 <span className="text-white font-medium">{username}</span> 的身份
              </p>

              {!isScanning && (
                <p className="mt-4 text-green-400 text-sm animate-pulse">
                  正在进入系统...
                </p>
              )}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <p className="text-center text-xs text-gray-500">
              登录即表示您同意我们的服务条款和隐私政策
            </p>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © 2024 野生动物保护区管理局 · 反盗猎监测系统
        </p>
      </div>
    </div>
  );
}
