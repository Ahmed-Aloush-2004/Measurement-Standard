
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { fetchExamTypes } from '../store/slices/examTypesSlice';
import { fetchSections, createSection, updateSection, deleteSection } from '../store/slices/sectionsSlice';
import type { Section } from '../types';
import { Loader } from '../components/layout/Loader';

export function SectionsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { data: examTypes, loading: examTypesLoading } = useSelector((state: RootState) => state.examTypes);
  const { data: sections, loading: sectionsLoading } = useSelector((state: RootState) => state.sections);

  const [selectedExamType, setSelectedExamType] = useState<string>('');
  const [newSectionName, setNewSectionName] = useState('');
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    dispatch(fetchExamTypes());
    dispatch(fetchSections());
  }, [dispatch]);

  // Robust filtering supporting nested relations, camelCase, and snake_case
  const filteredSections = selectedExamType
    ? sections.filter(
        (s: any) =>
          s.examType?.id === selectedExamType ||
          s.examTypeId === selectedExamType ||
          s.exam_type_id === selectedExamType
      )
    : sections;

  const handleAddSection = async () => {
    if (!selectedExamType) {
      setErrorMsg('يرجى اختيار نوع الاختبار المحدد أولاً لإضافة قسم جديد');
      return;
    }
    if (!newSectionName.trim()) return;

    setErrorMsg('');
    await dispatch(
      createSection({
        name: newSectionName,
        examTypeId: selectedExamType,
      })
    );
    setNewSectionName('');
  };

  const handleSaveEdit = async () => {
    if (!editingSection || !editingSection.name.trim()) return;
    await dispatch(
      updateSection({
        id: editingSection.id,
        name: editingSection.name,
      })
    );
    setEditingSection(null);
  };

  const isLoading = examTypesLoading || sectionsLoading;

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-center">إدارة الأقسام</h1>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Exam Type Selector */}
          <div>
            <label className="block text-sm font-semibold mb-1">اختر نوع الاختبار:</label>
            <select
              className="w-full border p-2 rounded-lg bg-white"
              value={selectedExamType}
              onChange={(e) => {
                setSelectedExamType(e.target.value);
                if (e.target.value) setErrorMsg('');
              }}
            >
              <option value="">جميع الأقسام</option>
              {examTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Add New Section Inputs */}
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border p-2 rounded-lg bg-white"
              placeholder="اسم القسم الجديد"
              value={newSectionName}
              onChange={(e) => {
                setNewSectionName(e.target.value);
                if (e.target.value.trim()) setErrorMsg('');
              }}
            />
            <button
              onClick={handleAddSection}
              disabled={!newSectionName.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              إضافة قسم
            </button>
          </div>

          {/* Validation Error Message */}
          {errorMsg && (
            <p className="text-red-600 text-sm font-medium mt-1">
              {errorMsg}
            </p>
          )}

          {/* Filtered Sections List */}
          <div className="space-y-3 mt-6">
            {filteredSections.length > 0 ? (
              filteredSections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm"
                >
                  {editingSection?.id === section.id ? (
                    <div className="flex flex-1 gap-2">
                      <input
                        type="text"
                        className="flex-1 border p-1 rounded"
                        value={editingSection.name}
                        onChange={(e) =>
                          setEditingSection({ ...editingSection, name: e.target.value })
                        }
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="font-semibold bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer"
                      >
                        حفظ
                      </button>
                      <button
                        onClick={() => setEditingSection(null)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-semibold">{section.name}</span>
                      <div className="flex gap-3 text-sm">
                        <button
                          onClick={() => setEditingSection(section)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => dispatch(deleteSection(section.id))}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer"
                        >
                          حذف
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-6">
                لا توجد أقسام مرتبطة بهذا الاختبار
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}