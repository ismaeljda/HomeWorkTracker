import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { getAIHint, summarizeDiscussion, type ChatMessage } from '../utils/geminiService';

interface AssignmentChatProps {
  assignmentId: string;
  assignmentTitle: string;
  assignmentDescription: string;
  isTeacher?: boolean;
}

export default function AssignmentChat({
  assignmentId,
  assignmentTitle,
  assignmentDescription,
  isTeacher = false
}: AssignmentChatProps) {
  const { currentUser, userData } = useAuth();
  const [publicMessages, setPublicMessages] = useState<ChatMessage[]>([]);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [showAiChat, setShowAiChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen to public messages
  useEffect(() => {
    const q = query(
      collection(db, 'assignments', assignmentId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({
          id: doc.id,
          senderId: data.senderId,
          senderType: data.senderType,
          senderName: data.senderName,
          text: data.text,
          timestamp: data.timestamp?.toDate() || new Date()
        });
      });
      setPublicMessages(msgs);
    });

    return () => unsubscribe();
  }, [assignmentId]);

  // Listen to AI chat messages (private per student)
  useEffect(() => {
    if (!currentUser || isTeacher) return;

    const q = query(
      collection(db, 'assignments', assignmentId, 'aiChats', currentUser.uid, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({
          id: doc.id,
          senderId: data.senderId,
          senderType: data.senderType,
          senderName: data.senderName,
          text: data.text,
          timestamp: data.timestamp?.toDate() || new Date()
        });
      });
      setAiMessages(msgs);
    });

    return () => unsubscribe();
  }, [assignmentId, currentUser, isTeacher]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [publicMessages, aiMessages]);

  const sendPublicMessage = async (text: string) => {
    if (!text.trim() || !currentUser) return;

    try {
      await addDoc(collection(db, 'assignments', assignmentId, 'messages'), {
        senderId: currentUser.uid,
        senderType: isTeacher ? 'teacher' : 'student',
        senderName: userData?.name || 'Anonymous',
        text: text.trim(),
        timestamp: Timestamp.now()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendAiMessage = async (text: string, isAiResponse: boolean = false) => {
    if (!currentUser) return;

    try {
      await addDoc(collection(db, 'assignments', assignmentId, 'aiChats', currentUser.uid, 'messages'), {
        senderId: isAiResponse ? 'ai-assistant' : currentUser.uid,
        senderType: isAiResponse ? 'ai' : 'student',
        senderName: isAiResponse ? 'AI Assistant' : userData?.name || 'Anonymous',
        text: text.trim(),
        timestamp: Timestamp.now()
      });

      if (!isAiResponse) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending AI message:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showAiChat) {
      await sendAiMessage(newMessage);
      // Auto-request AI response
      handleAskForHint();
    } else {
      await sendPublicMessage(newMessage);
    }
  };

  const handleAskForHint = async () => {
    if (loading || !currentUser) return;

    setLoading(true);
    try {
      const lastUserMessage = aiMessages
        .filter(m => m.senderType === 'student')
        .slice(-1)[0];

      const question = lastUserMessage?.text || 'I need help getting started with this assignment.';

      const hint = await getAIHint(
        assignmentTitle,
        assignmentDescription,
        question,
        aiMessages
      );

      await sendAiMessage(hint, true);
    } catch (error) {
      console.error('Error getting AI hint:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (publicMessages.length === 0) return;

    setLoading(true);
    try {
      const summaryData = await summarizeDiscussion(assignmentTitle, publicMessages);
      setSummary(summaryData);
      setShowSummary(true);
    } catch (error) {
      console.error('Error summarizing discussion:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentMessages = showAiChat ? aiMessages : publicMessages;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          {showAiChat ? '🤖 AI Assistant (Private)' : '💬 Public Discussion'}
        </h3>
        <div className="flex gap-2">
          {!isTeacher && (
            <>
              <button
                onClick={() => setShowAiChat(!showAiChat)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  showAiChat
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {showAiChat ? '👥 Public Chat' : '🤖 AI Help'}
              </button>
            </>
          )}
          {!showAiChat && publicMessages.length > 0 && (
            <button
              onClick={handleSummarize}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
            >
              📊 Summarize
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="border rounded-lg p-4 h-96 overflow-y-auto mb-4 bg-gray-50">
        {currentMessages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. {showAiChat ? 'Ask the AI for help!' : 'Start the discussion!'}</p>
            {showAiChat && (
              <p className="text-sm mt-2">Type your question below and get personalized hints.</p>
            )}
          </div>
        ) : (
          currentMessages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 ${
                msg.senderType === 'ai'
                  ? 'bg-purple-100 border-l-4 border-purple-500'
                  : msg.senderType === 'teacher'
                  ? 'bg-green-50 border-l-4 border-green-500'
                  : 'bg-blue-50 border-l-4 border-blue-500'
              } p-3 rounded`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">
                  {msg.senderType === 'ai' ? '🤖 AI Assistant' :
                   msg.senderType === 'teacher' ? '👨‍🏫 ' + (msg.senderName || 'Teacher') :
                   '👨‍🎓 ' + (msg.senderName || 'Student')}
                </span>
                <span className="text-xs text-gray-500">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{msg.text}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={showAiChat ? "Ask the AI for help..." : "Type your message..."}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !newMessage.trim()}
          className={`px-6 py-2 rounded-lg disabled:opacity-50 transition-colors ${
            showAiChat
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>

      {/* Summary Modal */}
      {showSummary && summary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Discussion Summary</h3>
              <button
                onClick={() => setShowSummary(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {summary.mainDifficulties.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg text-red-600 mb-2">🚧 Main Difficulties</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {summary.mainDifficulties.map((item: string, idx: number) => (
                      <li key={idx} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.keyConcepts.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg text-blue-600 mb-2">💡 Key Concepts</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {summary.keyConcepts.map((item: string, idx: number) => (
                      <li key={idx} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.helpfulExplanations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg text-green-600 mb-2">✅ Helpful Explanations</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {summary.helpfulExplanations.map((item: string, idx: number) => (
                      <li key={idx} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.unansweredQuestions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg text-orange-600 mb-2">❓ Unanswered Questions</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {summary.unansweredQuestions.map((item: string, idx: number) => (
                      <li key={idx} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowSummary(false)}
              className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
