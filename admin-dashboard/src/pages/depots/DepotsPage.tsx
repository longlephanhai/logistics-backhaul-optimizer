import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DepotStatus, type IDepot } from '@/types/depot';
import { VehicleStatus, type IVehicle } from '@/types/vehicle';
import { depotService } from '@/services/depotService';
import { vehicleService } from '@/services/vehicleService';
import { CreateDepotModal } from '@/components/modals/depots/CreateDepotModal';
import { EditDepotModal } from '@/components/modals/depots/EditDepotModal';
import { DepotDetailModal } from '@/components/modals/depots/DepotDetailModal';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  ExternalLink,
  Eye,
  Hash,
  LayoutGrid,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Search,
  TableIcon,
  Trash2,
  User,
  Warehouse,
  Truck,
  ArrowRight,
} from 'lucide-react';

export const DepotsPage = () => {
  const navigate = useNavigate();
  const [depots, setDepots] = useState<IDepot[]>([]);
  const [allVehicles, setAllVehicles] = useState<IVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDepots, setTotalDepots] = useState(0);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDepot, setEditingDepot] = useState<IDepot | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailDepotId, setDetailDepotId] = useState<string | null>(null);

  useEffect(() => {
    fetchDepotsAndVehicles(currentPage);
  }, [currentPage, selectedStatusFilter]);

  const fetchDepotsAndVehicles = async (page = 1) => {
    try {
      setLoading(true);
      const [depotRes, vehicleList] = await Promise.all([
        depotService.getDepots(page, pageSize, searchTerm, selectedStatusFilter),
        vehicleService.getAllVehicles(),
      ]);
      setDepots(depotRes.result || []);
      setAllVehicles(vehicleList || []);
      if (depotRes.meta) {
        setTotalPages(depotRes.meta.pages || 1);
        setTotalDepots(depotRes.meta.total || 0);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu bãi xe & phương tiện:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDepotsAndVehicles(1);
  };

  const handleOpenEdit = (depot: IDepot) => {
    setEditingDepot(depot);
    setIsEditOpen(true);
  };

  const handleOpenDetail = (id: string) => {
    setDetailDepotId(id);
    setIsDetailOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bãi xe "${name}"?`)) return;
    try {
      await depotService.deleteDepot(id);
      fetchDepotsAndVehicles(currentPage);
    } catch (err: any) {
      alert(`Lỗi khi xóa: ${err.message}`);
    }
  };

  // Helper: lấy danh sách xe đang ở trong bãi xe này
  const getVehiclesInDepot = (depotId: string): IVehicle[] => {
    return allVehicles.filter((v) => {
      const vDepotId = typeof v.currentDepot === 'object' ? v.currentDepot?._id : v.currentDepot;
      return vDepotId === depotId;
    });
  };

  // Metrics
  const activeCount = depots.filter((d) => d.status === DepotStatus.ACTIVE).length;
  const totalCapacity = depots.reduce((acc, curr) => acc + (curr.capacityTrucks || 0), 0);
  const totalParkedVehicles = allVehicles.filter((v) => !!v.currentDepot).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>Quản Trị Hệ Thống</span>
            <span>/</span>
            <span className="text-cyan-400 font-medium">Bãi Xe & Trạm Trung Chuyển</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Quản Lý Bãi Xe (Depots)</span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-medium border border-cyan-500/20">
              {totalDepots} trạm
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Hạ tầng bãi đỗ tập kết phương tiện, theo dõi trực quan số xe đang có mặt tại từng trạm
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Bãi Xe</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950/80 border border-gray-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Tổng Trạm Trung Chuyển</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalDepots}</div>
          <div className="text-[11px] text-gray-400 mt-1">Toàn bộ bãi xe trong mạng lưới</div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950/80 border border-gray-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Xe Đang Tập Kết Tại Bãi</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{totalParkedVehicles}</div>
          <div className="text-[11px] text-gray-400 mt-1">Phương tiện có vị trí bãi cố định</div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950/80 border border-gray-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Tổng Sức Chứa (Trang này)</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Hash className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">{totalCapacity}</div>
          <div className="text-[11px] text-gray-400 mt-1">Vị trí đỗ xe tối đa</div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950/80 border border-gray-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Đang Hoạt Động (Active)</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-400 mt-2">{activeCount}</div>
          <div className="text-[11px] text-gray-400 mt-1">Sẵn sàng nhận xe ghép chuyến</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0b101d]/80 border border-gray-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { key: 'ALL', label: 'Tất Cả' },
            { key: DepotStatus.ACTIVE, label: 'Đang Hoạt Động' },
            { key: DepotStatus.INACTIVE, label: 'Tạm Ngưng' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setSelectedStatusFilter(item.key);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                selectedStatusFilter === item.key
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 border border-transparent'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên bãi xe..."
              className="pl-9 pr-4 py-2 rounded-xl bg-gray-900 border border-gray-700/80 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 w-64"
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
          <p className="text-xs text-gray-400">Đang tải danh sách bãi xe và xe đang đỗ...</p>
        </div>
      ) : depots.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-gray-900/40 border border-gray-800/80 space-y-3">
          <Warehouse className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">Chưa có bãi xe nào</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Hệ thống chưa tìm thấy dữ liệu bãi xe phù hợp với bộ lọc hiện tại.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black inline-flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tạo bãi xe đầu tiên
          </button>
        </div>
      ) : viewMode === 'card' ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {depots.map((depot) => {
            const lng = depot.location?.coordinates?.[0] ?? 0;
            const lat = depot.location?.coordinates?.[1] ?? 0;
            const gmapLink = `https://www.google.com/maps?q=${lat},${lng}`;

            const parkedVehicles = getVehiclesInDepot(depot._id);
            const parkedCount = parkedVehicles.length;
            const capacity = depot.capacityTrucks || 1;
            const occupancyPercent = Math.min(Math.round((parkedCount / capacity) * 100), 100);
            const idleCount = parkedVehicles.filter((v) => v.status === VehicleStatus.IDLE).length;

            return (
              <div
                key={depot._id}
                className="group relative p-5 rounded-2xl bg-[#0b101d]/90 border border-gray-800 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                        <Warehouse className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {depot.name}
                        </h3>
                        <div className="text-[10px] text-gray-500 font-mono">
                          ID: {depot._id.slice(-6)}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        depot.status === DepotStatus.ACTIVE
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {depot.status === DepotStatus.ACTIVE ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Hoạt động
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          Tạm ngưng
                        </>
                      )}
                    </span>
                  </div>

                  {/* Address */}
                  <div className="mt-3 flex items-start gap-1.5 text-xs text-gray-300">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{depot.address}</span>
                  </div>

                  {/* ⭐ UX FOCUS: Khối Trực Quan Xe Đang Có Mặt Tại Bãi */}
                  <div
                    onClick={() => handleOpenDetail(depot._id)}
                    className="mt-3.5 p-3 rounded-xl bg-gray-950/90 border border-gray-800 hover:border-cyan-500/50 cursor-pointer transition-all group/parked"
                    title="Bấm để xem danh sách chi tiết các xe đang đỗ tại bãi này"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-200 group-hover/parked:text-cyan-300 transition-colors">
                        <Truck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Xe đang đỗ:</span>
                        <span className="text-cyan-400 font-mono font-bold">
                          {parkedCount} / {capacity}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {occupancyPercent}% công suất
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden mb-2">
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

                    {/* Danh sách nhanh các biển số xe (hoặc báo trống) */}
                    {parkedCount > 0 ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          {parkedVehicles.slice(0, 3).map((v) => (
                            <span
                              key={v._id}
                              className="px-1.5 py-0.5 rounded bg-gray-900 border border-gray-700/80 font-mono text-[10px] text-cyan-300 font-medium"
                            >
                              {v.plateNumber}
                            </span>
                          ))}
                          {parkedCount > 3 && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold">
                              +{parkedCount - 3} xe
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
                          <span className="text-emerald-400 font-medium">
                            {idleCount} xe rảnh sẵn sàng ghép
                          </span>
                          <span className="text-cyan-400 group-hover/parked:underline inline-flex items-center gap-0.5">
                            Xem tất cả <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-500 flex items-center justify-between">
                        <span>Bãi trống, chưa có xe tập kết</span>
                        <span className="text-gray-400 group-hover/parked:text-cyan-400 text-[10px]">
                          Chi tiết &rarr;
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Coordinates link */}
                  <div className="mt-2.5 flex items-center justify-between text-xs text-gray-400 px-1">
                    <span className="text-[11px] text-gray-500">Tọa độ:</span>
                    <a
                      href={gmapLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1 truncate"
                      title="Xem trên Google Maps"
                    >
                      <span>
                        [{lng.toFixed(2)}, {lat.toFixed(2)}]
                      </span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                  </div>

                  {/* Contact info */}
                  {(depot.contactPerson || depot.contactPhone) && (
                    <div className="mt-2.5 pt-2 border-t border-gray-800/70 flex items-center justify-between text-[11px] text-gray-400">
                      <div className="flex items-center gap-1 truncate">
                        <User className="w-3 h-3 text-purple-400 shrink-0" />
                        <span className="truncate">{depot.contactPerson || 'Trực bãi'}</span>
                      </div>
                      {depot.contactPhone && (
                        <div className="flex items-center gap-1 text-emerald-400">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{depot.contactPhone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/dashboard/vehicles?depotId=${depot._id}`)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
                  >
                    <Truck className="w-3 h-3" />
                    <span>Lọc xe bãi này</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenDetail(depot._id)}
                      title="Xem chi tiết & danh sách xe"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(depot)}
                      title="Chỉnh sửa"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(depot._id, depot.name)}
                      title="Xóa"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
                  <th className="py-3.5 px-4 font-semibold">Tên Bãi Xe</th>
                  <th className="py-3.5 px-4 font-semibold">Địa Chỉ</th>
                  <th className="py-3.5 px-4 font-semibold">Tọa Độ (Lng, Lat)</th>
                  <th className="py-3.5 px-4 font-semibold">Phương Tiện Đang Đỗ</th>
                  <th className="py-3.5 px-4 font-semibold">Liên Hệ</th>
                  <th className="py-3.5 px-4 font-semibold">Trạng Thái</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {depots.map((depot) => {
                  const lng = depot.location?.coordinates?.[0] ?? 0;
                  const lat = depot.location?.coordinates?.[1] ?? 0;
                  const gmapLink = `https://www.google.com/maps?q=${lat},${lng}`;

                  const parkedVehicles = getVehiclesInDepot(depot._id);
                  const parkedCount = parkedVehicles.length;
                  const capacity = depot.capacityTrucks || 1;
                  const occupancyPercent = Math.min(Math.round((parkedCount / capacity) * 100), 100);

                  return (
                    <tr key={depot._id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <Warehouse className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>{depot.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-300 max-w-xs truncate">
                        {depot.address}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-cyan-300">
                        <a
                          href={gmapLink}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline inline-flex items-center gap-1"
                        >
                          [{lng.toFixed(2)}, {lat.toFixed(2)}]
                          <ExternalLink className="w-3 h-3 text-cyan-400" />
                        </a>
                      </td>
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => handleOpenDetail(depot._id)}
                          className="cursor-pointer group/cell"
                          title="Click xem danh sách xe"
                        >
                          <div className="flex items-center gap-2 font-mono">
                            <span className="font-bold text-white group-hover/cell:text-cyan-400">
                              {parkedCount} / {capacity} xe
                            </span>
                            <span className="text-[10px] text-gray-400">({occupancyPercent}%)</span>
                          </div>
                          <div className="w-24 h-1.5 rounded-full bg-gray-800 overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full ${
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
                      </td>
                      <td className="py-3.5 px-4 text-gray-300">
                        <div>{depot.contactPerson || '-'}</div>
                        <div className="text-[10px] text-gray-500">{depot.contactPhone || ''}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            depot.status === DepotStatus.ACTIVE
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {depot.status === DepotStatus.ACTIVE ? 'Hoạt động' : 'Tạm ngưng'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenDetail(depot._id)}
                            className="p-1 rounded text-gray-400 hover:text-cyan-400"
                            title="Xem chi tiết & danh sách xe"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(depot)}
                            className="p-1 rounded text-gray-400 hover:text-amber-400"
                            title="Sửa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(depot._id, depot.name)}
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
            <span className="font-semibold text-white">{totalPages}</span> (Tổng {totalDepots} bãi xe)
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
      <CreateDepotModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchDepotsAndVehicles(currentPage)}
      />

      <EditDepotModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingDepot(null);
        }}
        onSuccess={() => fetchDepotsAndVehicles(currentPage)}
        depot={editingDepot}
      />

      <DepotDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailDepotId(null);
        }}
        depotId={detailDepotId}
      />
    </div>
  );
};
