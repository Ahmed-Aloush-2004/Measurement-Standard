import { NavLink } from 'react-router-dom';
import { FaGraduationCap, FaLayerGroup, FaQuestionCircle, FaUsers, FaChartPie, FaBell } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { Role } from '../../types';
import type { RootState } from '../../store/store';

export function Sidebar() {
  const { user } = useSelector((state: RootState) => state.auth);

  const links = [
    { name: 'الرئيسية', path: '/dashboard', icon: <FaChartPie /> },
    { name: 'أنواع الاختبارات', path: '/dashboard/exam-types', icon: <FaGraduationCap /> },
    { name: 'الأقسام', path: '/dashboard/sections', icon: <FaLayerGroup /> },
    { name: 'الأسئلة', path: '/dashboard/questions', icon: <FaQuestionCircle /> },
    { name: 'الإشعارات', path: '/dashboard/notifications', icon: <FaBell /> },
  ];

  if (user?.role === Role.SUPER_ADMIN) {
    links.push({ name: 'إدارة المستخدمين', path: '/dashboard/users', icon: <FaUsers /> });
  }

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col">
      <div className="text-xl font-bold mb-8 text-blue-400 border-b border-slate-800 pb-4 text-center">
        نظام القياس والتعليم
      </div>
      <nav className="flex-1 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-800'
              }`
            }
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}