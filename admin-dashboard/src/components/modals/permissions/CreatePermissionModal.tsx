import React, { useState } from 'react';
import type { IPermission } from '@/types/auth';
import { permissionService } from '@/services/permissionService';
import { Plus, Loader2, X } from 'lucide-react';

interface CreatePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (created: IPermission) => void;
}

export const CreatePermissionModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreatePermissionModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [apiPath, setNewApiPath] = useState('');
  const [method, setMethod] = useState('GET');
  const [module, setModule] = useState('USERS');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !apiPath.trim() || !module.trim()) {
      alert('Vui lòng điền đầy đủ thông tin quyền hạn');
      return;
    }

    try {
      setSubmitting(true);
      const created = await permissionService.createPermission({
        name: name.trim(),
        apiPath: apiPath.trim(),
        method: method.toUpperCase(),
        module: module.trim().toUpperCase(),
      });
      setName('');
      setNewApiPath('');
      onSuccess(created);
      onClose();
    } catch (err: any) {
      alert(`Lỗi khi tạo quyền hạn: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel rounded-2xl p-6 w-full max-w-md border border-gray-800 relative shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white">Thêm Quyền Hạn Mới</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          Định nghĩa quyền truy cập API mới trên hệ thống NestJS.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Tên quyền hạn * (Ví dụ: Create Vehicle, Get Route)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Create Vehicle"
              className="w-full px-3.5 py-2.5 bg-gray-900/80 border border-gray-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Đường dẫn API (apiPath) *
            </label>
            <input
              type="text"
              required
              value={apiPath}
              onChange={(e) => setNewApiPath(e.target.value)}
              placeholder="/api/v1/vehicles"
              className="w-full px-3.5 py-2.5 bg-gray-900/80 border border-gray-700/80 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Phương thức *
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-900/80 border border-gray-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PATCH">PATCH</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Phân hệ (Module) *
              </label>
              <input
                type="text"
                required
                value={module}
                onChange={(e) => setModule(e.target.value.toUpperCase())}
                placeholder="VEHICLES"
                className="w-full px-3.5 py-2.5 bg-gray-900/80 border border-gray-700/80 rounded-xl text-xs text-white uppercase focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
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
              <span>Thêm Quyền</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
