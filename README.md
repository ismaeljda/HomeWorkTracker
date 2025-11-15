# HomeworkTracker - Educational Platform with AI Assistant

A comprehensive homework tracking and course management system built with React, TypeScript, Firebase, and Google Gemini AI.

## Features

- 📚 Course and Assignment Management
- 👥 Student and Teacher Roles
- 📅 Calendar with Schedule Integration
- 💬 **AI-Powered Discussion Channels** for each assignment
- 🤖 Smart AI Assistant that guides students without giving answers
- 📊 AI-Generated Discussion Summaries
- ✅ Assignment Completion Tracking
- 🔔 Announcements and Real-time Updates

## AI Features

### Assignment Discussion Channels
Each assignment has its own discussion channel where:
- Students can discuss the assignment
- Teachers can provide guidance
- **AI Assistant participates and provides hints**

### AI Modes

#### Mode 2: AI Assisted Discussion
- AI provides hints and guidance without revealing answers
- Redirects students who ask for direct solutions
- Encourages critical thinking with leading questions
- "Ask for a Hint" button triggers AI assistance

#### Mode 3: AI Chat Summary
- "Summarize Discussion" button generates insights
- Identifies main difficulties students faced
- Lists key concepts discussed
- Highlights helpful explanations
- Shows unanswered questions

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
npm install @google/generative-ai
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- Firebase credentials (API key, project ID, etc.)
- **`VITE_GEMINI_API_KEY`** - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 3. Run the Application

```bash
npm run dev
```

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file as `VITE_GEMINI_API_KEY`

⚠️ **Important**: The Gemini API is free for development but has rate limits. For production use, check [Google's pricing](https://ai.google.dev/pricing).

## AI Assistant Guidelines

The AI is programmed to:
- ✅ Provide hints and methodology guidance
- ✅ Ask leading questions
- ✅ Explain concepts
- ❌ NEVER provide direct answers to assignments
- ❌ Redirect students who ask for solutions

## Project Structure

```
src/
├── components/
│   └── AssignmentChat.tsx    # AI-powered discussion component
├── utils/
│   └── geminiService.ts       # Gemini AI integration
├── pages/
│   ├── HomeworkDetail.tsx     # Assignment detail with chat
│   └── ...
└── firebase/
    └── firestore.ts           # Firebase database functions
```

## Technologies Used

- **React 19** with TypeScript
- **Firebase** (Firestore, Auth)
- **Google Gemini AI** for intelligent assistance
- **Tailwind CSS** for styling
- **Vite** for fast development

## Original Template Info

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
