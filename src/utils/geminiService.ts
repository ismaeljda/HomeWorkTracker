// Cloudflare Worker URL
const WORKER_URL = 'https://gemini-proxy.ismaelsall526.workers.dev';

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderType: 'student' | 'teacher' | 'ai';
  senderName?: string;
  text: string;
  timestamp: Date;
}

export async function getAIHint(
  assignmentTitle: string,
  assignmentDescription: string,
  studentQuestion: string,
  chatHistory: ChatMessage[]
): Promise<string> {
  try {
    const conversationHistory = chatHistory.map(msg => ({
      isUser: msg.senderType !== 'ai',
      message: msg.text
    }));

    conversationHistory.push({
      isUser: true,
      message: studentQuestion
    });

    const response = await fetch(`${WORKER_URL}/generate-hint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assignmentTitle,
        assignmentDescription,
        conversationHistory
      })
    });

    if (!response.ok) {
      throw new Error(`Worker error: ${response.status}`);
    }

    const data = await response.json();
    return data.message || "I'm having trouble connecting right now. Please try again in a moment!";
  } catch (error) {
    console.error('Error getting AI hint:', error);
    return "I'm having trouble connecting right now. Please try again in a moment!";
  }
}

export async function summarizeDiscussion(
  _assignmentTitle: string,
  messages: ChatMessage[]
): Promise<{
  mainDifficulties: string[];
  keyConcepts: string[];
  helpfulExplanations: string[];
  unansweredQuestions: string[];
}> {
  try {
    const formattedMessages = messages.map(msg => ({
      userName: msg.senderType === 'ai' ? 'AI Assistant' :
                msg.senderType === 'teacher' ? 'Professeur' :
                msg.senderName || 'Élève',
      message: msg.text
    }));

    const response = await fetch(`${WORKER_URL}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: formattedMessages
      })
    });

    if (!response.ok) {
      throw new Error(`Worker error: ${response.status}`);
    }

    const data = await response.json();
    const summaryText = data.summary || '';

    return {
      mainDifficulties: extractListItems(summaryText, 'difficultés|problèmes|points difficiles'),
      keyConcepts: extractListItems(summaryText, 'concepts|notions|points clés'),
      helpfulExplanations: extractListItems(summaryText, 'explications|solutions|réponses'),
      unansweredQuestions: extractListItems(summaryText, 'questions sans réponse|questions restantes')
    };
  } catch (error) {
    console.error('Error summarizing discussion:', error);
    throw new Error('Failed to generate summary');
  }
}

function extractListItems(text: string, keywords: string): string[] {
  const lines = text.split('\n');
  const items: string[] = [];

  let inSection = false;
  const keywordRegex = new RegExp(keywords, 'i');

  for (const line of lines) {
    if (keywordRegex.test(line)) {
      inSection = true;
      continue;
    }

    if (inSection) {
      const match = line.match(/^[\s\-\*•]\s*(.+)/);
      if (match && match[1].trim()) {
        items.push(match[1].trim());
      } else if (line.trim() && !line.match(/^#+/)) {
        items.push(line.trim());
      } else if (line.trim() === '') {
        inSection = false;
      }
    }
  }

  return items.slice(0, 5);
}
