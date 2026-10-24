import React, { useState, useEffect } from 'react';
import type { IRole } from '@/types/auth';
import { roleService } from '@/services/roleService';
import { KeyRound, Loader2, X } from 'lucide-react';

interface RoleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: string | null;
}

export const RoleDetailModal: React.FC<RoleDetailModalProps> = ({
  isOpen,
  onClose,
  roleId,
}) => {
  const [role, setRole] = useState<IRole | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && roleId) {
      loadRoleDetail(roleId);
    } else {
      setRole(null);
    }
  }, [isOpen, roleId]);

  const loadRoleDetail = async (id: string) => {
    try {
      setLoading(true);
      const res = await roleService.getRoleById(id);
      setRole(res);
    } catch (err: any) {
      alert(`Lỗi xem chi tiết: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel rounded-2xl p-6 w-full max-w-lg border border-gray-800 relative shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-purple-400" />
            <span>Chi Tiết Vai Trò & Danh Sách Quyền Hạn</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading || !role ? (
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-white">{role.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  ID: {role._id}
                </span>
              </div>
              <p className="text-gray-400 text-xs">{role.description}</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
                  Các quyền được cấp ({(role.permissions || []).length})
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {role.permissions && role.permissions.length > 0 ? (
                  role.permissions.map((perm: any) => (
                    <div
                      key={perm._id || perm}
                      className="p-2 rounded-lg bg-gray-900/80 border border-gray-800 flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-200 truncate">{perm.name || perm}</span>
                      {perm.method && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-cyan-400">
                          {perm.method}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-xs">
                    Vai trò này chưa được cấp bất kỳ quyền hạn nào.
                  </div>
                )}
              </div>
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
