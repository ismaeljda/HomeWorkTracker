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

  // Calculate time remaining
  const getTimeRemaining = () => {
    const now = new Date();
    const deadline = homework.deadline?.toDate ? homework.deadline.toDate() : new Date(homework.deadline as any);

    if (!deadline || isNaN(deadline.getTime())) return 'N/A';
    
    const diffMs = deadline.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Overdue';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    // Only show hours if less than 24 hours remaining
    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h ${diffMinutes}m`;
    return `${diffMinutes}m`;
  };

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

  return (
    <div className={`homework-card relative rounded-xl transition-all duration-300 overflow-hidden hover:-translate-y-1 bg-white border border-gray-200 ${
      homework.type === 'exam' ? 'shadow-[0_4px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_8px_30px_rgba(239,68,68,0.4)]' :
      homework.type === 'quiz' ? 'shadow-[0_4px_20px_rgba(168,85,247,0.3)] hover:shadow-[0_8px_30px_rgba(168,85,247,0.4)]' :
      'shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.4)]'
    }`}>
      
      <div className="p-6">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {/* Type Icon Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm ${
                homework.type === 'exam' ? 'bg-red-50 text-red-700 border border-red-200' :
                homework.type === 'quiz' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  {homework.type === 'exam' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  ) : homework.type === 'quiz' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  )}
                </svg>
                <span className="tracking-wide uppercase">{typeColors.label}</span>
              </div>

              {role === 'prof' && (
                <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-2 rounded-lg font-semibold text-sm border border-slate-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span>{completedStudents}/{totalStudents}</span>
                </span>
              )}

              {role === 'eleve' && (homework as any).status === 'complete' && (
                <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg font-semibold text-sm border border-green-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="uppercase tracking-wide">Completed</span>
                </span>
              )}

              {late && (
                <span className="badge inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg font-bold text-sm border border-red-200 animate-pulse">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="uppercase tracking-wide">Overdue</span>
                </span>
              )}

              {!late && dueTomorrow && (
                <span className="badge inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg font-bold text-sm border border-yellow-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="uppercase tracking-wide">Due Tomorrow</span>
                </span>
              )}
            </div>

            {/* Title */}
            <Link
              to={`/homework/${homework.id}`}
              className="block group mb-4"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors flex items-center gap-2 leading-tight">
                {homework.title}
                <svg className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </h2>
            </Link>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {subjectName && (
                <div className="flex items-center gap-2 text-gray-800 font-semibold">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-base">{subjectName}</span>
                </div>
              )}
              
              {teacherName && role === 'eleve' && (
                <div className="flex items-center gap-2 text-gray-800 font-semibold">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-base">{teacherName}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-800 font-semibold">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-base">{formatDate(homework.deadline)}</span>
              </div>

              {/* Time Remaining Badge */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-sm ${
                late ? 'bg-red-100 text-red-700 border border-red-200' :
                dueTomorrow ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                'bg-gray-100 text-gray-700 border border-gray-200'
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{getTimeRemaining()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* File Attachment */}
        {homework.fileUrl && (
          <a
            href={homework.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 text-base font-bold mb-4 underline hover:opacity-70 transition-opacity ${
              homework.type === 'exam' ? 'text-red-600' :
              homework.type === 'quiz' ? 'text-purple-600' :
              'text-blue-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download Attachment</span>
          </a>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
            {/* Student actions for regular homework - View Details button */}
            {role === 'eleve' && (homework.type === 'homework' || !homework.type) && (
              <Link
                to={`/homework/${homework.id}`}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                View Details
              </Link>
            )}

            {/* Exam/Quiz status for students */}
            {role === 'eleve' && (homework.type === 'exam' || homework.type === 'quiz') && homework.locationType === 'online' && (() => {
              const now = new Date();
              const deadlineDate = homework.deadline?.toDate ? homework.deadline.toDate() : new Date(homework.deadline as any);
              const isManuallyAvailable = homework.isAvailable === true;
              const isDeadlineReached = now >= deadlineDate;
              const canTakeExam = isManuallyAvailable || isDeadlineReached;

              return (
                <>
                  {homework.submissions && homework.submissions[userData?.uid || ''] ? (
                    <div className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Submitted
                    </div>
                  ) : !canTakeExam ? (
                    <div className="inline-flex items-center gap-2 bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                      </svg>
                      Not Available
                    </div>
                  ) : (
                    <Link
                      to={`/homework/${homework.id}/take`}
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Start {homework.type === 'exam' ? 'Exam' : 'Quiz'}
                    </Link>
                  )}
                </>
              );
            })()}

            {/* In-person exam/quiz indicator for students */}
            {role === 'eleve' && (homework.type === 'exam' || homework.type === 'quiz') && homework.locationType === 'in-person' && (
              <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                In-Person
              </div>
            )}

            {/* Teacher control for exams/quizzes */}
            {role === 'prof' && (homework.type === 'exam' || homework.type === 'quiz') && homework.locationType === 'online' && onToggleAvailability && (
              <button
                onClick={() => onToggleAvailability(homework.id, !homework.isAvailable)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg ${
                  homework.isAvailable
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  {homework.isAvailable ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  )}
                </svg>
                {homework.isAvailable ? 'Close Exam' : 'Launch Exam'}
              </button>
            )}

            {role === 'prof' && (
              <>
                {onEdit && (
                  <button
                    onClick={() => onEdit(homework.id)}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(homework.id)}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
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
