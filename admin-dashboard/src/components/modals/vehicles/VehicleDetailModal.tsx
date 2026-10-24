import React, { useState, useEffect } from 'react';
import { VehicleType, VehicleStatus, type IVehicle } from '@/types/vehicle';
import { vehicleService } from '@/services/vehicleService';
import {
  Truck,
  Loader2,
  X,
  Gauge,
  Box,
  Fuel,
  Coins,
  User,
  Warehouse,
  Ruler,
  Star,
  CheckCircle2,
  Clock,
  Wrench,
  Navigation,
} from 'lucide-react';

interface VehicleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string | null;
}

const VEHICLE_TYPE_LABELS: Record<VehicleType, { label: string; color: string }> = {
  [VehicleType.CLOSED_BOX]: { label: 'Thùng Kín', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  [VehicleType.TARPAULIN]: { label: 'Mui Bạt', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  [VehicleType.REFRIGERATED]: { label: 'Đông Lạnh', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  [VehicleType.FLATBED]: { label: 'Sàn Phẳng / Container', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
};

export const VehicleDetailModal = ({
  isOpen,
  onClose,
  vehicleId,
}: VehicleDetailModalProps) => {
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<IVehicle | null>(null);

  useEffect(() => {
    if (isOpen && vehicleId) {
      fetchDetail(vehicleId);
    } else {
      setVehicle(null);
    }
  }, [isOpen, vehicleId]);

  const fetchDetail = async (id: string) => {
    try {
      setLoading(true);
      const res = await vehicleService.getVehicleById(id);
      setVehicle(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const ownerName = typeof vehicle?.owner === 'object' ? vehicle.owner?.name : 'Chưa cập nhật';
  const ownerEmail = typeof vehicle?.owner === 'object' ? vehicle.owner?.email : '';
  const driverName = typeof vehicle?.driver === 'object' ? vehicle?.driver?.name : 'Chưa phân công';
  const driverPhone = typeof vehicle?.driver === 'object' ? vehicle?.driver?.phone : '';
  const depotName = typeof vehicle?.currentDepot === 'object' ? vehicle?.currentDepot?.name : 'Chưa định vị bãi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#131d35]/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-600 text-white shadow-lg shadow-cyan-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Hồ Sơ Phương Tiện Vận Tải</h3>
              <p className="text-xs text-gray-400 font-mono">ID: {vehicleId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[82vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs text-gray-400">Đang tải hồ sơ phương tiện...</p>
            </div>
          ) : !vehicle ? (
            <div className="text-center py-8 text-xs text-gray-400">Không tìm thấy thông tin xe</div>
          ) : (
            <div className="space-y-5">
              {/* Top Banner Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-950 border border-gray-800 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black font-mono text-cyan-400 tracking-wider">
                      {vehicle.plateNumber}
                    </span>
                    <span className="text-xs text-gray-400">({vehicle.modelName || 'Model chưa rõ'})</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        VEHICLE_TYPE_LABELS[vehicle.vehicleType]?.color || 'text-gray-300'
                      }`}
                    >
                      {VEHICLE_TYPE_LABELS[vehicle.vehicleType]?.label || vehicle.vehicleType}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{Number(vehicle.rating || 5.0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {vehicle.status === VehicleStatus.IDLE && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sẵn Sàng Ghép Đơn
                    </span>
                  )}
                  {vehicle.status === VehicleStatus.IN_TRANSIT && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/30">
                      <Clock className="w-3.5 h-3.5" />
                      Đang Vận Chuyển
                    </span>
                  )}
                  {vehicle.status === VehicleStatus.MAINTENANCE && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      <Wrench className="w-3.5 h-3.5" />
                      Đang Bảo Dưỡng
                    </span>
                  )}
                </div>
              </div>

              {/* Physical Dimension Box (2.5D visual feel) */}
              <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800/80 space-y-3">
                <div className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Box className="w-4 h-4 text-emerald-400" />
                    Không Gian Chứa Hàng (LIFO & Capacity Specs)
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono">
                    Kích thước: {vehicle.lengthM}m × {vehicle.widthM}m × {vehicle.heightM}m
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-gray-950/70 border border-gray-800">
                    <div className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-cyan-400" />
                      Tải trọng tối đa
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      {vehicle.maxWeightKg.toLocaleString('vi-VN')}{' '}
                      <span className="text-xs font-normal text-gray-400">kg</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-950/70 border border-gray-800">
                    <div className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Box className="w-3 h-3 text-emerald-400" />
                      Thể tích thùng
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      {vehicle.maxVolumeCbm}{' '}
                      <span className="text-xs font-normal text-gray-400">m³</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-950/70 border border-gray-800">
                    <div className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Ruler className="w-3 h-3 text-amber-400" />
                      Chiều dài
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      {vehicle.lengthM}{' '}
                      <span className="text-xs font-normal text-gray-400">m</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-950/70 border border-gray-800">
                    <div className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Coins className="w-3 h-3 text-yellow-400" />
                      Cước phí km
                    </div>
                    <div className="text-base font-bold text-amber-300 font-mono mt-1">
                      {vehicle.costPerKm?.toLocaleString('vi-VN')}{' '}
                      <span className="text-[10px] font-normal text-gray-400">đ/km</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ESG Fuel Consumption profile */}
              <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800/80 space-y-2.5">
                <div className="text-xs font-semibold text-emerald-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Fuel className="w-4 h-4 text-emerald-400" />
                    Định Mức Nhiên Liệu & Tính Toán Phát Thải CO2 (ISO 14083)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-gray-950/60 border border-gray-800">
                    <span className="text-gray-400">Chạy rỗng (Empty Rate):</span>
                    <div className="text-sm font-semibold text-cyan-300 font-mono mt-0.5">
                      {vehicle.fuelEmptyRate} Lít / 100km
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-950/60 border border-gray-800">
                    <span className="text-gray-400">Đầy tải (Full Load Rate):</span>
                    <div className="text-sm font-semibold text-emerald-300 font-mono mt-0.5">
                      {vehicle.fuelFullRate} Lít / 100km
                    </div>
                  </div>
                </div>
              </div>

              {/* Personnel & Location assignment */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-gray-900/50 border border-gray-800/80 space-y-1.5">
                  <div className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    Chủ Xe (Carrier):
                  </div>
                  <div className="text-sm font-semibold text-white">{ownerName}</div>
                  <div className="text-[11px] text-gray-400">{ownerEmail}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-900/50 border border-gray-800/80 space-y-1.5">
                  <div className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    Tài Xế Phụ Trách:
                  </div>
                  <div className="text-sm font-semibold text-white">{driverName}</div>
                  <div className="text-[11px] text-gray-400">{driverPhone || 'Chưa cập nhật SĐT'}</div>
                </div>
              </div>

              {/* Current Depot & Coordinates */}
              <div className="p-3.5 rounded-xl bg-gray-900/50 border border-gray-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-xs text-gray-400">Bãi đỗ tập kết hiện tại:</div>
                    <div className="text-sm font-medium text-white">{depotName}</div>
                  </div>
                </div>
                {vehicle.currentLocation?.coordinates && (
                  <div className="text-right">
                    <div className="text-[11px] text-gray-400 flex items-center gap-1 justify-end">
                      <Navigation className="w-3 h-3 text-sky-400" />
                      Tọa độ thực tế:
                    </div>
                    <div className="text-xs font-mono text-cyan-300">
                      [{vehicle.currentLocation.coordinates[0].toFixed(4)},{' '}
                      {vehicle.currentLocation.coordinates[1].toFixed(4)}]
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#131d35]/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-gray-800 hover:bg-gray-700 text-white transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
