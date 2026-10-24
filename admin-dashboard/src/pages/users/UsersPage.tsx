import React, { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import { roleService } from '@/services/roleService';
import type { IUser, IRole } from '@/types/auth';
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
  CheckCircle,
  Truck,
  Package,
  UserCheck,
} from 'lucide-react';

export const UsersPage = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [roles, setRoles] = useState<IRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, roleRes] = await Promise.all([
        userService.getUsers(1, 100),
        roleService.getRoles(1, 50),
      ]);
      setUsers(userRes.result || []);
      const roleList = roleRes.result || [];
      setRoles(roleList);
      if (roleList.length > 0) {
        setNewRole(roleList[0]._id);
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newRole) return;

    try {
      setSubmitting(true);
      await userService.createUser({
        name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword,
        role: newRole,
        phone: newPhone.trim(),
      });
      setIsModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      fetchData();
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${name}" không?`)) return;
    try {
      await userService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const filteredUsers = users.filter((u) => {
    const userRoleName = getUserRoleName(u);
    const matchSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());

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
              <span>Phân Hệ Tài Khoản & Định Danh</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Quản Lý Người Dùng & Nhân Lực Logistics
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Hệ thống quản lý định danh người dùng: Quản trị viên, Chủ xe vận tải (Carriers), Chủ hàng (Shippers) và Tài xế.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Người Dùng</span>
          </button>
        </div>
      </div>

      {/* Filter Bar & View Mode Switcher */}
      <div className="glass-panel rounded-2xl p-4 border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="w-full pl-10 pr-4 py-2 bg-gray-900/60 border border-gray-700/60 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter by Role & View Switcher */}
        <div className="flex items-center gap-3">
          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setSelectedRoleFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedRoleFilter === 'ALL'
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedRoleFilter === r.name
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                  {r.name} ({count})
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-gray-900 border border-gray-800 shrink-0">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'card' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-500 hover:text-gray-300'
                }`}
              title="Chế độ thẻ ID Badges"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-500 hover:text-gray-300'
                }`}
              title="Chế độ bảng chi tiết"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
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
        /* CARD VIEW: Logistics ID Badges */
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
                  {/* Header Card */}
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

                    {/* Role Badge */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${badge.classes}`}>
                      {badge.icon}
                      <span>{roleName}</span>
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 py-3 border-y border-gray-800/80 text-xs">
                    <div className="flex items-center gap-2 text-gray-300 truncate">
                      <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action */}
                <div className="mt-4 pt-1 flex items-center justify-between text-[11px] text-gray-500">
                  <span className="font-mono text-[10px] truncate max-w-[150px]">
                    ID: {user._id}
                  </span>
                  {user.email !== 'admin@gmail.com' && (
                    <button
                      onClick={() => handleDeleteUser(user._id, user.name)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Xóa người dùng"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
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
                        {user.email !== 'admin@gmail.com' && (
                          <button
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Thêm User Mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-md border border-gray-800 relative shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1">Thêm Người Dùng Mới</h2>
            <p className="text-xs text-gray-400 mb-5">
              Tạo tài khoản quản trị, chủ hàng hoặc tài xế mới trên hệ thống.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3.5 py-2.5 bg-gray-900/80 border border-gray-700/80 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="carrier@logistics.vn"
                  className="w-full px-3.5 py-2.5 bg-gray-900/80 border border-gray-700/80 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Mật khẩu khởi tạo
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-900/80 border border-gray-700/80 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Số điện thoại (tùy chọn)
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="0912345678"
                  className="w-full px-3.5 py-2.5 bg-gray-900/80 border border-gray-700/80 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Gán vai trò (Role)
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-900/80 border border-gray-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {roles.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name} - {r.description}
                    </option>
                  ))}
                </select>
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
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Thêm Mới</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
