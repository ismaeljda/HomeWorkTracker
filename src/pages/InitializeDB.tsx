import React, { useState } from 'react';
import { initializeDatabase } from '../scripts/initializeData';
import { addHomeworksData } from '../scripts/addHomeworksData';

const InitializeDB: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [homeworkResult, setHomeworkResult] = useState<any>(null);

  const handleInitialize = async () => {
    if (!window.confirm('⚠️ This will create sample data in your database. Continue?')) {
      return;
    }

    setLoading(true);
    setResult(null);
    setHomeworkResult(null);

    const res = await initializeDatabase();
    setResult(res);
    setLoading(false);
  };

  const handleAddHomeworks = async () => {
    if (!window.confirm('⚠️ This will add homework, exam, and quiz data. Continue?')) {
      return;
    }

    setLoading(true);
    setHomeworkResult(null);

    const res = await addHomeworksData();
    setHomeworkResult(res);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Initialize Database</h1>
          <p className="text-gray-600">Create sample data for HomeworkTracker</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-blue-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            What will be created:
          </h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">👑</span>
              <span><strong>1 Admin:</strong> admin@homeworktracker.com / admin123</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🏫</span>
              <span><strong>3 Classes:</strong> 6A, 6B, Terminale S</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">👨‍🏫</span>
              <span><strong>5 Teachers:</strong> M. Martin, Mme Lefebvre, M. Bernard, Mme Durand, M. Rousseau</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🎓</span>
              <span><strong>8 Students:</strong> 5 in 6A, 3 in 6B</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">📚</span>
              <span><strong>10 Subjects:</strong> Math, Français, Histoire-Géo, Sciences, Anglais (for each class)</span>
            </li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-yellow-800">
              <p className="font-semibold">Important:</p>
              <p>This will only work if your database is empty. If you already have users, clear the database first.</p>
            </div>
          </div>
        </div>

        {result && (
          <div className={`rounded-lg p-6 mb-6 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start space-x-3">
              {result.success ? (
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <div className={result.success ? 'text-green-800' : 'text-red-800'}>
                <p className="font-semibold mb-2">{result.message}</p>
                {result.success && result.summary && (
                  <div className="text-sm space-y-1">
                    <p>✓ Admin: {result.summary.admin}</p>
                    <p>✓ Classes: {result.summary.classes}</p>
                    <p>✓ Teachers: {result.summary.teachers}</p>
                    <p>✓ Students: {result.summary.students}</p>
                    <p>✓ Subjects: {result.summary.subjects}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleInitialize}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Initializing...
              </span>
            ) : (
              'Initialize Database (Step 1)'
            )}
          </button>

          <button
            onClick={handleAddHomeworks}
            disabled={loading || !result?.success}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding Homeworks...
              </span>
            ) : (
              'Add Homeworks & Exams (Step 2)'
            )}
          </button>
        </div>

        {homeworkResult && (
          <div className={`rounded-lg p-6 mb-6 mt-6 ${homeworkResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start space-x-3">
              {homeworkResult.success ? (
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <div className={homeworkResult.success ? 'text-green-800' : 'text-red-800'}>
                <p className="font-semibold mb-2">{homeworkResult.message}</p>
                {homeworkResult.success && homeworkResult.summary && (
                  <div className="text-sm space-y-1">
                    <p>✓ Homeworks: {homeworkResult.summary.homeworks}</p>
                    <p>✓ Exams: {homeworkResult.summary.exams}</p>
                    <p>✓ Quizzes: {homeworkResult.summary.quizzes}</p>
                    <p>✓ Total: {homeworkResult.summary.total}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {result?.success && homeworkResult?.success && (
          <div className="mt-6 text-center">
            <a
              href="/login"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-all shadow-lg"
            >
              Go to Login →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default InitializeDB;
