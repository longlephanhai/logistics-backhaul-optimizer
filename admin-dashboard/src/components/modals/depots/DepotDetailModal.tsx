import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DepotStatus, type IDepot } from '@/types/depot';
import { VehicleStatus, VehicleType, type IVehicle } from '@/types/vehicle';
import { depotService } from '@/services/depotService';
import { vehicleService } from '@/services/vehicleService';
import {
  Warehouse,
  Loader2,
  X,
  MapPin,
  Phone,
  User,
  Hash,
  Navigation,
  ExternalLink,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Truck,
  Gauge,
  Box,
  Star,
  Clock,
  Wrench,
  ArrowRight,
} from 'lucide-react';

interface DepotDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  depotId: string | null;
}

const VEHICLE_TYPE_LABELS: Record<VehicleType, { label: string; color: string }> = {
  [VehicleType.CLOSED_BOX]: { label: 'Thùng Kín', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  [VehicleType.TARPAULIN]: { label: 'Mui Bạt', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  [VehicleType.REFRIGERATED]: { label: 'Đông Lạnh', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  [VehicleType.FLATBED]: { label: 'Sàn Phẳng', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
};

export const DepotDetailModal = ({
  isOpen,
  onClose,
  depotId,
}: DepotDetailModalProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [depot, setDepot] = useState<IDepot | null>(null);
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [activeTab, setActiveTab] = useState<'vehicles' | 'info'>('vehicles');

  useEffect(() => {
    if (isOpen && depotId) {
      fetchDepotAndVehicles(depotId);
    } else {
      setDepot(null);
      setVehicles([]);
      setActiveTab('vehicles');
    }
  }, [isOpen, depotId]);

  const fetchDepotAndVehicles = async (id: string) => {
    try {
      setLoading(true);
      setLoadingVehicles(true);
      const [depotRes, vehiclesRes] = await Promise.all([
        depotService.getDepotById(id),
        vehicleService.getVehiclesByDepot(id),
      ]);
      setDepot(depotRes);
      setVehicles(vehiclesRes || []);
    } catch (err: any) {
      console.error('Lỗi khi tải thông tin bãi xe & đội xe:', err);
    } finally {
      setLoading(false);
      setLoadingVehicles(false);
    }
  };

  if (!isOpen) return null;

  const lng = depot?.location?.coordinates?.[0] ?? 0;
  const lat = depot?.location?.coordinates?.[1] ?? 0;
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  const capacity = depot?.capacityTrucks || 1;
  const parkedCount = vehicles.length;
  const occupancyPercent = Math.min(Math.round((parkedCount / capacity) * 100), 100);

  const idleVehicles = vehicles.filter((v) => v.status === VehicleStatus.IDLE);
  const inTransitVehicles = vehicles.filter((v) => v.status === VehicleStatus.IN_TRANSIT);
  const maintenanceVehicles = vehicles.filter((v) => v.status === VehicleStatus.MAINTENANCE);

  const handleNavigateToVehicles = () => {
    onClose();
    navigate(`/dashboard/vehicles?depotId=${depotId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#0f172a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#131d35]/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">{depot?.name || 'Chi Tiết Bãi Xe'}</h3>
                {depot?.status && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      depot.status === DepotStatus.ACTIVE
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {depot.status === DepotStatus.ACTIVE ? 'Hoạt động' : 'Tạm ngưng'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate max-w-md">{depot?.address}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Occupancy Banner (Tỷ lệ lấp đầy trực quan) */}
        <div className="px-6 py-3.5 bg-gray-950/80 border-b border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-300">Công Suất Bãi Đỗ:</span>
              <span className="text-sm font-black text-cyan-400 font-mono">
                {parkedCount} / {capacity}
              </span>
              <span className="text-xs text-gray-400">xe đang có mặt ({occupancyPercent}%)</span>
            </div>

            {/* Micro progress bar */}
            <div className="w-28 h-2 rounded-full bg-gray-800 overflow-hidden shrink-0">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  occupancyPercent > 85
                    ? 'bg-rose-500'
                    : occupancyPercent > 50
                    ? 'bg-amber-400'
                    : 'bg-cyan-400'
                }`}
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
          </div>

          {/* Quick status breakdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              {idleVehicles.length} xe rảnh
            </span>
            {inTransitVehicles.length > 0 && (
              <span className="px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
                {inTransitVehicles.length} đang chạy
              </span>
            )}
            {maintenanceVehicles.length > 0 && (
              <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                {maintenanceVehicles.length} bảo dưỡng
              </span>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-6 border-b border-gray-800/80 bg-gray-900/40">
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'vehicles'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Phương Tiện Đang Tại Bãi</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">
              {parkedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'info'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Warehouse className="w-4 h-4" />
            <span>Thông Số & Tọa Độ Bãi Xe</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 max-h-[60vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs text-gray-400">Đang truy vấn dữ liệu bãi xe và đội xe...</p>
            </div>
          ) : activeTab === 'vehicles' ? (
            /* TAB 1: Danh sách xe đang tại bãi */
            loadingVehicles ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                <p className="text-xs text-gray-400">Đang quét các xe đang đỗ tại bãi này...</p>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-12 rounded-xl bg-gray-950/50 border border-gray-800/80 p-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto text-gray-600">
                  <Truck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Bãi xe hiện đang trống</h4>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  Chưa có phương tiện nào được định vị hoặc tập kết tại bãi xe này ({depot?.name}).
                </p>
                <button
                  onClick={handleNavigateToVehicles}
                  className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-gray-800 hover:bg-cyan-500/20 hover:text-cyan-300 text-gray-300 transition-colors"
                >
                  <span>Chuyển sang trang Đội Xe để gán xe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-400 pb-1">
                  <span>
                    Tìm thấy <b className="text-white">{vehicles.length}</b> xe đang tập kết:
                  </span>
                  <button
                    onClick={handleNavigateToVehicles}
                    className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    <span>Mở bộ lọc này trên trang Đội Xe</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {vehicles.map((v) => {
                    const ownerName = typeof v.owner === 'object' ? v.owner?.name : 'Chưa rõ';
                    const driverName = typeof v.driver === 'object' ? v.driver?.name : 'Chưa gán';

                    return (
                      <div
                        key={v._id}
                        className="p-3.5 rounded-xl bg-gray-900/70 border border-gray-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-2.5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-sm text-cyan-300">
                                {v.plateNumber}
                              </span>
                              <div className="flex items-center gap-0.5 text-xs text-amber-400 font-bold">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span>{Number(v.rating || 5.0).toFixed(1)}</span>
                              </div>
                            </div>
                            <div className="text-[11px] text-gray-400 mt-0.5 truncate max-w-[180px]">
                              {v.modelName || 'Model chưa rõ'}
                            </div>
                          </div>

                          <div>
                            {v.status === VehicleStatus.IDLE && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Rảnh
                              </span>
                            )}
                            {v.status === VehicleStatus.IN_TRANSIT && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                                <Clock className="w-2.5 h-2.5" />
                                Đang chạy
                              </span>
                            )}
                            {v.status === VehicleStatus.MAINTENANCE && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                <Wrench className="w-2.5 h-2.5" />
                                Bảo dưỡng
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Specs */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              VEHICLE_TYPE_LABELS[v.vehicleType]?.color || 'text-gray-300'
                            }`}
                          >
                            {VEHICLE_TYPE_LABELS[v.vehicleType]?.label || v.vehicleType}
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Gauge className="w-3 h-3 text-cyan-400" />
                            {v.maxWeightKg?.toLocaleString('vi-VN')} kg
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Box className="w-3 h-3 text-emerald-400" />
                            {v.maxVolumeCbm} m³
                          </span>
                        </div>

                        {/* Personnel & Rates */}
                        <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between text-[11px] text-gray-400">
                          <div className="truncate max-w-[130px]">Chủ: {ownerName}</div>
                          <div className="text-amber-300 font-mono text-[10px]">
                            {v.costPerKm?.toLocaleString('vi-VN')} đ/km
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ) : (
            /* TAB 2: Thông tin chi tiết bãi xe */
            depot && (
              <div className="space-y-4">
                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-gray-900/50 border border-gray-800/60">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                      <Hash className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sức chứa tối đa</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {depot.capacityTrucks}{' '}
                      <span className="text-xs font-normal text-gray-400">phương tiện</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-900/50 border border-gray-800/60">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                      <Navigation className="w-3.5 h-3.5 text-sky-400" />
                      <span>Tọa độ địa lý (2dsphere)</span>
                    </div>
                    <div className="text-xs font-mono text-cyan-300">
                      [{lng.toFixed(4)}, {lat.toFixed(4)}]
                    </div>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline mt-1 font-sans"
                    >
                      <span>Mở Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800/80 space-y-2.5">
                  <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Thông Tin Liên Hệ Điều Phối
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2 text-gray-300">
                      <User className="w-4 h-4 text-purple-400" />
                      <span>Người trực: {depot.contactPerson || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>Hotline: {depot.contactPhone || 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                </div>

                {/* System Metadata */}
                <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800/60 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <span>
                      Khởi tạo:{' '}
                      {depot.createdAt ? new Date(depot.createdAt).toLocaleString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                  <div>
                    Cập nhật:{' '}
                    {depot.updatedAt ? new Date(depot.updatedAt).toLocaleString('vi-VN') : 'N/A'}
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#131d35]/40 flex items-center justify-between">
          <button
            onClick={handleNavigateToVehicles}
            className="text-xs text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1.5 transition-colors font-medium"
          >
            <Truck className="w-4 h-4" />
            <span>Xem & Quản lý xe bãi này trên bảng Đội Xe</span>
          </button>

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
