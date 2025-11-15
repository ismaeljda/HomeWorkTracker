const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderType: 'student' | 'teacher' | 'ai';
  senderName?: string;
  text: string;
  timestamp: Date;
}

async function callGeminiAPI(prompt: string): Promise<string> {
  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API Error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

export async function getAIHint(
  assignmentTitle: string,
  assignmentDescription: string,
  studentQuestion: string,
  chatHistory: ChatMessage[]
): Promise<string> {
  const systemPrompt = `You are an educational AI assistant helping students with their homework. Your role is to:
- Guide students with hints and methodologies
- Ask leading questions to help them think critically
- NEVER provide direct answers or solutions
- If a student asks for the answer directly, redirect them with guiding questions
- Focus on teaching concepts and problem-solving approaches
- Be encouraging and supportive

Assignment: ${assignmentTitle}
Description: ${assignmentDescription}

If the student asks for the complete answer, respond with something like:
"I can't give you the answer directly, but let me help you figure it out! What part are you stuck on?"
`;

  const historyContext = chatHistory
    .filter(msg => msg.senderType !== 'ai')
    .slice(-5)
    .map(msg => `${msg.senderType === 'student' ? 'Student' : 'Teacher'}: ${msg.text}`)
    .join('\n');

  const prompt = `${systemPrompt}

Recent conversation:
${historyContext}

Student's current question: ${studentQuestion}

Provide a helpful hint or guidance (2-3 sentences max):`;

  try {
    console.log('API Key exists:', !!API_KEY);
    return await callGeminiAPI(prompt);
  } catch (error) {
    console.error('Error getting AI hint:', error);
    return "I'm having trouble connecting right now. Please try again in a moment!";
  }
}

export async function summarizeDiscussion(
  assignmentTitle: string,
  messages: ChatMessage[]
): Promise<{
  mainDifficulties: string[];
  keyConcepts: string[];
  helpfulExplanations: string[];
  unansweredQuestions: string[];
}> {
  const conversationText = messages
    .map(msg => {
      const sender = msg.senderType === 'ai' ? 'AI Assistant' :
                     msg.senderType === 'teacher' ? 'Teacher' : 'Student';
      return `${sender}: ${msg.text}`;
    })
    .join('\n');

  const prompt = `Analyze this discussion about the assignment "${assignmentTitle}":

${conversationText}

Provide a structured summary in the following JSON format:
{
  "mainDifficulties": ["difficulty 1", "difficulty 2"],
  "keyConcepts": ["concept 1", "concept 2"],
  "helpfulExplanations": ["explanation 1", "explanation 2"],
  "unansweredQuestions": ["question 1", "question 2"]
}

Focus on educational insights. If a category is empty, use an empty array.`;

  try {
    const text = await callGeminiAPI(prompt);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      mainDifficulties: [],
      keyConcepts: [],
      helpfulExplanations: [],
      unansweredQuestions: []
    };
  } catch (error) {
    console.error('Error summarizing discussion:', error);
    throw new Error('Failed to generate summary');
  }
}
