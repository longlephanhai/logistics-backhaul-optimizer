import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, LogIn } from 'lucide-react';

export const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#070b14] overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-24 h-24 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shadow-2xl shadow-rose-500/20 glow-rose animate-pulse">
            <ShieldAlert className="w-12 h-12 text-rose-400" />
          </div>
          <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white shadow-md">
            403
          </span>
        </div>

        {/* Title & Description */}
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Truy Cập Bị Từ Chối
        </h1>
        <div className="text-xs font-mono text-rose-400 mb-4 uppercase tracking-widest">
          HTTP 403 • FORBIDDEN ACCESS
        </div>

        <p className="text-sm text-gray-400 leading-relaxed mb-8 max-w-sm mx-auto">
          Tài khoản của bạn không có đủ thẩm quyền (RBAC Permission) để truy cập tài nguyên hoặc thực hiện hành động này.
        </p>

        {/* Role Warning Card */}
        <div className="glass-panel rounded-2xl p-4 border border-rose-500/20 mb-8 text-left bg-rose-950/20">
          <div className="text-xs font-semibold text-rose-300 mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>Chính Sách Bảo Mật RBAC</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-normal">
            Nếu bạn cho rằng đây là sự nhầm lẫn, vui lòng liên hệ <span className="text-white font-medium">Super Admin</span> để được phân quyền trên Ma Trận Quyền Hạn (Permission Matrix).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-xs text-gray-300 font-medium transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại trang trước</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Về Dashboard</span>
          </button>

          <button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-medium text-xs transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Đổi tài khoản</span>
          </button>
        </div>
      </div>
    </div>
  );
};
