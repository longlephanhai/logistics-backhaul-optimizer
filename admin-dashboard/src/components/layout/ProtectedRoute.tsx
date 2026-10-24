import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { Loader2, Truck } from 'lucide-react';

import React from 'react';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isInitialLoading } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (isInitialLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#070b14] text-white">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center glow-cyan animate-pulse">
            <Truck className="w-8 h-8 text-cyan-400" />
          </div>
          <Loader2 className="w-20 h-20 text-cyan-500 animate-spin absolute -inset-2 opacity-50" />
        </div>
        <div className="text-sm font-medium text-gray-300">Đang khởi tạo phiên làm việc...</div>
        <div className="text-xs text-gray-500 mt-1">Xác thực Token & Tải danh sách quyền hạn</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
