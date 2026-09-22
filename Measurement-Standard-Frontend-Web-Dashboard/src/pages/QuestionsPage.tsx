
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { fetchExamTypes } from '../store/slices/examTypesSlice';
import { fetchSections } from '../store/slices/sectionsSlice';
import { fetchQuestions, createQuestion, updateQuestion, deleteQuestion } from '../store/slices/questionsSlice';
import type { Question } from '../types';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { Loader } from '../components/layout/Loader';

interface FormErrors {
  content?: string;
  sectionId?: string;
  choices?: string;
  editContent?: string;
  editChoices?: string;
}

export function QuestionsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { data: examTypes } = useSelector((state: RootState) => state.examTypes);
  const { data: sections } = useSelector((state: RootState) => state.sections);
  const { items: questions, totalPages, page: currentPage, loading: questionsLoading } = useSelector((state: RootState) => state.questions);

  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [order, setOrder] = useState<'ASC' | 'DESC'>('ASC');

  // Modal States
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Question Form State
  const [newContent, setNewContent] = useState('');
  const [newExplanation, setNewExplanation] = useState('');
  const [newExamTypeId, setNewExamTypeId] = useState('');
  const [newSectionId, setNewSectionId] = useState('');
  const [newChoices, setNewChoices] = useState<Array<{ content: string; is_correct: boolean }>>([
    { content: '', is_correct: true },
    { content: '', is_correct: false },
  ]);

  // Validation Error States
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    dispatch(fetchExamTypes());
    dispatch(fetchSections());
  }, [dispatch]);

  const handleExamTypeChange = (examTypeId: string) => {
    setSelectedExamType(examTypeId);
    setSelectedSection('');
    setPage(1);
  };

  const filteredSections = selectedExamType
    ? sections.filter((s) => s.examType?.id === selectedExamType || (s as any).examTypeId === selectedExamType)
    : sections;

  const newFormFilteredSections = newExamTypeId
    ? sections.filter((s) => s.examType?.id === newExamTypeId || (s as any).examTypeId === newExamTypeId)
    : sections;

  useEffect(() => {
    dispatch(fetchQuestions({ page, limit, examTypeId: selectedExamType, sectionId: selectedSection, order }));
  }, [page, limit, selectedExamType, selectedSection, order, dispatch]);

  const resetAddForm = () => {
    setNewContent('');
    setNewExplanation('');
    setNewExamTypeId('');
    setNewSectionId('');
    setNewChoices([
      { content: '', is_correct: true },
      { content: '', is_correct: false },
    ]);
    setErrors({});
    setIsAddModalOpen(false);
  };

  // Edit Choice Helpers
  const handleChoiceChange = (idx: number, content: string) => {
    if (!editingQuestion) return;
    const updatedChoices = [...(editingQuestion.choices || [])];
    updatedChoices[idx] = { ...updatedChoices[idx], content };
    setEditingQuestion({ ...editingQuestion, choices: updatedChoices });
    if (errors.editChoices) setErrors((prev) => ({ ...prev, editChoices: undefined }));
  };

  const handleCorrectChoice = (idx: number) => {
    if (!editingQuestion) return;
    const updatedChoices = editingQuestion.choices?.map((c, i) => ({
      ...c,
      is_correct: i === idx,
    }));
    setEditingQuestion({ ...editingQuestion, choices: updatedChoices });
    if (errors.editChoices) setErrors((prev) => ({ ...prev, editChoices: undefined }));
  };

  const addChoice = () => {
    if (!editingQuestion || (editingQuestion.choices?.length || 0) >= 4) return;
    setEditingQuestion({
      ...editingQuestion,
      choices: [...(editingQuestion.choices || []), { content: '', is_correct: false }],
    });
    if (errors.editChoices) setErrors((prev) => ({ ...prev, editChoices: undefined }));
  };

  const removeChoice = (idx: number) => {
    if (!editingQuestion) return;
    if ((editingQuestion.choices?.length || 0) <= 2) {
      setErrors((prev) => ({ ...prev, editChoices: 'يجب أن يحتوي السؤال على خيارين على الأقل' }));
      return;
    }
    setEditingQuestion({
      ...editingQuestion,
      choices: editingQuestion.choices?.filter((_, i) => i !== idx),
    });
  };

  const saveQuestion = async () => {
    if (!editingQuestion) return;
    const newErrors: FormErrors = {};

    if (!editingQuestion.content.trim()) {
      newErrors.editContent = 'يرجى إدخال نص السؤال';
    }

    const choices = editingQuestion.choices || [];
    if (choices.length < 2 || choices.length > 4) {
      newErrors.editChoices = 'يجب أن يحتوي السؤال على خيارين إلى 4 خيارات';
    } else if (choices.some((c) => !c.content.trim())) {
      newErrors.editChoices = 'يرجى تعبئة كافة نصوص الخيارات المضافة';
    } else if (!choices.some((c) => c.is_correct)) {
      newErrors.editChoices = 'يرجى تحديد الخيار الصحيح للإجابة';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await dispatch(updateQuestion({ id: editingQuestion.id, data: editingQuestion }));
    setEditingQuestion(null);
    setErrors({});
  };

  // Add Question Helpers
  const handleNewChoiceChange = (idx: number, content: string) => {
    const updated = [...newChoices];
    updated[idx].content = content;
    setNewChoices(updated);
    if (errors.choices) setErrors((prev) => ({ ...prev, choices: undefined }));
  };

  const handleNewCorrectChoice = (idx: number) => {
    setNewChoices(newChoices.map((c, i) => ({ ...c, is_correct: i === idx })));
    if (errors.choices) setErrors((prev) => ({ ...prev, choices: undefined }));
  };

  const addNewChoiceField = () => {
    if (newChoices.length >= 4) return;
    setNewChoices([...newChoices, { content: '', is_correct: false }]);
    if (errors.choices) setErrors((prev) => ({ ...prev, choices: undefined }));
  };

  const removeNewChoiceField = (idx: number) => {
    if (newChoices.length <= 2) {
      setErrors((prev) => ({ ...prev, choices: 'يجب أن يحتوي السؤال على خيارين على الأقل' }));
      return;
    }
    setNewChoices(newChoices.filter((_, i) => i !== idx));
  };

  const handleCreateQuestion = async () => {
    const newErrors: FormErrors = {};

    if (!newContent.trim()) {
      newErrors.content = 'يرجى إدخال نص السؤال';
    }
    if (!newSectionId) {
      newErrors.sectionId = 'يرجى اختيار القسم';
    }
    if (newChoices.length < 2 || newChoices.length > 4) {
      newErrors.choices = 'يجب أن يحتوي السؤال على خيارين إلى 4 خيارات';
    } else if (newChoices.some((c) => !c.content.trim())) {
      newErrors.choices = 'يرجى تعبئة كافة نصوص الخيارات المضافة';
    } else if (!newChoices.some((c) => c.is_correct)) {
      newErrors.choices = 'يرجى تحديد الخيار الصحيح للإجابة';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await dispatch(
      createQuestion({
        content: newContent,
        explanation: newExplanation,
        sectionId: newSectionId,
        choices: newChoices,
      })
    );

    resetAddForm();
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">بنك الأسئلة والخيارات</h1>
        <button
          onClick={() => { setErrors({}); setIsAddModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
        >
          <FaPlus /> إضافة سؤال جديد
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border">
        <div>
          <label className="block text-sm mb-1">نوع الاختبار:</label>
          <select
            className="w-full border p-2 rounded-lg"
            value={selectedExamType}
            onChange={(e) => handleExamTypeChange(e.target.value)}
          >
            <option value="">الكل</option>
            {examTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">القسم:</label>
          <select
            className="w-full border p-2 rounded-lg"
            value={selectedSection}
            onChange={(e) => { setSelectedSection(e.target.value); setPage(1); }}
          >
            <option value="">الكل</option>
            {filteredSections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">عدد الأسئلة (الحد الأقصى 30):</label>
          <select
            className="w-full border p-2 rounded-lg"
            value={limit}
            onChange={(e) => { setLimit(Math.min(Number(e.target.value), 30)); setPage(1); }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">الترتيب:</label>
          <select
            className="w-full border p-2 rounded-lg"
            value={order}
            onChange={(e) => setOrder(e.target.value as 'ASC' | 'DESC')}
          >
            <option value="ASC">تصاعدي</option>
            <option value="DESC">تنازلي</option>
          </select>
        </div>
      </div>

      {/* Question List / Loader */}
      {questionsLoading ? (
        <Loader />
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {Array.isArray(questions) && questions.length > 0 ? (
              questions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => { setErrors({}); setEditingQuestion(q); }}
                  className="p-4 border rounded-xl bg-white hover:border-blue-500 cursor-pointer transition-colors shadow-sm"
                >
                  <p className="font-semibold text-lg">{q.content}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-6">لا توجد أسئلة متاحة</p>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              السابق
            </button>
            <span>الصفحة {currentPage} من {totalPages || 1}</span>
            <button
              disabled={currentPage >= totalPages || totalPages === 0}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              التالي
            </button>
          </div>
        </>
      )}

      {/* Add Question Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
            <h2 className="text-xl font-bold mb-4">إضافة سؤال جديد</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">نوع الاختبار:</label>
                <select
                  className="w-full border p-2 rounded-lg"
                  value={newExamTypeId}
                  onChange={(e) => {
                    setNewExamTypeId(e.target.value);
                    setNewSectionId('');
                  }}
                >
                  <option value="">اختر نوع الاختبار</option>
                  {examTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">القسم: *</label>
                <select
                  className={`w-full border p-2 rounded-lg ${errors.sectionId ? 'border-red-500 bg-red-50' : ''}`}
                  value={newSectionId}
                  onChange={(e) => {
                    setNewSectionId(e.target.value);
                    if (errors.sectionId) setErrors((prev) => ({ ...prev, sectionId: undefined }));
                  }}
                >
                  <option value="">اختر القسم</option>
                  {newFormFilteredSections.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {errors.sectionId && (
                  <span className="text-red-500 text-xs mt-1 block">{errors.sectionId}</span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">نص السؤال: *</label>
              <textarea
                className={`w-full border p-2 rounded-lg ${errors.content ? 'border-red-500 bg-red-50' : ''}`}
                rows={3}
                placeholder="أدخل نص السؤال..."
                value={newContent}
                onChange={(e) => {
                  setNewContent(e.target.value);
                  if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }));
                }}
              />
              {errors.content && (
                <span className="text-red-500 text-xs mt-1 block">{errors.content}</span>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">الشرح / التوضيح (اختياري):</label>
              <textarea
                className="w-full border p-2 rounded-lg"
                rows={2}
                placeholder="أدخل الشرح التوضيحي للحل..."
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
              />
            </div>

            <h3 className="font-semibold mb-2">الخيارات (من 2 إلى 4 خيارات):</h3>
            {newChoices.map((choice, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  name="newCorrectChoice"
                  checked={choice.is_correct}
                  onChange={() => handleNewCorrectChoice(idx)}
                />
                <input
                  className={`border p-2 rounded flex-1 ${errors.choices && !choice.content.trim() ? 'border-red-500 bg-red-50' : ''}`}
                  placeholder={`الخيار ${idx + 1}`}
                  value={choice.content}
                  onChange={(e) => handleNewChoiceChange(idx, e.target.value)}
                />
                <button
                  onClick={() => removeNewChoiceField(idx)}
                  className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 cursor-pointer"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            {errors.choices && (
              <span className="text-red-500 text-xs mt-1 mb-2 block">{errors.choices}</span>
            )}

            {newChoices.length < 4 && (
              <button
                onClick={addNewChoiceField}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm mb-4 border cursor-pointer"
              >
                + إضافة خيار
              </button>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={resetAddForm}
                className="border bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded-lg cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateQuestion}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                حفظ السؤال
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">تعديل السؤال</h2>

            <div className="mb-4">
              <textarea
                className={`w-full border p-2 rounded-lg ${errors.editContent ? 'border-red-500 bg-red-50' : ''}`}
                value={editingQuestion.content}
                onChange={(e) => {
                  setEditingQuestion({ ...editingQuestion, content: e.target.value });
                  if (errors.editContent) setErrors((prev) => ({ ...prev, editContent: undefined }));
                }}
              />
              {errors.editContent && (
                <span className="text-red-500 text-xs mt-1 block">{errors.editContent}</span>
              )}
            </div>

            <h3 className="font-semibold mb-2">الخيارات (من 2 إلى 4 خيارات):</h3>
            {editingQuestion.choices?.map((choice, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  name="correctChoice"
                  checked={choice.is_correct}
                  onChange={() => handleCorrectChoice(idx)}
                />
                <input
                  className={`border p-2 rounded flex-1 ${errors.editChoices && !choice.content.trim() ? 'border-red-500 bg-red-50' : ''}`}
                  value={choice.content}
                  onChange={(e) => handleChoiceChange(idx, e.target.value)}
                />
                <button
                  onClick={() => removeChoice(idx)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer"
                >
                  حذف
                </button>
              </div>
            ))}
            {errors.editChoices && (
              <span className="text-red-500 text-xs mt-1 mb-2 block">{errors.editChoices}</span>
            )}

            {(editingQuestion.choices?.length || 0) < 4 && (
              <button
                onClick={addChoice}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                + إضافة خيار
              </button>
            )}

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => {
                  dispatch(deleteQuestion(editingQuestion.id));
                  setEditingQuestion(null);
                  setErrors({});
                }}
                className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg cursor-pointer"
              >
                حذف السؤال
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditingQuestion(null); setErrors({}); }}
                  className="border bg-gray-600 text-white hover:bg-gray-700 px-4 py-2 rounded-lg cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  onClick={saveQuestion}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  حفظ التغييرات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}