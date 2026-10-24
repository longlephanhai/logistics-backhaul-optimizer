import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import { roleService } from '@/services/roleService';
import type { IUser, IRole } from '@/types/auth';
import { CreateUserModal } from '@/components/modals/users/CreateUserModal';
import { EditUserModal } from '@/components/modals/users/EditUserModal';
import { UserDetailModal } from '@/components/modals/users/UserDetailModal';
import {
  Users,
  LayoutGrid,
  Table as TableIcon,
  Search,
  Plus,
  Mail,
  Phone,
  Shield,
  Loader2,
  Trash2,
  Edit3,
  Eye,
  CheckCircle,
  Truck,
  Package,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const UsersPage = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [roles, setRoles] = useState<IRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const roleRes = await roleService.getRoles(1, 50);
      setRoles(roleRes.result || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const userRes = await userService.getUsers(page, pageSize, searchTerm);
      setUsers(userRes.result || []);
      if (userRes.meta) {
        setTotalPages(userRes.meta.pages || 1);
        setTotalUsers(userRes.meta.total || 0);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getUserRoleName = (u: IUser): string => {
    if (typeof u.role === 'object' && u.role?.name) {
      return u.role.name;
    }
    const roleId = typeof u.role === 'object' ? u.role?._id : (u.role as any);
    const matched = roles.find((r) => r._id === roleId);
    return matched?.name || 'NORMAL_USER';
  };

  const getRoleUserCount = (roleName: string) => {
    return users.filter((u) => getUserRoleName(u) === roleName).length;
  };

  const handleOpenEdit = (user: IUser) => {
    setEditingUser(user);
    setIsEditOpen(true);
  };

  const handleOpenDetail = (id: string) => {
    setDetailUserId(id);
    setIsDetailOpen(true);
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${name}" không?`)) return;
    try {
      await userService.deleteUser(id);
      fetchUsers(currentPage);
    } catch (err: any) {
      alert(`Lỗi khi xóa: ${err.message}`);
    }
  };

  const filteredUsers = users.filter((u) => {
    const userRoleName = getUserRoleName(u);
    const matchSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));

    const matchRole =
      selectedRoleFilter === 'ALL' ||
      userRoleName === selectedRoleFilter;

    return matchSearch && matchRole;
  });

  const getRoleBadgeStyle = (roleName: string) => {
    switch (roleName) {
      case 'SUPER_ADMIN':
        return {
          icon: <Shield className="w-3.5 h-3.5 text-purple-400" />,
          classes: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        };
      case 'NORMAL_USER':
        return {
          icon: <UserCheck className="w-3.5 h-3.5 text-emerald-400" />,
          classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        };
      case 'CARRIER':
        return {
          icon: <Truck className="w-3.5 h-3.5 text-cyan-400" />,
          classes: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        };
      case 'SHIPPER':
        return {
          icon: <Package className="w-3.5 h-3.5 text-amber-400" />,
          classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        };
      default:
        return {
          icon: <UserCheck className="w-3.5 h-3.5 text-gray-400" />,
          classes: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
        };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium mb-3">
              <Users className="w-3.5 h-3.5" />
              <span>Phân Hệ Quản Lý Người Dùng</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Quản Lý Người Dùng & Nhân Lực Logistics
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Hỗ trợ đầy đủ các thao tác Thêm, Xem chi tiết, Cập nhật thông tin, Gán quyền và Xóa người dùng.
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Người Dùng Mới</span>
          </button>
        </div>
      </div>

      {/* Filter Bar & Controls */}
      <div className="glass-panel rounded-2xl p-4 border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            className="w-full pl-10 pr-4 py-2 bg-gray-900/60 border border-gray-700/60 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Role Filter Tabs & View Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setSelectedRoleFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedRoleFilter === 'ALL'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Tất cả ({users.length})
            </button>
            {roles.map((r) => {
              const count = getRoleUserCount(r.name);
              return (
                <button
                  key={r._id}
                  onClick={() => setSelectedRoleFilter(r.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedRoleFilter === r.name
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {r.name} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center p-1 rounded-xl bg-gray-900 border border-gray-800 shrink-0">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'card' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-500 hover:text-gray-300'
              }`}
              title="Chế độ thẻ ID Badges"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-500 hover:text-gray-300'
              }`}
              title="Chế độ bảng chi tiết"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center text-gray-400 gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-xs">Đang tải danh sách tài khoản...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl border border-gray-800 text-xs text-gray-400">
          Không tìm thấy người dùng phù hợp với tiêu chí lọc.
        </div>
      ) : viewMode === 'card' ? (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((user) => {
            const roleName = getUserRoleName(user);
            const badge = getRoleBadgeStyle(roleName);

            return (
              <div
                key={user._id}
                className="glass-panel rounded-2xl p-5 border border-gray-800 hover:border-cyan-500/40 transition-all relative overflow-hidden flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md border border-cyan-400/30">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {user.name}
                        </h3>
                        <div className="inline-flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Hoạt động</span>
                        </div>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${badge.classes}`}>
                      {badge.icon}
                      <span>{roleName}</span>
                    </span>
                  </div>

                  <div className="space-y-2 py-3 border-y border-gray-800/80 text-xs">
                    <div className="flex items-center gap-2 text-gray-300 truncate">
                      <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span>{user.phone || 'Chưa cập nhật SĐT'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-1 flex items-center justify-between text-[11px] text-gray-500">
                  <span className="font-mono text-[10px] truncate max-w-[120px]">
                    ID: {user._id.substring(0, 8)}...
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenDetail(user._id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                      title="Xem chi tiết (GET /users/:id)"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                      title="Chỉnh sửa (PATCH /users/:id)"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {user.email !== 'admin@gmail.com' && (
                      <button
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Xóa người dùng (DELETE /users/:id)"
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
      ) : (
        /* TABLE VIEW */
        <div className="glass-panel rounded-2xl overflow-hidden border border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-950/60 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Tên Người Dùng</th>
                  <th className="py-3.5 px-4 font-semibold">Email</th>
                  <th className="py-3.5 px-4 font-semibold">Số Điện Thoại</th>
                  <th className="py-3.5 px-4 font-semibold">Vai Trò</th>
                  <th className="py-3.5 px-4 font-semibold">Trạng Thái</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredUsers.map((user) => {
                  const roleName = getUserRoleName(user);
                  const badge = getRoleBadgeStyle(roleName);

                  return (
                    <tr key={user._id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="py-4 px-6 font-medium text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-xs text-cyan-400 border border-gray-700">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span>{user.name}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-300 font-mono text-[11px]">{user.email}</td>
                      <td className="py-4 px-4 text-gray-300 text-xs">{user.phone || '—'}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badge.classes}`}>
                          {badge.icon}
                          <span>{roleName}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(user._id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {user.email !== 'admin@gmail.com' && (
                            <button
                              onClick={() => handleDeleteUser(user._id, user.name)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-2">
        <div>
          Hiển thị <span className="font-semibold text-white">{filteredUsers.length}</span> / {totalUsers} người dùng
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-cyan-400">
            Trang {currentPage} / {totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tách Modal thành Component con độc lập */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchUsers(1)}
        roles={roles}
      />

      <EditUserModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingUser(null);
        }}
        onSuccess={() => fetchUsers(currentPage)}
        user={editingUser}
        roles={roles}
      />

      <UserDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailUserId(null);
        }}
        userId={detailUserId}
        roles={roles}
      />
    </div>
  );
};
