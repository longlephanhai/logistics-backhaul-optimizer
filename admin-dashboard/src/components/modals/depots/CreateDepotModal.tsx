import React, { useState } from 'react';
import { DepotStatus } from '@/types/depot';
import { depotService } from '@/services/depotService';
import { Warehouse, Loader2, X, MapPin, Phone, User, Hash, Navigation } from 'lucide-react';

interface CreateDepotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CITY_PRESETS = [
  { name: 'Hà Nội', lng: 105.8544, lat: 21.0285 },
  { name: 'Đà Nẵng', lng: 108.2022, lat: 16.0544 },
  { name: 'TP. Hồ Chí Minh', lng: 106.6297, lat: 10.8231 },
  { name: 'Hải Phòng', lng: 106.6881, lat: 20.8449 },
  { name: 'Bình Dương', lng: 106.6667, lat: 11.0000 },
  { name: 'Cần Thơ', lng: 105.7838, lat: 10.0452 },
];

export const CreateDepotModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateDepotModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lng, setLng] = useState<number | string>(108.2022);
  const [lat, setLat] = useState<number | string>(16.0544);
  const [capacityTrucks, setCapacityTrucks] = useState<number | string>(30);
  const [status, setStatus] = useState<DepotStatus>(DepotStatus.ACTIVE);
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  if (!isOpen) return null;

  const handleApplyPreset = (presetLng: number, presetLat: number, presetName: string) => {
    setLng(presetLng);
    setLat(presetLat);
    if (!address) {
      setAddress(`Khu công nghiệp / Trung tâm Logistics ${presetName}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên bãi xe');
      return;
    }
    if (!address.trim()) {
      alert('Vui lòng nhập địa chỉ bãi xe');
      return;
    }
    const numLng = Number(lng);
    const numLat = Number(lat);
    const numCapacity = Number(capacityTrucks);

    if (isNaN(numLng) || isNaN(numLat)) {
      alert('Tọa độ kinh độ và vĩ độ phải là số hợp lệ');
      return;
    }
    if (isNaN(numCapacity) || numCapacity <= 0) {
      alert('Sức chứa bãi xe phải là số nguyên dương >= 1');
      return;
    }

    try {
      setSubmitting(true);
      await depotService.createDepot({
        name: name.trim(),
        address: address.trim(),
        location: {
          type: 'Point',
          coordinates: [numLng, numLat],
        },
        capacityTrucks: numCapacity,
        status,
        contactPerson: contactPerson.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
      });

      // Reset
      setName('');
      setAddress('');
      setContactPerson('');
      setContactPhone('');
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi tạo bãi xe';
      alert(`Lỗi: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#131d35]/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Thêm Mới Bãi Xe (Depot)</h3>
              <p className="text-xs text-gray-400">Khởi tạo trạm trung chuyển / bãi đỗ tập kết phương tiện</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
              <Warehouse className="w-3.5 h-3.5 text-cyan-400" />
              Tên Bãi Xe / Trung Tâm Logistics <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Depot Cảng Tiên Sa Đà Nẵng, Kho ICD Sóng Thần..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/80 border border-gray-700/80 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Địa Chỉ Chi Tiết <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Số nhà, tên đường, khu công nghiệp, quận/huyện, tỉnh/thành..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/80 border border-gray-700/80 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          {/* Coordinates & Presets */}
          <div className="p-3.5 rounded-xl bg-gray-950/60 border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-sky-400" />
                Tọa Độ Vị Trí Địa Lý (GeoJSON 2dsphere)
              </div>
              <span className="text-[11px] text-gray-400 font-mono">[Longitude, Latitude]</span>
            </div>

            {/* Quick Presets */}
            <div>
              <div className="text-[11px] text-gray-400 mb-1.5">Chọn nhanh tọa độ trung tâm:</div>
              <div className="flex flex-wrap gap-1.5">
                {CITY_PRESETS.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => handleApplyPreset(city.lng, city.lat, city.name)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-gray-800 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/40 border border-gray-700/60 text-gray-300 transition-colors"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-400">Kinh độ (Longitude - X) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="108.2022"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400">Vĩ độ (Latitude - Y) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="16.0544"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-amber-400" />
                Sức Chứa Tối Đa (Số Xe) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={capacityTrucks}
                onChange={(e) => setCapacityTrucks(e.target.value)}
                placeholder="Ví dụ: 30"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/80 border border-gray-700/80 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300">Trạng Thái Hoạt Động</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DepotStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/80 border border-gray-700/80 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value={DepotStatus.ACTIVE}>ACTIVE (Đang hoạt động)</option>
                <option value={DepotStatus.INACTIVE}>INACTIVE (Tạm ngưng)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-400" />
                Người Liên Hệ / Quản Lý Bãi
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/80 border border-gray-700/80 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                Số Điện Thoại Trực Bãi
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Ví dụ: 0912345678"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/80 border border-gray-700/80 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Warehouse className="w-4 h-4" />
                  <span>Tạo Bãi Xe</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
