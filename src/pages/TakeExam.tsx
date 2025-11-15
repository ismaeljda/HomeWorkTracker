import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getHomeworkById,
  updateHomework,
  type Homework,
  type StudentAnswer,
  type StudentSubmission
} from '../firebase/firestore';
import { Timestamp } from 'firebase/firestore';

const TakeExam: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [homework, setHomework] = useState<Homework | null>(null);
  const [answers, setAnswers] = useState<{ [questionId: string]: string | number | boolean }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [startTime] = useState(new Date());

  useEffect(() => {
    const fetchHomework = async () => {
      if (!id) return;
      const hw = await getHomeworkById(id);
      if (hw) {
        setHomework(hw);

        // Check if already submitted
        if (hw.submissions && userData?.uid && hw.submissions[userData.uid]) {
          alert('You have already submitted this exam/quiz');
          navigate(`/homework/${id}`);
          return;
        }

        // Set timer if duration exists
        if (hw.duration) {
          setTimeRemaining(hw.duration * 60); // Convert minutes to seconds
        }
      }
      setLoading(false);
    };
    fetchHomework();
  }, [id, userData?.uid, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          // Auto-submit when time runs out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: string | number | boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!homework || !id || !userData?.uid) return;

    // Confirm submission
    if (!window.confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
      return;
    }

    setSubmitting(true);

    try {
      // Auto-grade MCQ and True/False questions
      const studentAnswers: StudentAnswer[] = (homework.questions || []).map(q => {
        const userAnswer = answers[q.id];
        let isCorrect = false;
        let points = 0;

        if (q.type === 'mcq' || q.type === 'true-false') {
          if (q.type === 'true-false') {
            const correctBool = q.correctAnswer === true || q.correctAnswer === 1;
            const userBool = userAnswer === true || userAnswer === 1 || userAnswer === 'true';
            isCorrect = correctBool === userBool;
          } else {
            isCorrect = userAnswer === q.correctAnswer;
          }
          points = isCorrect ? q.points : 0;
        }

        return {
          questionId: q.id,
          answer: userAnswer ?? '',
          isCorrect: q.type === 'open-ended' ? undefined : isCorrect,
          points: q.type === 'open-ended' ? undefined : points
        };
      });

      // Calculate grade for auto-graded questions
      const autoGradedPoints = studentAnswers
        .filter(a => a.points !== undefined)
        .reduce((sum, a) => sum + (a.points || 0), 0);

      const maxAutoGradedPoints = (homework.questions || [])
        .filter(q => q.type !== 'open-ended')
        .reduce((sum, q) => sum + q.points, 0);

      const totalMaxPoints = (homework.questions || [])
        .reduce((sum, q) => sum + q.points, 0);

      const submission: StudentSubmission = {
        studentId: userData.uid,
        answers: studentAnswers,
        submittedAt: Timestamp.now(),
        grade: (homework.questions || []).every(q => q.type !== 'open-ended') ? autoGradedPoints : undefined,
        maxGrade: totalMaxPoints
      };

      // Update homework with submission
      const updatedSubmissions = {
        ...(homework.submissions || {}),
        [userData.uid]: submission
      };

      // Also mark as complete
      const updatedCompletions = {
        ...(homework.studentCompletions || {}),
        [userData.uid]: true
      };

      await updateHomework(id, {
        ...homework,
        submissions: updatedSubmissions,
        studentCompletions: updatedCompletions
      });

      alert('Submission successful!');
      navigate(`/homework/${id}`);
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Failed to submit. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!homework || !homework.questions || homework.questions.length === 0) {
    return <div className="flex items-center justify-center min-h-screen">No questions available</div>;
  }

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = homework.questions.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with Timer */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">{homework.title}</h1>
            <p className="text-gray-600">
              {homework.type === 'exam' ? '📝 Exam' : '❓ Quiz'} •
              {' '}{totalQuestions} questions • Progress: {answeredCount}/{totalQuestions}
            </p>
          </div>

          {timeRemaining !== null && (
            <div className={`text-center ${timeRemaining < 300 ? 'text-red-600' : 'text-blue-600'}`}>
              <div className="text-sm font-semibold">Time Remaining</div>
              <div className="text-4xl font-bold">{formatTime(timeRemaining)}</div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {homework.questions.map((question, index) => (
          <div key={question.id} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-lg font-bold">
                    Question {index + 1}
                  </span>
                  <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-lg">
                    {question.type === 'mcq' ? 'Multiple Choice' : question.type === 'true-false' ? 'True/False' : 'Open-Ended'}
                  </span>
                  <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-lg font-semibold">
                    {question.points} {question.points === 1 ? 'point' : 'points'}
                  </span>
                </div>
                <p className="text-lg font-medium text-gray-800">{question.question}</p>
              </div>
            </div>

            {/* MCQ Options */}
            {question.type === 'mcq' && question.options && (
              <div className="space-y-3">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      answers[question.id] === optionIndex
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={answers[question.id] === optionIndex}
                      onChange={() => handleAnswerChange(question.id, optionIndex)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="text-gray-800">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* True/False */}
            {question.type === 'true-false' && (
              <div className="flex space-x-4">
                <label
                  className={`flex-1 flex items-center justify-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answers[question.id] === true || answers[question.id] === 1
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={answers[question.id] === true || answers[question.id] === 1}
                    onChange={() => handleAnswerChange(question.id, true)}
                    className="w-5 h-5 text-green-600"
                  />
                  <span className="text-lg font-semibold text-gray-800">True</span>
                </label>

                <label
                  className={`flex-1 flex items-center justify-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answers[question.id] === false || answers[question.id] === 0
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={answers[question.id] === false || answers[question.id] === 0}
                    onChange={() => handleAnswerChange(question.id, false)}
                    className="w-5 h-5 text-red-600"
                  />
                  <span className="text-lg font-semibold text-gray-800">False</span>
                </label>
              </div>
            )}

            {/* Open-Ended */}
            {question.type === 'open-ended' && (
              <textarea
                value={(answers[question.id] as string) || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type your answer here..."
              />
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="text-gray-600">
            <p className="font-semibold">Answered: {answeredCount} / {totalQuestions}</p>
            {answeredCount < totalQuestions && (
              <p className="text-sm text-orange-600">⚠️ You haven't answered all questions</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-bold text-lg transition"
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TakeExam;
