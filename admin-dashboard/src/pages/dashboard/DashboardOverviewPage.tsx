import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchAccountThunk } from '@/store/slices/authSlice';
import { authService } from '@/services/authService';
import { getAccessToken } from '@/services/apiClient';
import {
  ShieldCheck,
  KeyRound,
  RefreshCw,
  UserCheck,
  Clock,
  Sparkles,
  Server,
  Layers,
  ArrowRight,
  Database,
} from 'lucide-react';

export const DashboardOverviewPage = () => {
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [refreshLog, setRefreshLog] = useState<string | null>(null);
  const [isRefreshingNow, setIsRefreshingNow] = useState(false);


  const handleTestRefreshToken = async () => {
    setIsRefreshingNow(true);
    setRefreshLog('Đang gửi request /api/v1/auth/refresh (gửi kèm Cookie)...');
    try {
      const res = await authService.refreshToken();
      setRefreshLog(
        `Refresh thành công! Access Token mới:\n${res.access_token.substring(0, 36)}...`
      );
      dispatch(fetchAccountThunk());
    } catch (err: any) {
      setRefreshLog(`Thất bại: ${err.message}`);
    } finally {
      setIsRefreshingNow(false);
    }
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'GET':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'POST':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'PATCH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Đăng nhập thành công • RBAC Active</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Xin chào, <span className="text-cyan-400">{user?.name}</span>!
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xl leading-relaxed">
              Bạn đang đăng nhập dưới vai trò{' '}
              <span className="text-emerald-400 font-semibold">{user?.role?.name}</span>. Hệ thống đã xác thực và cấp quyền truy cập vào trung tâm điều phối vận tải.
            </p>
          </div>

          {/* Quick Action: Test Refresh Token */}
          <div className="shrink-0">
            <button
              onClick={handleTestRefreshToken}
              disabled={isRefreshingNow}
              className="px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-medium flex items-center gap-2 transition-all glow-cyan disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingNow ? 'animate-spin' : ''}`} />
              <span>Test Refresh Token (Live)</span>
            </button>
          </div>
        </div>

        {refreshLog && (
          <div className="mt-4 p-3 rounded-xl bg-gray-950/80 border border-gray-800 text-xs font-mono text-cyan-300 whitespace-pre-line animate-fadeIn">
            {refreshLog}
          </div>
        )}
      </div>

      {/* KPI Cards: Session & Auth Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel rounded-2xl p-5 border border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400">Tài Khoản Hiện Tại</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-white truncate">{user?.email}</div>
          <div className="text-xs text-gray-500 mt-1 font-mono">ID: {user?._id}</div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400">Vai Trò & Quyền Hạn</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-emerald-400">{user?.role?.name}</div>
          <div className="text-xs text-gray-500 mt-1">
            Tổng cộng: <span className="text-white font-medium">{user?.permissions?.length ?? 0}</span> quyền được cấp
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400">Cơ Chế Bảo Mật Token</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-semibold text-purple-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            JWT + Cookie Refresh
          </div>
          <div className="text-xs text-gray-500 mt-1 truncate font-mono">
            Token: {accessToken ? `${accessToken.substring(0, 20)}...` : 'Chưa có'}
          </div>
        </div>
      </div>

      {/* Permissions List Grid (Visualized) */}
      <div className="glass-panel rounded-2xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <span>Danh Sách Quyền Hạn Của Tài Khoản (RBAC Matrix)</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Các API Endpoints mà tài khoản này có thẩm quyền thực thi trên Backend
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono">
            {user?.permissions?.length || 0} permissions
          </span>
        </div>

        {user?.permissions && user.permissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {user.permissions.map((perm) => (
              <div
                key={perm._id || `${perm.method}-${perm.apiPath}`}
                className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-gray-700 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-200 truncate">
                    {perm.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getMethodBadgeClass(
                      perm.method
                    )}`}
                  >
                    {perm.method}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <code className="text-[10px] text-cyan-300 font-mono truncate max-w-[180px]">
                    {perm.apiPath}
                  </code>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">
                    {perm.module}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-500">
            Không tìm thấy danh sách quyền hạn chi tiết hoặc tài khoản chưa được gán quyền.
          </div>
        )}
      </div>
    </div>
  );
};
