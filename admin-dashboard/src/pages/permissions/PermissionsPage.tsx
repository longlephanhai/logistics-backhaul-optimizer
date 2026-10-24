import React, { useState, useEffect, useMemo } from 'react';
import { permissionService } from '@/services/permissionService';
import { roleService } from '@/services/roleService';
import type { IPermission, IRole } from '@/types/auth';
import {
  KeyRound,
  Shield,
  Save,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Info,
  Layers,
  Filter,
} from 'lucide-react';

export const PermissionsPage = () => {
  const [roles, setRoles] = useState<IRole[]>([]);
  const [permissions, setPermissions] = useState<IPermission[]>([]);
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);


  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [roleRes, permRes] = await Promise.all([
        roleService.getRoles(1, 50),
        permissionService.getPermissions(1, 200),
      ]);

      const roleList = roleRes.result || [];
      const permList = permRes.result || [];

      setRoles(roleList);
      setPermissions(permList);

      if (roleList.length > 0) {
        handleSelectRole(roleList[0]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (role: IRole) => {
    setSelectedRole(role);
    const permIds = (role.permissions || []).map((p: any) =>
      typeof p === 'string' ? p : p._id
    );
    setSelectedPermissionIds(permIds);
  };


  const groupedPermissions = useMemo(() => {
    const groups: Record<string, IPermission[]> = {};
    permissions.forEach((perm) => {
      const mod = perm.module || 'OTHER';
      if (!groups[mod]) {
        groups[mod] = [];
      }
      groups[mod].push(perm);
    });
    return groups;
  }, [permissions]);


  const togglePermission = (permId: string) => {
    if (!selectedRole) return;
    setSelectedPermissionIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };


  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      setSaving(true);
      await roleService.updateRole(selectedRole._id, {
        permissions: selectedPermissionIds,
      });


      setRoles((prev) =>
        prev.map((r) =>
          r._id === selectedRole._id
            ? { ...r, permissions: selectedPermissionIds }
            : r
        )
      );

      setToastMessage(`Đã cập nhật phân quyền thành công cho vai trò: ${selectedRole.name}`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      alert(`Lỗi khi lưu: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const coveragePercent = permissions.length
    ? Math.round((selectedPermissionIds.length / permissions.length) * 100)
    : 0;

  const methods = ['GET', 'POST', 'PATCH', 'DELETE'];

  const getMethodBadgeStyle = (method: string) => {
    switch (method) {
      case 'GET':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'POST':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'PATCH':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'DELETE':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-gray-400 gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-xs">Đang tải ma trận phân quyền...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium mb-3">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Phân Hệ RBAC Matrix 2D</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Ma Trận Quyền Hạn Trực Quan
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Chọn vai trò bên dưới và bấm trực tiếp vào từng ô để kích hoạt hoặc chặn quyền truy cập API trên từng phân hệ.
            </p>
          </div>

          {/* Action: Save Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSavePermissions}
              disabled={saving || !selectedRole}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Lưu Cập Nhật Phân Quyền</span>
            </button>
          </div>
        </div>

        {toastMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Role Selector Deck & Coverage KPI */}
      <div className="glass-panel rounded-2xl p-5 border border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Chọn Vai Trò Cần Cấu Hình:</span>
          </div>

          {/* Coverage Bar */}
          {selectedRole && (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-400">Độ Phủ Quyền Hạn:</span>
              <div className="w-36 h-2.5 rounded-full bg-gray-800 overflow-hidden border border-gray-700">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${coveragePercent}%` }}
                />
              </div>
              <span className="font-mono font-bold text-cyan-400">
                {selectedPermissionIds.length}/{permissions.length} ({coveragePercent}%)
              </span>
            </div>
          )}
        </div>

        {/* Roles Pill Tabs */}
        <div className="flex flex-wrap gap-2.5">
          {roles.map((r) => {
            const isSelected = selectedRole?._id === r._id;
            const rPermCount = (r.permissions || []).length;
            return (
              <button
                key={r._id}
                onClick={() => handleSelectRole(r)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2.5 border ${isSelected
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-md glow-cyan'
                  : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                  }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400 animate-pulse' : 'bg-gray-600'}`} />
                <span>{r.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">
                  {rPermCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2D Matrix Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-gray-800">
        <div className="p-4 border-b border-gray-800/80 bg-gray-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Ma Trận Quyền Theo Phân Hệ & Hành Động</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/50" />
              <span>Được phép</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-gray-800/50 border border-gray-700" />
              <span>Bị chặn</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950/60 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3.5 px-6 font-semibold w-64">Phân Hệ (Module)</th>
                {methods.map((method) => (
                  <th key={method} className="py-3.5 px-4 font-semibold text-center w-48">
                    <span className={`px-2 py-0.5 rounded border ${getMethodBadgeStyle(method)} font-mono`}>
                      {method}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {Object.entries(groupedPermissions).map(([modName, modPerms]) => (
                <tr key={modName} className="hover:bg-gray-800/30 transition-colors">
                  {/* Module Name */}
                  <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{modName}</span>
                    <span className="text-[10px] text-gray-500 font-normal ml-1">
                      ({modPerms.length} endpoints)
                    </span>
                  </td>

                  {/* Columns for GET, POST, PATCH, DELETE */}
                  {methods.map((m) => {
                    const matchedPerm = modPerms.find(
                      (p) => p.method?.toUpperCase() === m
                    );

                    if (!matchedPerm) {
                      return (
                        <td key={m} className="py-4 px-4 text-center">
                          <span className="text-gray-600 text-xs">—</span>
                        </td>
                      );
                    }

                    const isAllowed = selectedPermissionIds.includes(matchedPerm._id);

                    return (
                      <td key={m} className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => togglePermission(matchedPerm._id)}
                          className={`group w-full py-2 px-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${isAllowed
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm'
                            : 'bg-gray-900/40 border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300'
                            }`}
                        >
                          {isAllowed ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Cho phép</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-400" />
                              <span>Chặn</span>
                            </>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
