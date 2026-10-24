import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roleService } from '@/services/roleService';
import type { IRole } from '@/types/auth';
import { CreateRoleModal } from '@/components/modals/roles/CreateRoleModal';
import { EditRoleModal } from '@/components/modals/roles/EditRoleModal';
import { RoleDetailModal } from '@/components/modals/roles/RoleDetailModal';
import {
  Shield,
  Plus,
  Loader2,
  SlidersHorizontal,
  ChevronRight,
  Edit3,
  Trash2,
  Eye,
  Power,
} from 'lucide-react';

export const RolesPage = () => {
  const [roles, setRoles] = useState<IRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<IRole | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailRoleId, setDetailRoleId] = useState<string | null>(null);

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

  const handleOpenEdit = (role: IRole) => {
    setEditingRole(role);
    setIsEditOpen(true);
  };

  const handleOpenDetail = (id: string) => {
    setDetailRoleId(id);
    setIsDetailOpen(true);
  };

  const handleToggleActive = async (role: IRole) => {
    const updatedStatus = !(role.isActive !== false);
    try {
      await roleService.updateRole(role._id, {
        isActive: updatedStatus,
      });
      setRoles((prev) =>
        prev.map((r) => (r._id === role._id ? { ...r, isActive: updatedStatus } : r))
      );
    } catch (err: any) {
      alert(`Lỗi khi đổi trạng thái: ${err.message}`);
    }
  };

  const handleDeleteRole = async (role: IRole) => {
    if (role.name === 'SUPER_ADMIN') {
      alert('Không thể xóa vai trò SUPER_ADMIN của hệ thống!');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.name}" không?`)) {
      return;
    }

    try {
      await roleService.deleteRole(role._id);
      setRoles((prev) => prev.filter((r) => r._id !== role._id));
    } catch (err: any) {
      alert(`Lỗi khi xóa vai trò: ${err.message}`);
    }
  };

  const getRoleCardTheme = (roleName: string) => {
    switch (roleName) {
      case 'SUPER_ADMIN':
        return {
          border: 'border-purple-500/40 hover:border-purple-500/70',
          badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          gradient: 'from-purple-500 to-indigo-600',
        };
      case 'CARRIER':
        return {
          border: 'border-cyan-500/40 hover:border-cyan-500/70',
          badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          gradient: 'from-cyan-500 to-blue-600',
        };
      case 'SHIPPER':
        return {
          border: 'border-emerald-500/40 hover:border-emerald-500/70',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          gradient: 'from-emerald-500 to-teal-600',
        };
      case 'DRIVER':
        return {
          border: 'border-amber-500/40 hover:border-amber-500/70',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          gradient: 'from-amber-500 to-orange-600',
        };
      default:
        return {
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
              <span>Phân Hệ Vai Trò & Cấp Bậc</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Bộ Thẻ Năng Lực Vai Trò (Role Power Deck)
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Hỗ trợ đầy đủ các thao tác Thêm vai trò mới, Xem chi tiết quyền, Chỉnh sửa thông tin, Bật/tắt kích hoạt và Xóa vai trò.
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
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
            const coverage = Math.min(100, Math.round((permCount / 15) * 100));
            const isActive = role.isActive !== false;

            return (
              <div
                key={role._id}
                className={`glass-panel rounded-2xl p-6 border transition-all relative overflow-hidden flex flex-col justify-between group shadow-lg ${theme.border}`}
              >
                <div>
                  {/* Top Badge & Active Toggle Switch */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${theme.badge}`}>
                      {role.name}
                    </span>

                    <button
                      onClick={() => handleToggleActive(role)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all border ${
                        isActive
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : 'bg-gray-800 border-gray-700 text-gray-500'
                      }`}
                      title="Bấm để bật/tắt kích hoạt vai trò"
                    >
                      <Power className="w-3 h-3" />
                      <span>{isActive ? 'Kích hoạt' : 'Vô hiệu'}</span>
                    </button>
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

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/dashboard/permissions')}
                    className="w-full py-2.5 px-3 rounded-xl bg-gray-900/80 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-xs text-gray-300 font-medium transition-all flex items-center justify-center gap-2 group-hover:text-white"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cấu Hình Ma Trận Quyền</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenDetail(role._id)}
                        className="px-2.5 py-1.5 rounded-lg bg-gray-900/60 hover:bg-gray-800 border border-gray-800 text-[11px] text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                        title="Xem chi tiết vai trò"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Chi tiết</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(role)}
                        className="px-2.5 py-1.5 rounded-lg bg-gray-900/60 hover:bg-gray-800 border border-gray-800 text-[11px] text-gray-400 hover:text-amber-400 transition-colors flex items-center gap-1.5"
                        title="Sửa vai trò"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Sửa</span>
                      </button>
                    </div>

                    {role.name !== 'SUPER_ADMIN' && (
                      <button
                        onClick={() => handleDeleteRole(role)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Xóa vai trò"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals tách rời */}
      <CreateRoleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchRoles}
      />

      <EditRoleModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingRole(null);
        }}
        onSuccess={fetchRoles}
        role={editingRole}
      />

      <RoleDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailRoleId(null);
        }}
        roleId={detailRoleId}
      />
    </div>
  );
};
