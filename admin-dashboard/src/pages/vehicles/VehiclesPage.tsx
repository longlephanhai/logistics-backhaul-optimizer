import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VehicleType, VehicleStatus, type IVehicle } from '@/types/vehicle';
import type { IDepot } from '@/types/depot';
import { vehicleService } from '@/services/vehicleService';
import { depotService } from '@/services/depotService';
import { CreateVehicleModal } from '@/components/modals/vehicles/CreateVehicleModal';
import { EditVehicleModal } from '@/components/modals/vehicles/EditVehicleModal';
import { VehicleDetailModal } from '@/components/modals/vehicles/VehicleDetailModal';
import {
  Box,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  Edit3,
  Eye,
  Fuel,
  Gauge,
  LayoutGrid,
  Loader2,
  Plus,
  Search,
  Star,
  TableIcon,
  Trash2,
  Truck,
  User,
  Warehouse,
  Wrench,
  X,
} from 'lucide-react';

const VEHICLE_TYPE_LABELS: Record<VehicleType, { label: string; color: string }> = {
  [VehicleType.CLOSED_BOX]: { label: 'Thùng Kín', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  [VehicleType.TARPAULIN]: { label: 'Mui Bạt', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  [VehicleType.REFRIGERATED]: { label: 'Đông Lạnh', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  [VehicleType.FLATBED]: { label: 'Sàn Phẳng', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
};

export const VehiclesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlDepotId = searchParams.get('depotId');

  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [depots, setDepots] = useState<IDepot[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedDepotFilter, setSelectedDepotFilter] = useState<string>(urlDepotId || 'ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<IVehicle | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailVehicleId, setDetailVehicleId] = useState<string | null>(null);

  // Update filter if URL changes
  useEffect(() => {
    if (urlDepotId) {
      setSelectedDepotFilter(urlDepotId);
    }
  }, [urlDepotId]);

  useEffect(() => {
    fetchDepotOptions();
  }, []);

  useEffect(() => {
    fetchVehicles(currentPage);
  }, [currentPage, selectedStatusFilter, selectedTypeFilter, selectedDepotFilter]);

  const fetchDepotOptions = async () => {
    try {
      const depotList = await depotService.getAllDepotsSimple();
      setDepots(depotList || []);
    } catch (err: any) {
      console.error('Lỗi khi tải danh mục bãi xe:', err);
    }
  };

  const fetchVehicles = async (page = 1) => {
    try {
      setLoading(true);
      const res = await vehicleService.getVehicles(
        page,
        pageSize,
        searchTerm,
        selectedStatusFilter,
        selectedTypeFilter,
        selectedDepotFilter
      );
      setVehicles(res.result || []);
      if (res.meta) {
        setTotalPages(res.meta.pages || 1);
        setTotalVehicles(res.meta.total || 0);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách phương tiện:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchVehicles(1);
  };

  const handleClearDepotFilter = () => {
    setSelectedDepotFilter('ALL');
    searchParams.delete('depotId');
    setSearchParams(searchParams);
    setCurrentPage(1);
  };

  const handleOpenEdit = (vehicle: IVehicle) => {
    setEditingVehicle(vehicle);
    setIsEditOpen(true);
  };

  const handleOpenDetail = (id: string) => {
    setDetailVehicleId(id);
    setIsDetailOpen(true);
  };

  const handleDelete = async (id: string, plate: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phương tiện biển số "${plate}"?`)) return;
    try {
      await vehicleService.deleteVehicle(id);
      fetchVehicles(currentPage);
    } catch (err: any) {
      alert(`Lỗi khi xóa: ${err.message}`);
    }
  };

  const selectedDepotName = depots.find((d) => d._id === selectedDepotFilter)?.name;

  // Metrics for current page
  const idleCount = vehicles.filter((v) => v.status === VehicleStatus.IDLE).length;
  const transitCount = vehicles.filter((v) => v.status === VehicleStatus.IN_TRANSIT).length;
  const maintenanceCount = vehicles.filter((v) => v.status === VehicleStatus.MAINTENANCE).length;
  const totalCapacityTons = (
    vehicles.reduce((acc, curr) => acc + (curr.maxWeightKg || 0), 0) / 1000
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>Quản Trị Hệ Thống</span>
            <span>/</span>
            <span className="text-cyan-400 font-medium">Đội Xe & Phương Tiện</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Đội Xe Vận Tải (Vehicles)</span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-medium border border-cyan-500/20">
              {totalVehicles} xe
            </span>
            {selectedDepotFilter !== 'ALL' && selectedDepotName && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-medium border border-emerald-500/30 flex items-center gap-1.5">
                <Warehouse className="w-3.5 h-3.5" />
                <span>Bãi: {selectedDepotName}</span>
                <button
                  onClick={handleClearDepotFilter}
                  title="Bỏ lọc bãi này"
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Quản trị phương tiện liên tỉnh, thông số kỹ thuật 2.5D và định vị bãi xe tập kết
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* View switcher */}
          <div className="flex items-center p-1 bg-gray-900 border border-gray-800 rounded-xl">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'card'
                  ? 'bg-cyan-500/20 text-cyan-400 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Chế độ thẻ (Card Grid)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-cyan-500/20 text-cyan-400 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Chế độ bảng (Table View)"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-emerald-600 hover:from-cyan-400 hover:to-emerald-500 text-white shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Xe Mới</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950/80 border border-gray-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Tổng Số Xe</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalVehicles}</div>
          <div className="text-[11px] text-gray-400 mt-1">Toàn bộ xe theo bộ lọc</div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950/80 border border-gray-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Xe Đang Rảnh (IDLE)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{idleCount}</div>
          <div className="text-[11px] text-gray-400 mt-1">Sẵn sàng nhận ghép chuyến</div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950/80 border border-gray-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Đang Vận Chuyển</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-400 mt-2">{transitCount}</div>
          <div className="text-[11px] text-gray-400 mt-1">Đang trên lộ trình giao nhận</div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950/80 border border-gray-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Đang Bảo Dưỡng</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2">{maintenanceCount}</div>
          <div className="text-[11px] text-gray-400 mt-1">Tạm dừng khai thác</div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950/80 border border-gray-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Tổng Tải Trọng</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">
            {totalCapacityTons}{' '}
            <span className="text-xs font-normal text-gray-400">Tấn</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Sức nâng (trang này)</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0b101d]/80 border border-gray-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* ⭐ UX FOCUS: Bộ lọc theo Bãi Xe Tập Kết */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-950 border border-gray-800 text-xs">
            <Warehouse className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-gray-400">Bãi đỗ:</span>
            <select
              value={selectedDepotFilter}
              onChange={(e) => {
                setSelectedDepotFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer max-w-[170px] truncate"
            >
              <option value="ALL" className="bg-gray-900 text-white">
                -- Tất Cả Bãi Xe --
              </option>
              {depots.map((d) => (
                <option key={d._id} value={d._id} className="bg-gray-900 text-white">
                  {d.name}
                </option>
              ))}
            </select>
            {selectedDepotFilter !== 'ALL' && (
              <button
                onClick={handleClearDepotFilter}
                className="text-gray-500 hover:text-rose-400 transition-colors ml-1"
                title="Bỏ lọc bãi này"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800">
            {[
              { key: 'ALL', label: 'Tất Cả TT' },
              { key: VehicleStatus.IDLE, label: 'Rảnh' },
              { key: VehicleStatus.IN_TRANSIT, label: 'Đang Chạy' },
              { key: VehicleStatus.MAINTENANCE, label: 'Bảo Dưỡng' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setSelectedStatusFilter(item.key);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedStatusFilter === item.key
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800">
            {[
              { key: 'ALL', label: 'Tất Cả Thùng' },
              { key: VehicleType.CLOSED_BOX, label: 'Thùng Kín' },
              { key: VehicleType.TARPAULIN, label: 'Mui Bạt' },
              { key: VehicleType.REFRIGERATED, label: 'Đông Lạnh' },
              { key: VehicleType.FLATBED, label: 'Sàn Phẳng' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setSelectedTypeFilter(item.key);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedTypeFilter === item.key
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo biển số xe..."
              className="pl-9 pr-4 py-2 rounded-xl bg-gray-900 border border-gray-700/80 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 w-52"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-gray-800 hover:bg-gray-700 text-white transition-colors"
          >
            Tìm
          </button>
        </form>
      </div>

      {/* Main View Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-gray-400">Đang tải danh sách phương tiện...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-gray-900/40 border border-gray-800/80 space-y-3">
          <Truck className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">Chưa có phương tiện nào</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {selectedDepotFilter !== 'ALL'
              ? `Bãi xe "${selectedDepotName}" hiện chưa có xe nào tập kết.`
              : 'Hệ thống chưa tìm thấy dữ liệu phương tiện phù hợp với bộ lọc hiện tại.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            {selectedDepotFilter !== 'ALL' && (
              <button
                onClick={handleClearDepotFilter}
                className="px-3.5 py-2 rounded-xl text-xs font-medium bg-gray-800 hover:bg-gray-700 text-white transition-colors"
              >
                Xem tất cả các bãi
              </button>
            )}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black inline-flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Thêm phương tiện mới
            </button>
          </div>
        </div>
      ) : viewMode === 'card' ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => {
            const ownerName = typeof v.owner === 'object' ? v.owner?.name : 'Chưa rõ';
            const driverName = typeof v.driver === 'object' ? v.driver?.name : 'Chưa phân công';
            const depotName = typeof v.currentDepot === 'object' ? v.currentDepot?.name : 'Chưa định vị bãi';
            const depotId = typeof v.currentDepot === 'object' ? v.currentDepot?._id : v.currentDepot;

            return (
              <div
                key={v._id}
                className="group relative p-5 rounded-2xl bg-[#0b101d]/90 border border-gray-800 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Plate number & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600/20 to-emerald-600/20 border border-cyan-500/30 text-cyan-400 group-hover:border-cyan-400 transition-colors">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black font-mono tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                            {v.plateNumber}
                          </span>
                          <div className="flex items-center gap-0.5 text-xs text-amber-400 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{Number(v.rating || 5.0).toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="text-[11px] text-gray-400 truncate max-w-[160px]">
                          {v.modelName || 'Chưa cập nhật model'}
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {v.status === VehicleStatus.IDLE && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Rảnh
                        </span>
                      )}
                      {v.status === VehicleStatus.IN_TRANSIT && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                          <Clock className="w-3 h-3" />
                          Đang chạy
                        </span>
                      )}
                      {v.status === VehicleStatus.MAINTENANCE && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <Wrench className="w-3 h-3" />
                          Bảo dưỡng
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Type Pill & Dimensions */}
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                        VEHICLE_TYPE_LABELS[v.vehicleType]?.color || 'text-gray-300'
                      }`}
                    >
                      {VEHICLE_TYPE_LABELS[v.vehicleType]?.label || v.vehicleType}
                    </span>
                    <span className="text-[11px] text-gray-500 font-mono">
                      {v.lengthM}m × {v.widthM}m × {v.heightM}m
                    </span>
                  </div>

                  {/* ⭐ UX FOCUS: Bãi Đỗ Tập Kết Hiện Tại (Nổi bật & Clickable) */}
                  <div
                    onClick={() => {
                      if (depotId) {
                        setSelectedDepotFilter(depotId);
                        setCurrentPage(1);
                      }
                    }}
                    className="mt-3.5 p-2.5 rounded-xl bg-gray-950 border border-gray-800/80 hover:border-cyan-500/40 cursor-pointer transition-colors flex items-center justify-between"
                    title="Bấm để lọc tất cả xe cùng bãi này"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Warehouse className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] text-gray-400 block leading-tight">Bãi đỗ hiện tại:</span>
                        <span className="text-xs font-semibold text-white truncate block">
                          {depotName}
                        </span>
                      </div>
                    </div>
                    {depotId && (
                      <span className="text-[10px] text-cyan-400 hover:underline shrink-0">
                        Lọc bãi &rarr;
                      </span>
                    )}
                  </div>

                  {/* Specs Matrix: Weight, Volume, Fuel, Cost */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-gray-900/70 border border-gray-800">
                      <div className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-cyan-400" />
                        Tải trọng
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5">
                        {v.maxWeightKg.toLocaleString('vi-VN')} kg
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-gray-900/70 border border-gray-800">
                      <div className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Box className="w-3 h-3 text-emerald-400" />
                        Thể tích
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5">
                        {v.maxVolumeCbm} m³
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-gray-900/70 border border-gray-800">
                      <div className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Fuel className="w-3 h-3 text-teal-400" />
                        Dầu rỗng / đầy
                      </div>
                      <div className="text-xs font-mono text-cyan-300 mt-0.5">
                        {v.fuelEmptyRate} / {v.fuelFullRate} L
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-gray-900/70 border border-gray-800">
                      <div className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Coins className="w-3 h-3 text-amber-400" />
                        Cước phí km
                      </div>
                      <div className="text-xs font-mono text-amber-300 mt-0.5">
                        {v.costPerKm?.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                  </div>

                  {/* Personnel info */}
                  <div className="mt-3 pt-2.5 border-t border-gray-800/70 flex items-center justify-between text-[11px] text-gray-400">
                    <div className="flex items-center gap-1 truncate">
                      <User className="w-3 h-3 text-blue-400 shrink-0" />
                      <span className="truncate">Chủ: {ownerName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 truncate">
                      <User className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">TX: {driverName}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleOpenDetail(v._id)}
                    title="Xem chi tiết"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(v)}
                    title="Chỉnh sửa"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(v._id, v.plateNumber)}
                    title="Xóa"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-hidden rounded-2xl border border-gray-800/80 bg-[#0b101d]/90 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/60 text-gray-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 font-semibold">Biển Số / Model</th>
                  <th className="py-3.5 px-4 font-semibold">Bãi Đỗ Hiện Tại</th>
                  <th className="py-3.5 px-4 font-semibold">Loại Thùng</th>
                  <th className="py-3.5 px-4 font-semibold">Tải Trọng / Thể Tích</th>
                  <th className="py-3.5 px-4 font-semibold">Dài x Rộng x Cao</th>
                  <th className="py-3.5 px-4 font-semibold">Cước Phí / Nhiên Liệu</th>
                  <th className="py-3.5 px-4 font-semibold">Chủ Xe / Tài Xế</th>
                  <th className="py-3.5 px-4 font-semibold">Trạng Thái</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {vehicles.map((v) => {
                  const ownerName = typeof v.owner === 'object' ? v.owner?.name : 'Chưa rõ';
                  const driverName = typeof v.driver === 'object' ? v.driver?.name : '-';
                  const depotName = typeof v.currentDepot === 'object' ? v.currentDepot?.name : '-';
                  const depotId = typeof v.currentDepot === 'object' ? v.currentDepot?._id : v.currentDepot;

                  return (
                    <tr key={v._id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                          <span>{v.plateNumber}</span>
                          <span className="text-[10px] text-amber-400 font-sans flex items-center gap-0.5">
                            ★ {Number(v.rating || 5.0).toFixed(1)}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400">{v.modelName || '-'}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[170px]">
                        <div
                          onClick={() => {
                            if (depotId) {
                              setSelectedDepotFilter(depotId);
                              setCurrentPage(1);
                            }
                          }}
                          className={`flex items-center gap-1.5 truncate ${
                            depotId ? 'cursor-pointer hover:text-cyan-400' : 'text-gray-500'
                          }`}
                          title={depotId ? 'Bấm để lọc xe cùng bãi này' : ''}
                        >
                          <Warehouse className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate font-medium">{depotName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            VEHICLE_TYPE_LABELS[v.vehicleType]?.color || 'text-gray-300'
                          }`}
                        >
                          {VEHICLE_TYPE_LABELS[v.vehicleType]?.label || v.vehicleType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">
                          {v.maxWeightKg?.toLocaleString('vi-VN')} kg
                        </div>
                        <div className="text-[11px] text-emerald-400">{v.maxVolumeCbm} m³</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-400">
                        {v.lengthM} × {v.widthM} × {v.heightM} m
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-amber-300">
                          {v.costPerKm?.toLocaleString('vi-VN')} đ/km
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Dầu: {v.fuelEmptyRate}/{v.fuelFullRate} L/100km
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-300">
                        <div>Chủ: {ownerName}</div>
                        <div className="text-[10px] text-gray-500">TX: {driverName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {v.status === VehicleStatus.IDLE && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Rảnh
                          </span>
                        )}
                        {v.status === VehicleStatus.IN_TRANSIT && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                            Đang chạy
                          </span>
                        )}
                        {v.status === VehicleStatus.MAINTENANCE && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            Bảo dưỡng
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenDetail(v._id)}
                            className="p-1 rounded text-gray-400 hover:text-cyan-400"
                            title="Chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(v)}
                            className="p-1 rounded text-gray-400 hover:text-amber-400"
                            title="Sửa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(v._id, v.plateNumber)}
                            className="p-1 rounded text-gray-400 hover:text-rose-400"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-gray-400">
            Hiển thị trang <span className="font-semibold text-white">{currentPage}</span> /{' '}
            <span className="font-semibold text-white">{totalPages}</span> (Tổng {totalVehicles} xe)
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-mono text-cyan-400">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateVehicleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchVehicles(currentPage)}
      />

      <EditVehicleModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingVehicle(null);
        }}
        onSuccess={() => fetchVehicles(currentPage)}
        vehicle={editingVehicle}
      />

      <VehicleDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailVehicleId(null);
        }}
        vehicleId={detailVehicleId}
      />
    </div>
  );
};
