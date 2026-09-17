
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import {
  createNotification,
  clearNotificationState,
  type SendNotificationPayload,
} from '../store/slices/notificationsSlice';

export const NotificationsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { sending, successMessage, error } = useSelector(
    (state: RootState) => state.notifications
  );

  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [formData, setFormData] = useState<SendNotificationPayload>({
    user_email: '',
    title: '',
    message: '',
    type: 'info',
    url: '',
    expiresAt: '',
  });

  useEffect(() => {
    return () => {
      dispatch(clearNotificationState());
    };
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: SendNotificationPayload = {
      title: formData.title,
      message: formData.message,
      type: formData.type || 'info',
      url: formData.url || undefined,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
    };

    if (targetType === 'specific') {
      if (!formData.user_email?.trim()) {
        alert('الرجاء إيميل المستخدم');
        return;
      }
      payload.user_email = formData.user_email.trim();
    }

    dispatch(createNotification(payload)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        setFormData({
          user_email: '',
          title: '',
          message: '',
          type: 'info',
          url: '',
          expiresAt: '',
        });
      }
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto" dir="rtl">
      {/* Page Header */}
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">إرسال إشعار جديد</h1>
        <p className="text-gray-500 text-sm mt-1">
          قم بإنشاء وإرسال الإشعارات إلى جميع المستخدمين أو إلى مستخدم محدد.
        </p>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="p-4 mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 border rounded-xl shadow-sm space-y-5">
        {/* Target Audience Toggle */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            الجهة المستهدفة
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTargetType('all')}
              className={`py-2.5 px-4 text-sm font-medium rounded-lg border transition-all ${
                targetType === 'all'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              جميع المستخدمين
            </button>
            <button
              type="button"
              onClick={() => setTargetType('specific')}
              className={`py-2.5 px-4 text-sm font-medium rounded-lg border transition-all ${
                targetType === 'specific'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              مستخدم محدد
            </button>
          </div>
        </div>

        {/* User ID Field (Only visible when "specific" target is chosen) */}
        {targetType === 'specific' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              إيميل المستخدم (User Email) <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="user_email"
              required
              value={formData.user_email}
              onChange={handleChange}
              placeholder="JoeDoe@example.com : مثال"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-left"
              dir="ltr"
            />
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            عنوان الإشعار <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="أدخل عنوان الإشعار"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Message Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نص الإشعار <span className="text-red-500">*</span>
          </label>
          <textarea
            name="message"
            required
            rows={4}
            value={formData.message}
            onChange={handleChange}
            placeholder="اكتب تفاصيل الإشعار هنا..."
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Grid for optional parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نوع الإشعار</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="info">تنبيه (Info)</option>
              <option value="warning">تحذير (Warning)</option>
              <option value="system">نظام (System)</option>
            </select>
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
            <input
              type="datetime-local"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Link / URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">رابط (إختياري)</label>
          <input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://example.com/details"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-left"
            dir="ltr"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={sending}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors disabled:opacity-50"
          >
            {sending ? 'جاري الإرسال...' : 'إرسال الإشعار'}
          </button>
        </div>
      </form>
    </div>
  );
};