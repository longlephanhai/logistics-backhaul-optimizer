import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roleService } from '@/services/roleService';
import type { IRole } from '@/types/auth';
import {
  Shield,
  Plus,
  CheckCircle,
  XCircle,
  Loader2,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';

export const RolesPage = () => {
  const [roles, setRoles] = useState<IRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await roleService.getRoles(1, 50);
      setRoles(res.result || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    try {
      setSubmitting(true);
      await roleService.createRole({
        name: newRoleName.trim().toUpperCase(),
        description: newRoleDesc.trim(),
        isActive: true,
        permissions: [],
      });
      setIsModalOpen(false);
      setNewRoleName('');
      setNewRoleDesc('');
      fetchRoles();
    } catch (err: any) {
      alert(`Lỗi khi tạo vai trò: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleCardTheme = (roleName: string) => {
    switch (roleName) {
      case 'SUPER_ADMIN':
        return {
          glow: 'glow-cyan',
          border: 'border-purple-500/40 hover:border-purple-500/70',
          badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          gradient: 'from-purple-500 to-indigo-600',
        };
      case 'CARRIER':
        return {
          glow: 'glow-cyan',
          border: 'border-cyan-500/40 hover:border-cyan-500/70',
          badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          gradient: 'from-cyan-500 to-blue-600',
        };
      case 'SHIPPER':
        return {
          glow: 'glow-emerald',
          border: 'border-emerald-500/40 hover:border-emerald-500/70',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          gradient: 'from-emerald-500 to-teal-600',
        };
      case 'DRIVER':
        return {
          glow: 'glow-amber',
          border: 'border-amber-500/40 hover:border-amber-500/70',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          gradient: 'from-amber-500 to-orange-600',
        };
      default:
        return {
          glow: '',
          border: 'border-gray-800 hover:border-gray-700',
          badge: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
          gradient: 'from-gray-600 to-gray-800',
        };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-medium mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>Phân Hệ Vai Trò (Roles)</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Bộ Thẻ Năng Lực Vai Trò (Role Power Deck)
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Quản lý các cấp bậc tài khoản, cấu hình quyền hạn và phân bổ vai trò trong chuỗi cung ứng logistics.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Vai Trò Mới</span>
          </button>
        </div>
      </div>

      {/* Role Power Deck Grid */}
      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center text-gray-400 gap-3">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <span className="text-xs">Đang tải danh sách vai trò...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => {
            const theme = getRoleCardTheme(role.name);
            const permCount = (role.permissions || []).length;
            // Tính toán tỷ lệ dựa trên giả định 15 quyền hệ thống
            const coverage = Math.min(100, Math.round((permCount / 15) * 100));

            return (
              <div
                key={role._id}
                className={`glass-panel rounded-2xl p-6 border transition-all relative overflow-hidden flex flex-col justify-between group ${theme.border}`}
              >
                {/* Top Badge & Status */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${theme.badge}`}>
                      {role.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                      {role.isActive !== false ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Kích hoạt</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-500">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Vô hiệu</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5">
                    {role.name}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 min-h-[32px] leading-relaxed">
                    {role.description || 'Chưa có mô tả cho vai trò này.'}
                  </p>
                </div>

                {/* Permission Coverage Bar */}
                <div className="my-5 pt-4 border-t border-gray-800">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-400 font-medium">Độ Phủ Quyền Hạn:</span>
                    <span className="font-mono font-bold text-white">
                      {permCount} quyền ({coverage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-900 border border-gray-800 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-500`}
                      style={{ width: `${coverage}%` }}
                    />
                  </div>
                </div>

                {/* Footer Action */}
                <button
                  onClick={() => navigate('/dashboard/permissions')}
                  className="w-full py-2.5 px-3 rounded-xl bg-gray-900/80 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-xs text-gray-300 font-medium transition-all flex items-center justify-center gap-2 group-hover:text-white"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Cấu Hình Ma Trận Quyền</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Thêm Role Mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-md border border-gray-800 relative shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1">Tạo Vai Trò Mới</h2>
            <p className="text-xs text-gray-400 mb-5">
              Thêm vai trò mới vào hệ thống quản lý phân quyền logistics.
            </p>

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Tên vai trò (Ví dụ: DISPATCHER, CARRIER, SHIPPER)
                </label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="DISPATCHER"
                  className="w-full px-3.5 py-2.5 bg-gray-900/80 border border-gray-700/80 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Mô tả vai trò
                </label>
                <textarea
                  rows={3}
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Điều phối viên quản lý ghép chuyến..."
                  className="w-full px-3.5 py-2.5 bg-gray-900/80 border border-gray-700/80 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Tạo Mới</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
