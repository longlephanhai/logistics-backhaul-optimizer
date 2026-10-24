import React, { useState, useEffect } from 'react';
import { VehicleType, VehicleStatus } from '@/types/vehicle';
import type { IDepot } from '@/types/depot';
import type { IUser } from '@/types/auth';
import { vehicleService } from '@/services/vehicleService';
import { depotService } from '@/services/depotService';
import { userService } from '@/services/userService';
import {
  Truck,
  Loader2,
  X,
  Gauge,
  Box,
  Fuel,
  Coins,
  ShieldCheck,
  User,
  Warehouse,
  Ruler,
} from 'lucide-react';

interface CreateVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateVehicleModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateVehicleModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Available options
  const [users, setUsers] = useState<IUser[]>([]);
  const [depots, setDepots] = useState<IDepot[]>([]);

  // Form states
  const [plateNumber, setPlateNumber] = useState('');
  const [modelName, setModelName] = useState('');
  const [owner, setOwner] = useState('');
  const [driver, setDriver] = useState('');
  const [currentDepot, setCurrentDepot] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.CLOSED_BOX);
  const [maxWeightKg, setMaxWeightKg] = useState<number | string>(8000);
  const [maxVolumeCbm, setMaxVolumeCbm] = useState<number | string>(42);
  const [lengthM, setLengthM] = useState<number | string>(7.5);
  const [widthM, setWidthM] = useState<number | string>(2.35);
  const [heightM, setHeightM] = useState<number | string>(2.5);
  const [fuelEmptyRate, setFuelEmptyRate] = useState<number | string>(15);
  const [fuelFullRate, setFuelFullRate] = useState<number | string>(21);
  const [costPerKm, setCostPerKm] = useState<number | string>(16000);
  const [status, setStatus] = useState<VehicleStatus>(VehicleStatus.IDLE);
  const [rating, setRating] = useState<number | string>(5.0);

  useEffect(() => {
    if (isOpen) {
      loadDependencies();
    }
  }, [isOpen]);

  const loadDependencies = async () => {
    try {
      setLoadingOptions(true);
      const [userRes, depotList] = await Promise.all([
        userService.getUsers(1, 100),
        depotService.getAllDepotsSimple(),
      ]);
      const fetchedUsers = userRes.result || [];
      setUsers(fetchedUsers);
      setDepots(depotList || []);

      if (fetchedUsers.length > 0 && !owner) {
        setOwner(fetchedUsers[0]._id);
      }
      if (depotList.length > 0 && !currentDepot) {
        setCurrentDepot(depotList[0]._id);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách users/depots:', err);
    } finally {
      setLoadingOptions(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPlate = plateNumber.trim().toUpperCase();
    if (!formattedPlate) {
      alert('Vui lòng nhập biển số xe');
      return;
    }
    if (!owner) {
      alert('Vui lòng chọn chủ sở hữu xe');
      return;
    }

    const numWeight = Number(maxWeightKg);
    const numVolume = Number(maxVolumeCbm);
    const numCost = Number(costPerKm);
    const numFuelEmpty = Number(fuelEmptyRate);
    const numFuelFull = Number(fuelFullRate);

    if (isNaN(numWeight) || numWeight < 100 || numWeight > 30000) {
      alert('Tải trọng tối đa phải từ 100 kg đến 30,000 kg (30 tấn)');
      return;
    }
    if (isNaN(numVolume) || numVolume < 1 || numVolume > 200) {
      alert('Thể tích thùng phải từ 1 m³ đến 200 m³');
      return;
    }
    if (isNaN(numCost) || numCost < 1000) {
      alert('Đơn giá vận hành mỗi km tối thiểu 1,000 VNĐ');
      return;
    }

    try {
      setSubmitting(true);
      await vehicleService.createVehicle({
        plateNumber: formattedPlate,
        modelName: modelName.trim() || undefined,
        owner,
        driver: driver || undefined,
        currentDepot: currentDepot || undefined,
        vehicleType,
        maxWeightKg: numWeight,
        maxVolumeCbm: numVolume,
        lengthM: Number(lengthM) || undefined,
        widthM: Number(widthM) || undefined,
        heightM: Number(heightM) || undefined,
        fuelEmptyRate: numFuelEmpty,
        fuelFullRate: numFuelFull,
        costPerKm: numCost,
        status,
        rating: Number(rating) || 5.0,
      });

      // Reset
      setPlateNumber('');
      setModelName('');
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi tạo phương tiện';
      alert(`Lỗi: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#0f172a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#131d35]/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-600 text-white shadow-lg shadow-cyan-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Thêm Mới Phương Tiện Vận Tải</h3>
              <p className="text-xs text-gray-400">Đăng ký xe tải vào đội xe tối ưu hóa ghép chuyến</p>
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Section 1: Identification & Personnel */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              1. Thông Tin Định Danh & Phân Công Nhân Sự
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-300">
                  Biển Số Xe <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                  placeholder="Ví dụ: 29C-888.88, 51D-123.45"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-sm font-mono font-bold text-cyan-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500 uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300">Model / Hãng Xe</label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="Ví dụ: Hino 500 Series, Isuzu Giga, Hyundai HD120"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  Chủ Sở Hữu (Carrier/Doanh Nghiệp) <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Chọn chủ xe --</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email}) - {u.role?.name || 'USER'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  Tài Xế Phụ Trách (Driver)
                </label>
                <select
                  value={driver}
                  onChange={(e) => setDriver(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Chưa gán tài xế --</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email}) - {u.role?.name || 'USER'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Body Type & Specs */}
          <div className="space-y-3 pt-3 border-t border-gray-800">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Box className="w-4 h-4" />
              2. Kiểu Thùng & Thông Số Tải Trọng Kỹ Thuật
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-300">Loại Thùng Xe *</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value={VehicleType.CLOSED_BOX}>Thùng Kín (CLOSED_BOX)</option>
                  <option value={VehicleType.TARPAULIN}>Thùng Mui Bạt (TARPAULIN)</option>
                  <option value={VehicleType.REFRIGERATED}>Đông Lạnh (REFRIGERATED)</option>
                  <option value={VehicleType.FLATBED}>Sàn Phẳng / Container (FLATBED)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  Tải Trọng Tối Đa (kg) *
                </label>
                <input
                  type="number"
                  min="100"
                  max="30000"
                  required
                  value={maxWeightKg}
                  onChange={(e) => setMaxWeightKg(e.target.value)}
                  placeholder="Ví dụ: 8000"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
                  <Box className="w-3.5 h-3.5 text-emerald-400" />
                  Thể Tích Thùng (m³) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="200"
                  required
                  value={maxVolumeCbm}
                  onChange={(e) => setMaxVolumeCbm(e.target.value)}
                  placeholder="Ví dụ: 42"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Dài x Rộng x Cao */}
            <div className="p-3.5 rounded-xl bg-gray-950/60 border border-gray-800">
              <div className="text-xs font-medium text-gray-300 flex items-center gap-1.5 mb-2">
                <Ruler className="w-3.5 h-3.5 text-amber-400" />
                Kích Thước Thùng Xe (Dài x Rộng x Cao mét) - Phục vụ thuật toán 2.5D Bin Packing
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-[11px] text-gray-400">Chiều Dài (m)</span>
                  <input
                    type="number"
                    step="0.05"
                    value={lengthM}
                    onChange={(e) => setLengthM(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-xs text-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-gray-400">Chiều Rộng (m)</span>
                  <input
                    type="number"
                    step="0.05"
                    value={widthM}
                    onChange={(e) => setWidthM(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-xs text-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-gray-400">Chiều Cao (m)</span>
                  <input
                    type="number"
                    step="0.05"
                    value={heightM}
                    onChange={(e) => setHeightM(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Cost, Fuel (ESG CO2) & Depot */}
          <div className="space-y-3 pt-3 border-t border-gray-800">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-4 h-4" />
              3. Định Mức Vận Hành & Khí Thải CO2 (ISO 14083)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-teal-400" />
                  Dầu Chạy Rỗng (L/100km) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  required
                  value={fuelEmptyRate}
                  onChange={(e) => setFuelEmptyRate(e.target.value)}
                  placeholder="15"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-emerald-400" />
                  Dầu Đầy Tải (L/100km) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  required
                  value={fuelFullRate}
                  onChange={(e) => setFuelFullRate(e.target.value)}
                  placeholder="21"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  Đơn Giá (VNĐ/km) *
                </label>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  required
                  value={costPerKm}
                  onChange={(e) => setCostPerKm(e.target.value)}
                  placeholder="16000"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-sm font-mono text-amber-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
                  <Warehouse className="w-3.5 h-3.5 text-blue-400" />
                  Bãi Xe Tập Kết Hiện Tại
                </label>
                <select
                  value={currentDepot}
                  onChange={(e) => setCurrentDepot(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Chưa gắn bãi xe --</option>
                  {depots.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.capacityTrucks} chỗ)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300">Trạng Thái Sẵn Sàng</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value={VehicleStatus.IDLE}>IDLE (Rảnh - Sẵn sàng ghép)</option>
                  <option value={VehicleStatus.IN_TRANSIT}>IN_TRANSIT (Đang vận chuyển)</option>
                  <option value={VehicleStatus.MAINTENANCE}>MAINTENANCE (Bảo dưỡng)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300">Điểm Uy Tín Ban Đầu (1.0 - 5.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
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
              className="px-5 py-2.5 rounded-xl text-xs font-medium bg-gradient-to-r from-cyan-500 to-emerald-600 hover:from-cyan-400 hover:to-emerald-500 text-white shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang đăng ký...</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span>Đăng Ký Phương Tiện</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
