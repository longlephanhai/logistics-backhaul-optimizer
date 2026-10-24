import React, { useState, useEffect } from 'react';
import type { IRole } from '@/types/auth';
import { roleService } from '@/services/roleService';
import { Edit3, Loader2, X } from 'lucide-react';

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role: IRole | null;
}

export const EditRoleModal = ({
  isOpen,
  onClose,
  onSuccess,
  role,
}: EditRoleModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description || '');
      setIsActive(role.isActive !== false);
    }
  }, [role]);

  if (!isOpen || !role) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      alert('Vui lòng nhập tên và mô tả vai trò');
      return;
    }

    try {
      setSubmitting(true);
      await roleService.updateRole(role._id, {
        name: name.trim().toUpperCase(),
        description: description.trim(),
        isActive,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(`Lỗi khi cập nhật vai trò: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel rounded-2xl p-6 w-full max-w-md border border-gray-800 relative shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white">Chỉnh Sửa Vai Trò</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          Cập nhật tên và miêu tả vai trò tài khoản.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Tên vai trò *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-900/80 border border-gray-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Mô tả vai trò *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-900/80 border border-gray-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="roleActiveCheckbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded bg-gray-900 border-gray-700 text-purple-500 focus:ring-0"
            />
            <label htmlFor="roleActiveCheckbox" className="text-xs text-gray-300 cursor-pointer">
              Kích hoạt vai trò này
            </label>
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
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit3 className="w-3.5 h-3.5" />}
              <span>Lưu Thay Đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
