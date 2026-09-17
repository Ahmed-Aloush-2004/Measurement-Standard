import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import type { RootState } from '../../store/store';

export function Header() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <FaUserShield className="text-blue-600 text-xl" />
        <span className="font-semibold text-gray-700">{user?.username}</span>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium uppercase">
          {user?.role}
        </span>
      </div>
      <button
        onClick={() => dispatch(logout())}
        className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
      >
        <FaSignOutAlt />
        <span>تسجيل الخروج</span>
      </button>
    </header>
  );
}