import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store/store';
import { FaLock, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';

export function UnauthorizedPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);



  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-8 text-center border-t-4 border-red-500">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-5 rounded-full">
            <FaLock className="text-red-500 text-4xl" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">عذراً، غير مصرح لك بالدخول</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          مرحباً <span className="font-semibold">{user?.username || 'بك'}</span>، حسابك الحالي مسجل كـ 
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded mx-1 text-sm font-bold">مستخدم عادي</span>. 
          لوحة التحكم هذه مخصصة للمشرفين ومدراء النظام فقط.
        </p>

        <div className="bg-blue-50 rounded-xl p-6 mb-8 text-right border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            هل ترغب في الانضمام لفريق الإدارة؟
          </h3>
          <p className="text-sm text-blue-800 mb-4">
            إذا كنت تعتقد أنك بحاجة إلى صلاحيات إدارية للوصول إلى لوحة التحكم، يرجى التواصل مع الإدارة عبر البريد الإلكتروني التالي وإرفاق سبب طلب الترقية:
          </p>
          <a 
            href="mailto:admin@measurement-standard.com" 
            className="flex items-center justify-center gap-2 bg-white text-blue-700 p-3 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors font-medium dir-ltr"
          >
            <FaEnvelope /> admin@measurement-standard.com
          </a>
        </div>

      </div>
    </div>
  );
}