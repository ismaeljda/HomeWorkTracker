import React from 'react';
import { Link } from 'react-router-dom';
import type { Homework } from '../firebase/firestore';
import { isLate, isDueTomorrow, formatDate } from '../utils/helpers';

interface HomeworkCardProps {
  homework: Homework;
  onMarkComplete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  role?: 'eleve' | 'prof' | 'admin';
}

const HomeworkCard: React.FC<HomeworkCardProps> = ({
  homework,
  onMarkComplete,
  onEdit,
  onDelete,
  showActions = false,
  role
}) => {
  const late = isLate(homework.deadline);
  const dueTomorrow = isDueTomorrow(homework.deadline);

  // Calculate completion statistics for teachers
  const totalStudents = homework.studentCompletions ? Object.keys(homework.studentCompletions).length : 0;
  const completedStudents = homework.studentCompletions
    ? Object.values(homework.studentCompletions).filter(completed => completed).length
    : 0;
  const completionPercentage = totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group hover:-translate-y-1">
      <div className={`h-2 ${late ? 'bg-gradient-to-r from-red-500 to-red-600' : dueTomorrow ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`} />

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <Link
              to={`/homework/${homework.id}`}
              className="text-xl font-bold text-gray-800 hover:text-indigo-600 transition-colors group-hover:text-indigo-600 flex items-center space-x-2"
            >
              <span>{homework.title}</span>
              <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <div className="flex items-center space-x-2 mt-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 text-sm font-medium">
                {formatDate(homework.deadline)}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            {late && (
              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-md flex items-center space-x-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>Late</span>
              </span>
            )}
            {!late && dueTomorrow && (
              <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-md flex items-center space-x-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Due Tomorrow</span>
              </span>
            )}

            {role === 'prof' ? (
              <span className="text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm bg-indigo-100 text-indigo-700 flex items-center space-x-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span>{completedStudents}/{totalStudents} completed</span>
              </span>
            ) : (
              <span
                className={`text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm flex items-center space-x-1 ${
                  homework.status === 'complete'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {homework.status === 'complete' ? (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Complete</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>Assigned</span>
                  </>
                )}
              </span>
            )}
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">{homework.description}</p>

        {homework.fileUrl && (
          <a
            href={homework.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download Attachment</span>
          </a>
        )}

        {showActions && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            {role === 'eleve' && homework.status !== 'complete' && onMarkComplete && (
              <button
                onClick={() => onMarkComplete(homework.id)}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Mark Complete</span>
              </button>
            )}

            {role === 'prof' && (
              <>
                {onEdit && (
                  <button
                    onClick={() => onEdit(homework.id)}
                    className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(homework.id)}
                    className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Delete</span>
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
