import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHomeworkById, updateHomework, type Homework } from '../firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { formatDate, isLate, isDueTomorrow } from '../utils/helpers';
import AssignmentChat from '../components/AssignmentChat';

const HomeworkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [homework, setHomework] = useState<Homework | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomework = async () => {
      if (!id) return;
      try {
        const data = await getHomeworkById(id);
        setHomework(data);
      } catch (error) {
        console.error('Error fetching homework:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomework();
  }, [id]);

  const handleMarkComplete = async () => {
    if (!homework || !userData?.uid) return;

    const confirmed = window.confirm('Are you sure you want to mark this assignment as complete?');
    if (!confirmed) return;

    try {
      const updatedCompletions = { ...homework.studentCompletions, [userData.uid]: true };
      await updateHomework(homework.id, { studentCompletions: updatedCompletions });
      setHomework({ ...homework, studentCompletions: updatedCompletions });
    } catch (error) {
      console.error('Error marking homework as complete:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!homework) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">Homework not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const late = isLate(homework.deadline);
  const dueTomorrow = isDueTomorrow(homework.deadline);
  const isCompleted = homework.studentCompletions?.[userData?.uid || ''] || false;

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
      >
        <svg
          className="w-5 h-5 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </button>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold mb-2">{homework.title}</h1>
            <div className="flex flex-col items-end space-y-2">
              {late && (
                <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                  Late
                </span>
              )}
              {!late && dueTomorrow && (
                <span className="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full">
                  Due Tomorrow
                </span>
              )}
              <span
                className={`text-sm px-3 py-1 rounded-full ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {isCompleted ? 'Complete' : 'Assigned'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <span className="text-gray-600 font-medium">Deadline: </span>
            <span className="text-gray-800">{formatDate(homework.deadline)}</span>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{homework.description}</p>
          </div>
        </div>

        {homework.fileUrl && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Attachment</h2>
            <a
              href={homework.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download Attachment
            </a>
          </div>
        )}

        {userData?.role === 'eleve' && !isCompleted && (
          <button
            onClick={handleMarkComplete}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Mark as Complete
          </button>
        )}
      </div>

      {/* Assignment Chat */}
      <AssignmentChat
        assignmentId={homework.id}
        assignmentTitle={homework.title}
        assignmentDescription={homework.description}
        isTeacher={userData?.role === 'prof'}
      />
    </div>
  );
};

export default HomeworkDetail;
