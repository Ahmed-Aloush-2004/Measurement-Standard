
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { fetchExamTypes, updateExamType, deleteExamType } from '../store/slices/examTypesSlice';
import { FaEdit, FaTrash } from 'react-icons/fa';

export function ExamTypesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { data: examTypes } = useSelector((state: RootState) => state.examTypes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');

  useEffect(() => { dispatch(fetchExamTypes()); }, [dispatch]);

  const handleEdit = (type: any) => {
    setEditingId(type.id);
    setEditName(type.name);
    setEditCode(type.code);
  };

  const handleSave = async (id: string) => {
    await dispatch(updateExamType({ id, name: editName, code: editCode }));
    setEditingId(null);
  };

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">إدارة أنواع الاختبارات</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {examTypes.map((type) => (
          <div key={type.id} className="p-4 border rounded-xl bg-white shadow-sm flex justify-between items-center">
            {editingId === type.id ? (
              <div className="flex gap-2 w-full">
                <input className="border p-1 rounded" value={editName} onChange={(e) => setEditName(e.target.value)} />
                <input className="border p-1 rounded" value={editCode} onChange={(e) => setEditCode(e.target.value)} />
                <button onClick={() => handleSave(type.id)} className="bg-green-600 text-white px-3 py-1 rounded">حفظ</button>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="font-bold text-lg">{type.name}</h3>
                  <span className="text-sm text-gray-500">{type.code}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleEdit(type)} className="bg-blue-600 text-white px-2 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"><FaEdit color='white' size={16} /></button>
                  <button onClick={() => dispatch(deleteExamType(type.id))} className="bg-red-600 text-white px-2 py-2 rounded-lg hover:bg-red-700 cursor-pointer "><FaTrash size={16} /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}