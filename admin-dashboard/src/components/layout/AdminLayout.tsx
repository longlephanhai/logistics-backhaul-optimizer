import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { logoutThunk } from '@/store/slices/authSlice';
import {
  Truck,
  LayoutDashboard,
  Users,
  Shield,
  KeyRound,
  LogOut,
  MapPin,
  Leaf,
  Activity,
  Layers,
} from 'lucide-react';

export const AdminLayout = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Tổng Quan Hệ Thống', icon: LayoutDashboard, exact: true },
    { to: '/dashboard/users', label: 'Quản Lý Người Dùng', icon: Users },
    { to: '/dashboard/roles', label: 'Vai Trò (Roles)', icon: Shield },
    { to: '/dashboard/permissions', label: 'Ma Trận Quyền Hạn', icon: KeyRound },
  ];

  const upcomingModules = [
    { label: 'Bản Đồ Macro Vĩ Mô', icon: MapPin },
    { label: 'Thùng Xe 2.5D & LIFO', icon: Layers },
    { label: 'Báo Cáo ESG & CO2', icon: Leaf },
  ];

  return (
    <div className="flex h-screen w-full bg-[#070b14] text-gray-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-gray-800/80 bg-[#0b101d]/90 backdrop-blur-xl">
        {/* Brand */}
        <div className="p-5 border-b border-gray-800/80 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 text-white shadow-md shadow-cyan-500/20">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              <span>Backhaul</span>
              <span className="text-cyan-400">Opt</span>
            </div>
            <div className="text-[10px] text-gray-500 font-mono">MISSION CONTROL</div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Quản Trị Hệ Thống (RBAC)
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${isActive
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Logistics Lõi (Sắp ra mắt)
            </div>
            <div className="space-y-1">
              {upcomingModules.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-gray-500 cursor-not-allowed select-none hover:bg-gray-900/40"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-gray-600 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                      Phase 2
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Backend Status Footer */}
        <div className="p-3 border-t border-gray-800/80 bg-gray-950/40">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-gray-900/60 border border-gray-800">
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>NestJS Port 8080</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">LIVE</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-gray-800/80 bg-[#0b101d]/60 backdrop-blur-xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Hệ thống điều hành vận tải liên tỉnh</span>
            </div>
          </div>

          {/* User Info & Logout Button */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
              <div className="text-right">
                <div className="text-xs font-semibold text-white">{user?.name || 'Quản trị viên'}</div>
                <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">
                  {user?.role?.name || 'SUPER_ADMIN'}
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-md border border-cyan-400/30">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Route View */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#070b14]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
