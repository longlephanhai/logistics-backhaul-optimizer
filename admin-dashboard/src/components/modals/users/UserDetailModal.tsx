import React, { useState, useEffect } from 'react';
import type { IUser, IRole } from '@/types/auth';
import { userService } from '@/services/userService';
import { Eye, Loader2, MapPin, X } from 'lucide-react';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  roles: IRole[];
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  userId,
  roles,
}) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadUserDetail(userId);
    } else {
      setUser(null);
    }
  }, [isOpen, userId]);

  const loadUserDetail = async (id: string) => {
    try {
      setLoading(true);
      const res = await userService.getUserById(id);
      setUser(res);
    } catch (err: any) {
      alert(`Lỗi xem chi tiết: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = () => {
    if (!user) return 'NORMAL_USER';
    if (typeof user.role === 'object' && user.role?.name) return user.role.name;
    const roleId = typeof user.role === 'object' ? user.role?._id : (user.role as any);
    const matched = roles.find((r) => r._id === roleId);
    return matched?.name || 'NORMAL_USER';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel rounded-2xl p-6 w-full max-w-md border border-gray-800 relative shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Hồ Sơ Định Danh Người Dùng</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading || !user ? (
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/60 border border-gray-800">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-600 flex items-center justify-center text-white font-bold text-base">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-white">{user.name}</div>
                <div className="text-[11px] text-gray-400 font-mono">{user.email}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800">
                <span className="text-[10px] text-gray-500 uppercase font-medium">Vai trò</span>
                <div className="text-cyan-400 font-bold mt-1">
                  {getRoleName()}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800">
                <span className="text-[10px] text-gray-500 uppercase font-medium">Số điện thoại</span>
                <div className="text-gray-200 mt-1 font-mono">
                  {user.phone || 'Chưa cập nhật'}
                </div>
              </div>
            </div>

            {user.address && (
              <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-medium">Địa chỉ</span>
                  <div className="text-gray-200 mt-0.5">{user.address}</div>
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800 space-y-1 font-mono text-[11px] text-gray-400">
              <div>ObjectId: <span className="text-gray-300">{user._id}</span></div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
