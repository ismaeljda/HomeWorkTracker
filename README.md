# HomeworkTracker

A comprehensive educational platform designed to streamline homework management and enhance student-teacher collaboration with AI-powered assistance.

## About the Project

HomeworkTracker is a modern web application built to help educational institutions manage assignments, schedules, and student-teacher interactions efficiently. The platform provides role-based dashboards for administrators, teachers, and students, each tailored to their specific needs. With integrated AI assistance powered by Google Gemini, students can get pedagogical guidance while working on assignments, and teachers can access AI-generated summaries of class discussions.

The project aims to:
- **Simplify homework management** for teachers and students
- **Improve communication** between all educational stakeholders
- **Provide intelligent assistance** without replacing the teacher's role
- **Track student progress** and assignment completion
- **Centralize schedules** and academic calendars

## Features by Role

### 👨‍💼 Administrator Dashboard

Administrators have full control over the platform:
- **User Management**: Create and manage student, teacher, and admin accounts
- **Activation Codes**: Generate activation codes for new user registration with pre-assigned classes and subjects
- **Subject & Class Management**: Create and organize subjects (courses) and classes
- **Assignment Oversight**: View all assignments across all subjects
- **Schedule Management**: Set up class schedules and timetables
- **System Configuration**: Access to database initialization and bulk data operations

### 👨‍🏫 Teacher Dashboard

Teachers can manage their courses and track student progress:
- **Course Management**: Create and edit subjects/courses they teach
- **Assignment Creation**: Post homework with descriptions, due dates, and resources
- **Student Tracking**: Monitor assignment completion and student progress
- **Announcements**: Broadcast messages to students in their classes
- **Discussion Moderation**: Participate in assignment discussion channels
- **AI Summaries**: Get AI-generated summaries of student discussions to identify common difficulties
- **Calendar View**: See teaching schedule and assignment deadlines

### 👨‍🎓 Student Dashboard

Students have access to all their academic information:
- **Assignment Tracking**: View all homework with status (completed/pending) and due dates
- **Course Materials**: Access subject information and resources
- **Interactive Calendar**: See class schedules and assignment deadlines in a weekly/monthly view
- **Discussion Channels**: Participate in public discussions for each assignment
- **AI Assistant**: Get private, personalized hints and guidance without direct answers
- **Progress Monitoring**: Track completed vs pending assignments
- **Announcements**: Receive important messages from teachers
- **Guided Tutorials**: First-time students get an interactive tutorial

## Key Features

### 🤖 AI-Powered Learning Assistant

**Private AI Chat** (Students only)
- Get personalized hints tailored to your questions
- AI guides without revealing answers to encourage critical thinking
- Conversation history persists for context-aware assistance
- Clear chat option to start fresh

**Discussion Summaries** (Teachers)
- AI analyzes public discussions and extracts:
  - Main difficulties students encountered
  - Key concepts discussed
  - Helpful explanations provided
  - Unanswered questions requiring teacher attention

### 📅 Smart Calendar

- **Week View**: Monday-Friday schedule with color-coded subjects
- **Month View**: Assignment deadlines and important dates
- **Auto-sync**: Assignments and schedules automatically appear
- **Time-based Layout**: Visual representation of daily class schedule

### 💬 Assignment Discussions

- **Public Channels**: Students and teachers collaborate on assignments
- **Real-time Updates**: Messages appear instantly using Firestore listeners
- **Role Identification**: Teachers and students are visually distinguished
- **Dual Chat System**: Public discussion + private AI assistant for students

### 🔐 Secure Authentication & Authorization

- Firebase Authentication for secure login
- Role-based access control (admin/teacher/student)
- Activation code system for controlled user registration
- Protected routes based on user roles

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Hosting)
- **AI Integration**: Google Gemini 1.5 Pro via Cloudflare Worker proxy
- **Build Tool**: Vite
- **State Management**: React Context API
- **UI Components**: Custom components with Joyride for tutorials

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project ([Create one](https://console.firebase.google.com/))
- Google Gemini API key ([Get one](https://aistudio.google.com/app/apikey))
- Cloudflare account for worker deployment

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HomeworkTracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Fill in your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Setup Cloudflare Worker** (for AI proxy)

   Navigate to the worker directory:
   ```bash
   cd cloudflare-worker
   npm install
   ```

   Configure `wrangler.toml` with your Cloudflare account details and add your Gemini API key as a secret:
   ```bash
   npx wrangler secret put GEMINI_API_KEY
   ```

   Deploy the worker:
   ```bash
   npx wrangler deploy
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

7. **Deploy to Firebase Hosting**
   ```bash
   firebase deploy --only hosting
   ```

### Initial Setup

1. Access `/initialize-db` route (admin only)
2. Use the initialization scripts to:
   - Create initial classes
   - Create initial subjects
   - Add sample schedules
   - Create sample homework (optional)

3. Create your first admin user through Firebase Console
4. Use admin dashboard to create teacher and student accounts

## Project Structure

```
HomeworkTracker/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── AssignmentChat.tsx    # AI-powered discussion
│   │   ├── Navbar.tsx            # Navigation bar
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── DashboardAdmin.tsx
│   │   ├── DashboardTeacher.tsx
│   │   ├── DashboardEleve.tsx
│   │   ├── MyCalendar.tsx
│   │   ├── HomeworkDetail.tsx
│   │   └── ...
│   ├── context/            # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── TutorialContext.tsx
│   ├── utils/              # Utility functions
│   │   └── geminiService.ts
│   ├── firebase/           # Firebase configuration
│   │   └── config.ts
│   └── scripts/            # Database initialization scripts
│       ├── addClasses.ts
│       ├── addSubjects.ts
│       └── ...
├── cloudflare-worker/      # Gemini API proxy
│   └── src/
│       └── index.js
└── public/                 # Static assets
```

## Firebase Firestore Structure

```
users/
  {userId}/
    - name, email, role, classId

classes/
  {classId}/
    - name, studentIds[]

subjects/
  {subjectId}/
    - name, description, teacherId, studentIds[]

assignments/
  {assignmentId}/
    - title, description, dueDate, subjectId
    /messages/              # Public discussion
      {messageId}/
    /aiChats/              # Private AI chats
      {studentId}/
        /messages/

schedules/
  {scheduleId}/
    - subjectId, classId, dayOfWeek, startTime, endTime

announcements/
  {announcementId}/
    - title, content, createdAt, authorId
```

## AI Configuration

The AI assistant uses Google Gemini 1.5 Pro and is configured to:
- **Provide hints**, not direct answers
- **Ask guiding questions** to encourage critical thinking
- **Explain concepts** in simple terms
- **Redirect** students who ask for complete solutions
- **Respond in French** to match the educational context
- **Maintain conversation context** for personalized assistance

## Security Considerations

- API keys stored in environment variables (never committed to git)
- Gemini API key protected via Cloudflare Worker proxy
- CORS configured to allow only authorized domains
- Firebase Security Rules enforce role-based access
- Activation codes required for user registration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

## Acknowledgments

- Built with [React](https://react.dev/)
- Powered by [Firebase](https://firebase.google.com/)
- AI by [Google Gemini](https://ai.google.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
