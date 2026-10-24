import { useNavigate } from 'react-router-dom';
import { ServerCrash, RotateCcw, Home, Activity } from 'lucide-react';

export const ServerErrorPage = () => {
  const navigate = useNavigate();

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#070b14] overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

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
          <div className="w-24 h-24 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-2xl shadow-amber-500/20 glow-amber animate-pulse">
            <ServerCrash className="w-12 h-12 text-amber-400" />
          </div>
          <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-black shadow-md">
            500
          </span>
        </div>

        {/* Title & Description */}
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Sự Cố Hệ Thống Máy Chủ
        </h1>
        <div className="text-xs font-mono text-amber-400 mb-4 uppercase tracking-widest">
          HTTP 500 • INTERNAL SERVER ERROR
        </div>

        <p className="text-sm text-gray-400 leading-relaxed mb-8 max-w-sm mx-auto">
          Dịch vụ Backend hoặc cơ sở dữ liệu MongoDB đang gặp gián đoạn tạm thời. Vui lòng thử tải lại hoặc kiểm tra trạng thái máy chủ.
        </p>

        {/* Diagnostic Card */}
        <div className="glass-panel rounded-2xl p-4 border border-amber-500/20 mb-8 text-left bg-amber-950/20">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Chẩn Đoán Kết Nối Hệ Thống</span>
            </div>
            <span className="text-[10px] font-mono text-gray-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
              NestJS :8080
            </span>
          </div>
          <p className="text-[11px] text-gray-400 leading-normal">
            Hãy đảm bảo tiến trình Backend <code className="text-amber-300 font-mono">npm run dev</code> trong thư mục <code className="text-cyan-300 font-mono">apps/backend</code> đang chạy và kết nối ổn định với MongoDB.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleReload}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Thử Tải Lại Trang</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-xs text-gray-300 font-medium transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Về Trang Chủ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
