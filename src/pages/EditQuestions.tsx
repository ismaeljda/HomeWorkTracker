import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getHomeworkById,
  updateHomework,
  type Homework,
  type Question
} from '../firebase/firestore';

const EditQuestions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [homework, setHomework] = useState<Homework | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [questionForm, setQuestionForm] = useState({
    type: 'mcq' as 'mcq' | 'true-false' | 'open-ended',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 1
  });

  useEffect(() => {
    const fetchHomework = async () => {
      if (!id) return;
      const hw = await getHomeworkById(id);
      if (hw) {
        setHomework(hw);
        setQuestions(hw.questions || []);
      }
      setLoading(false);
    };
    fetchHomework();
  }, [id]);

  const resetForm = () => {
    setQuestionForm({
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 1
    });
    setEditingIndex(null);
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: questionForm.type,
      question: questionForm.question,
      options: questionForm.type === 'mcq' ? questionForm.options.filter(o => o.trim()) : undefined,
      correctAnswer: questionForm.type === 'true-false'
        ? questionForm.correctAnswer === 1
        : questionForm.type === 'mcq'
        ? questionForm.correctAnswer
        : undefined,
      points: questionForm.points
    };

    if (editingIndex !== null) {
      const updated = [...questions];
      updated[editingIndex] = newQuestion;
      setQuestions(updated);
    } else {
      setQuestions([...questions, newQuestion]);
    }

    resetForm();
  };

  const handleEditQuestion = (index: number) => {
    const q = questions[index];
    setQuestionForm({
      type: q.type,
      question: q.question,
      options: q.type === 'mcq' ? [...(q.options || []), '', '', '', ''].slice(0, 4) : ['', '', '', ''],
      correctAnswer: typeof q.correctAnswer === 'boolean'
        ? (q.correctAnswer ? 1 : 0)
        : (typeof q.correctAnswer === 'number' ? q.correctAnswer : 0),
      points: q.points
    });
    setEditingIndex(index);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!id || !homework) return;

    try {
      await updateHomework(id, {
        ...homework,
        questions
      });
      alert('Questions saved successfully!');
      navigate(`/prof`);
    } catch (error) {
      console.error('Error saving questions:', error);
      alert('Failed to save questions');
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!homework || homework.teacherId !== userData?.uid) {
    return <div className="flex items-center justify-center min-h-screen">Not authorized</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/prof')}
          className="text-blue-600 hover:text-blue-800 flex items-center space-x-2 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Dashboard</span>
        </button>

        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Edit Questions: {homework.title}
        </h1>
        <p className="text-gray-600">
          {homework.type === 'exam' ? '📝 Exam' : homework.type === 'quiz' ? '❓ Quiz' : '📚 Homework'} •
          {' '}{questions.length} questions • {totalPoints} total points
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Question Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {editingIndex !== null ? 'Edit Question' : 'Add Question'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type
              </label>
              <select
                value={questionForm.type}
                onChange={(e) => setQuestionForm({
                  ...questionForm,
                  type: e.target.value as 'mcq' | 'true-false' | 'open-ended'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="true-false">True/False</option>
                <option value="open-ended">Open-Ended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question
              </label>
              <textarea
                value={questionForm.question}
                onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your question here..."
              />
            </div>

            {questionForm.type === 'mcq' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer Options
                </label>
                {questionForm.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={questionForm.correctAnswer === index}
                      onChange={() => setQuestionForm({ ...questionForm, correctAnswer: index })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...questionForm.options];
                        newOptions[index] = e.target.value;
                        setQuestionForm({ ...questionForm, options: newOptions });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Option ${index + 1}`}
                    />
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-1">Select the correct answer by clicking the radio button</p>
              </div>
            )}

            {questionForm.type === 'true-false' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="trueFalse"
                      checked={questionForm.correctAnswer === 1}
                      onChange={() => setQuestionForm({ ...questionForm, correctAnswer: 1 })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>True</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="trueFalse"
                      checked={questionForm.correctAnswer === 0}
                      onChange={() => setQuestionForm({ ...questionForm, correctAnswer: 0 })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>False</span>
                  </label>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points
              </label>
              <input
                type="number"
                min="1"
                value={questionForm.points}
                onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleAddQuestion}
                disabled={!questionForm.question.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingIndex !== null ? 'Update Question' : 'Add Question'}
              </button>
              {editingIndex !== null && (
                <button
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Questions</h2>

          {questions.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <p>No questions added yet</p>
              <p className="text-sm mt-2">Add your first question using the form</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {questions.map((q, index) => (
                <div key={q.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-semibold">
                          Q{index + 1}
                        </span>
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {q.type === 'mcq' ? 'MCQ' : q.type === 'true-false' ? 'True/False' : 'Open-Ended'}
                        </span>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                          {q.points} {q.points === 1 ? 'point' : 'points'}
                        </span>
                      </div>
                      <p className="font-medium text-gray-800">{q.question}</p>

                      {q.type === 'mcq' && q.options && (
                        <ul className="mt-2 space-y-1">
                          {q.options.map((option, i) => (
                            <li key={i} className={`text-sm ${i === q.correctAnswer ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                              {i === q.correctAnswer && '✓ '}{option}
                            </li>
                          ))}
                        </ul>
                      )}

                      {q.type === 'true-false' && (
                        <p className="mt-2 text-sm text-green-600 font-semibold">
                          Answer: {q.correctAnswer ? 'True' : 'False'}
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEditQuestion(index)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {questions.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition"
              >
                Save All Questions & Publish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditQuestions;
