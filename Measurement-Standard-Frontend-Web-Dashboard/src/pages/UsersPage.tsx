

import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store'; // Adjust path to your RootState/AppDispatch
import { fetchUsers, updateUserRole, deleteUser, setSearchTerm } from '../store/slices/usersSlice';
import { Role } from '../types';
import { FaUserShield, FaTrash, FaSearch } from 'react-icons/fa';

export function UsersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error, searchTerm } = useSelector(
    (state: RootState) => state.users
  );

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleRoleChange = (userId: string, newRole: Role) => {
    dispatch(updateUserRole({ userId, newRole }));
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('هل أنت تأكد من حذف هذا المستخدم؟')) {
      dispatch(deleteUser(userId));
    }
  };

  // Filter users dynamically by email
  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [users, searchTerm]);

  if (loading) return <div className="p-6 text-gray-600 font-semibold">جاري التحميل...</div>;
  if (error) return <div className="p-6 text-red-600 font-semibold">{error}</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaUserShield /> إدارة الصلاحيات والمستخدمين
        </h1>

        {/* Email Search Box */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            placeholder="البحث بواسطة البريد الإلكتروني..."
            className="w-full pl-4 pr-10 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
            <tr>
              <th className="p-4">المستخدم</th>
              <th className="p-4">البريد الإلكتروني</th>
              <th className="p-4">الصلاحية الحالية</th>
              <th className="p-4">تغيير الصلاحية</th>
              <th className="p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{user.username}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    <span className="px-4 py-2 rounded-md text-l font-semibold bg-blue-600 text-white hover:bg-blue-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                      className="border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={Role.USER}>مستخدم عادي (USER)</option>
                      <option value={Role.ADMIN}>مشرف (ADMIN)</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-800 p-2 rounded transition-colors cursor-pointer"
                      title="حذف المستخدم"
                    >
                      <FaTrash size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  لا توجد نتائج تطابق البريد الإلكتروني المدخل
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}