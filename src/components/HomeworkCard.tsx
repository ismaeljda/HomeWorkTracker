import React from 'react';
import { Link } from 'react-router-dom';
import type { Homework } from '../firebase/firestore';
import { isLate, isDueTomorrow, formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

interface HomeworkCardProps {
  homework: Homework;
  onMarkComplete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleAvailability?: (id: string, isAvailable: boolean) => void;
  showActions?: boolean;
  role?: 'eleve' | 'prof' | 'admin';
  teacherName?: string;
  subjectName?: string;
}

const HomeworkCard: React.FC<HomeworkCardProps> = ({
  homework,
  onMarkComplete,
  onEdit,
  onDelete,
  onToggleAvailability,
  showActions = false,
  role,
  teacherName,
  subjectName
}) => {
  const { userData } = useAuth();
  const late = isLate(homework.deadline);
  const dueTomorrow = isDueTomorrow(homework.deadline);

  // Get type-specific colors
  const getTypeColors = () => {
    switch (homework.type) {
      case 'exam':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-300',
          badgeBg: 'bg-red-100',
          badgeText: 'text-red-800',
          icon: '📝',
          label: 'Exam'
        };
      case 'quiz':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-300',
          badgeBg: 'bg-purple-100',
          badgeText: 'text-purple-800',
          icon: '❓',
          label: 'Quiz'
        };
      default:
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-300',
          badgeBg: 'bg-blue-100',
          badgeText: 'text-blue-800',
          icon: '📚',
          label: 'Homework'
        };
    }
  };

  const typeColors = getTypeColors();

  // Calculate completion statistics for teachers
  const totalStudents = homework.studentCompletions ? Object.keys(homework.studentCompletions).length : 0;
  const completedStudents = homework.studentCompletions
    ? Object.values(homework.studentCompletions).filter(completed => completed).length
    : 0;
  const completionPercentage = totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;

  return (
    <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:-translate-y-2">
      {/* Animated Gradient Top Bar */}
      <div className={`h-1.5 ${
        homework.type === 'exam' ? 'bg-gradient-to-r from-red-500 via-pink-500 to-red-500' :
        homework.type === 'quiz' ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500' :
        'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500'
      } bg-[length:200%_100%] group-hover:animate-[shimmer_2s_linear_infinite]`} />
      
      <div className="p-8">
        {/* Header Section with Enhanced Badges */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {/* Type Badge with Enhanced Icon */}
              <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg backdrop-blur-sm transform transition-transform hover:scale-110 ${
                homework.type === 'exam' ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white' :
                homework.type === 'quiz' ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white' :
                'bg-gradient-to-br from-blue-500 to-cyan-600 text-white'
              }`}>
                <span className="text-lg drop-shadow-sm">{typeColors.icon}</span>
                <span className="tracking-wide">{typeColors.label}</span>
              </span>

              {/* Status Badge with Enhanced Design */}
              {role === 'prof' ? (
                <span className="inline-flex items-center gap-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg backdrop-blur-sm">
                  <svg className="w-4 h-4 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span className="tracking-wide">{completedStudents}/{totalStudents}</span>
                </span>
              ) : homework.status === 'complete' ? (
                <span className="inline-flex items-center gap-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg backdrop-blur-sm">
                  <svg className="w-4 h-4 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="tracking-wide">Completed</span>
                </span>
              ) : null}

              {/* Late/Due Tomorrow Badge with Pulse Animation */}
              {late && (
                <span className="inline-flex items-center gap-2 bg-gradient-to-br from-red-600 to-red-700 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg backdrop-blur-sm animate-pulse">
                  <svg className="w-4 h-4 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="tracking-wide">Overdue</span>
                </span>
              )}
              {!late && dueTomorrow && (
                <span className="inline-flex items-center gap-2 bg-gradient-to-br from-yellow-500 to-orange-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg backdrop-blur-sm">
                  <svg className="w-4 h-4 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="tracking-wide">Due Tomorrow</span>
                </span>
              )}
            </div>

            {/* Title with Hover Effect */}
            <Link
              to={`/homework/${homework.id}`}
              className="block text-3xl font-extrabold text-gray-900 hover:text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-300 mb-4 group"
            >
              <span className="flex items-center gap-3">
                {homework.title}
                <svg className="w-7 h-7 text-blue-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>

            {/* Subject and Teacher Info with Enhanced Styling */}
            <div className="flex flex-wrap gap-3 mb-5">
              {subjectName && (
                <div className="inline-flex items-center gap-2.5 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 px-4 py-2.5 rounded-2xl font-semibold text-sm shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>{subjectName}</span>
                </div>
              )}
              {teacherName && role === 'eleve' && (
                <div className="inline-flex items-center gap-2.5 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 px-4 py-2.5 rounded-2xl font-semibold text-sm shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{teacherName}</span>
                </div>
              )}
            </div>

            {/* Deadline with Enhanced Design */}
            <div className="inline-flex items-center gap-3 bg-gradient-to-br from-slate-50 to-slate-100 px-5 py-3.5 rounded-2xl shadow-md border border-slate-200">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-gray-900 font-bold text-base tracking-wide">{formatDate(homework.deadline)}</span>
            </div>
          </div>
        </div>

        {/* Description with Better Typography */}
        <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed text-base">{homework.description}</p>

        {/* File Attachment with Enhanced Design */}
        {homework.fileUrl && (
          <a
            href={homework.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600 hover:shadow-xl px-6 py-3.5 rounded-2xl text-sm font-bold transition-all mb-6 hover:scale-105 border border-blue-200 hover:border-blue-300"
          >
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="tracking-wide">Download Attachment</span>
          </a>
        )}

        {/* Actions with Enhanced Buttons */}
        {showActions && (
          <div className="flex flex-wrap gap-3 mt-6">
            {/* Student actions for regular homework */}
            {role === 'eleve' && (homework.type === 'homework' || !homework.type) && homework.status !== 'complete' && onMarkComplete && (
              <button
                onClick={() => onMarkComplete(homework.id)}
                className="inline-flex items-center gap-2.5 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-7 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 border border-green-400"
              >
                <div className="p-1 bg-white/20 rounded-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="tracking-wide">Mark Complete</span>
              </button>
            )}

            {/* Exam/Quiz status for students */}
            {role === 'eleve' && (homework.type === 'exam' || homework.type === 'quiz') && homework.locationType === 'online' && (
              <>
                {!homework.isAvailable ? (
                  <div className="inline-flex items-center gap-2.5 bg-gradient-to-br from-gray-400 to-gray-500 text-white px-7 py-3.5 rounded-2xl text-sm font-bold shadow-lg">
                    <div className="p-1 bg-white/20 rounded-lg">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="tracking-wide">Waiting for Teacher</span>
                  </div>
                ) : homework.submissions && homework.submissions[userData?.uid || ''] ? (
                  <div className="inline-flex items-center gap-2.5 bg-gradient-to-br from-green-500 to-emerald-600 text-white px-7 py-3.5 rounded-2xl text-sm font-bold shadow-lg border border-green-400">
                    <div className="p-1 bg-white/20 rounded-lg">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="tracking-wide">Submitted</span>
                  </div>
                ) : (
                  <Link
                    to={`/homework/${homework.id}/take`}
                    className="inline-flex items-center gap-2.5 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-7 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 border border-green-400"
                  >
                    <div className="p-1 bg-white/20 rounded-lg">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="tracking-wide">Start {homework.type === 'exam' ? 'Exam' : 'Quiz'}</span>
                  </Link>
                )}
              </>
            )}

            {/* In-person exam/quiz indicator for students */}
            {role === 'eleve' && (homework.type === 'exam' || homework.type === 'quiz') && homework.locationType === 'in-person' && (
              <div className="inline-flex items-center gap-2.5 bg-gradient-to-br from-orange-500 to-amber-600 text-white px-7 py-3.5 rounded-2xl text-sm font-bold shadow-lg border border-orange-400">
                <div className="p-1 bg-white/20 rounded-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="tracking-wide">🏫 In-Person</span>
              </div>
            )}

            {/* Teacher control for exams/quizzes */}
            {role === 'prof' && (homework.type === 'exam' || homework.type === 'quiz') && homework.locationType === 'online' && onToggleAvailability && (
              <button
                onClick={() => onToggleAvailability(homework.id, !homework.isAvailable)}
                className={`inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 ${
                  homework.isAvailable
                    ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border border-red-400'
                    : 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border border-green-400'
                }`}
              >
                <div className="p-1 bg-white/20 rounded-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    {homework.isAvailable ? (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    )}
                  </svg>
                </div>
                <span className="tracking-wide">{homework.isAvailable ? 'Close Exam' : 'Launch Exam'}</span>
              </button>
            )}

            {role === 'prof' && (
              <>
                {onEdit && (
                  <button
                    onClick={() => onEdit(homework.id)}
                    className="inline-flex items-center gap-2.5 bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-7 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 border border-blue-400"
                  >
                    <div className="p-1 bg-white/20 rounded-lg">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </div>
                    <span className="tracking-wide">Edit</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(homework.id)}
                    className="inline-flex items-center gap-2.5 bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-7 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 border border-red-400"
                  >
                    <div className="p-1 bg-white/20 rounded-lg">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="tracking-wide">Delete</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeworkCard;
