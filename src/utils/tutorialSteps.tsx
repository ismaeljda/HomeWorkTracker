import type { Step } from 'react-joyride';

export const studentTutorialSteps: Step[] = [
  // PART 1: WELCOME & OVERVIEW
  {
    target: 'body',
    content: (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-xl -m-8">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
            Welcome to HomeworkTracker
          </h2>
          <p className="text-gray-700 text-xl font-light">
            A quick 2-minute tour of the platform
          </p>
        </div>
        <div className="grid grid-cols-2 gap-5 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-indigo-100">
            <p className="text-lg font-semibold text-gray-800 mb-2">Homework Management</p>
            <p className="text-base text-gray-600">Track and complete assignments</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-purple-100">
            <p className="text-lg font-semibold text-gray-800 mb-2">AI Assistant</p>
            <p className="text-base text-gray-600">Get personalized help</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
            <p className="text-lg font-semibold text-gray-800 mb-2">Course Access</p>
            <p className="text-base text-gray-600">View all your classes</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-teal-100">
            <p className="text-lg font-semibold text-gray-800 mb-2">Calendar View</p>
            <p className="text-base text-gray-600">Organize your schedule</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-base text-indigo-600 font-medium">Click "Next" to begin the tour</p>
        </div>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },

  {
    target: 'nav',
    content: (
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Navigation Bar</h3>
        <p className="text-gray-600 mb-5 font-light text-lg">Your main menu for accessing the platform</p>
        <div className="space-y-3">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <p className="font-semibold text-blue-900 mb-1 text-lg">Homeworks</p>
            <p className="text-sm text-blue-700 font-light">View and manage all your assignments</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
            <p className="font-semibold text-purple-900 mb-1 text-lg">My Courses</p>
            <p className="text-sm text-purple-700 font-light">Access your enrolled courses</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <p className="font-semibold text-green-900 mb-1 text-lg">Calendar</p>
            <p className="text-sm text-green-700 font-light">View your personal schedule</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
            <p className="font-semibold text-orange-900 mb-1 text-lg">Profile</p>
            <p className="text-sm text-orange-700 font-light">Manage your account settings</p>
          </div>
        </div>
      </div>
    ),
    placement: 'bottom',
  },

  {
    target: '.stats-cards',
    content: (
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Quick Statistics</h3>
        <p className="text-gray-600 mb-5 font-light text-lg">
          Your performance overview at a glance
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-200">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <p className="text-base font-medium text-gray-700">Tasks to complete</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <p className="text-base font-medium text-gray-700">Overdue assignments</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <p className="text-base font-medium text-gray-700">Completed work</p>
            </div>
          </div>
        </div>
      </div>
    ),
    placement: 'bottom',
  },

  // PART 2: HOMEWORKS SECTION
  {
    target: '.filter-bar',
    content: (
      <div>
        <h3 className="text-xl font-bold mb-2">🔍 Search & Filters</h3>
        <p className="text-gray-700 mb-2">Use these filters to quickly find your homework:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
          <li><strong>🔍 Search</strong> - By keyword</li>
          <li><strong>📖 Subject</strong> - Filter by subject</li>
          <li><strong>✅ Status</strong> - Assigned, Completed</li>
          <li><strong>📝 Type</strong> - Homework, Exam, Quiz</li>
        </ul>
      </div>
    ),
    placement: 'bottom',
  },

  {
    target: '.homework-card:first-of-type',
    content: (
      <div>
        <h3 className="text-xl font-bold mb-2">📄 Homework Card</h3>
        <p className="text-gray-700 mb-2">Each card displays:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
          <li><strong>📌 Title & Type</strong> (📚 Homework / 📝 Exam / ❓ Quiz)</li>
          <li><strong>👨‍🏫 Teacher</strong> and subject</li>
          <li><strong>⏰ Deadline</strong></li>
          <li><strong>🕐 Time remaining</strong></li>
        </ul>
      </div>
    ),
    placement: 'top',
    spotlightClicks: true,
  },

  {
    target: '.homework-card:first-of-type .badge',
    content: (
      <div>
        <h3 className="text-xl font-bold mb-2">🏷️ Status Badges</h3>
        <p className="text-gray-700 mb-2">Colored badges alert you:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
          <li><strong className="text-red-600">🔴 OVERDUE</strong> - Late!</li>
          <li><strong className="text-yellow-600">🟡 DUE TOMORROW</strong> - Due soon</li>
          <li><strong className="text-green-600">🟢 COMPLETED</strong> - Done!</li>
        </ul>
      </div>
    ),
    placement: 'bottom',
  },

  {
    target: '.homework-card:first-of-type button, .homework-card:first-of-type a',
    content: (
      <div>
        <h3 className="text-xl font-bold mb-2">🎯 Action Buttons</h3>
        <p className="text-gray-700 mb-2"><strong>For regular homework:</strong></p>
        <p className="text-sm text-gray-600 mb-3">Click "View Details" to read description, download files, and mark as completed</p>

        <p className="text-gray-700 mb-2"><strong>For exams/quizzes:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
          <li><strong>⏳ Not Available</strong> - Teacher hasn't launched yet</li>
          <li><strong>✅ Start Exam</strong> - You can begin!</li>
          <li><strong>⏱️ Warning:</strong> Timer starts when you begin</li>
        </ul>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border-2 border-blue-300">
          <p className="text-blue-800 font-semibold text-sm">
            👉 <strong>Click "Next"</strong> to see a homework detail page and discover the help features!
          </p>
        </div>
      </div>
    ),
    placement: 'top',
  },

  // PART 3: AI ASSISTANT & DISCUSSION
  // Note: The following steps are for the homework detail page
  {
    target: 'body',
    content: (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl -m-8">
        <div className="text-center mb-8">
          <h3 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Getting Help</h3>
          <p className="text-gray-700 font-light text-xl">
            Two powerful tools available on this page
          </p>
        </div>

        <div className="space-y-5 mt-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
            <div className="mb-4">
              <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full mb-3">PUBLIC</span>
              <p className="font-bold text-blue-900 text-xl">Discussion Forum</p>
            </div>
            <div className="space-y-3 text-base text-gray-700 font-light">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <span>Ask questions to your classmates</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <span>Teachers can join and respond</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <span>All conversations are visible to everyone</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200">
            <div className="mb-4">
              <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full mb-3">PRIVATE</span>
              <p className="font-bold text-purple-900 text-xl">AI Assistant</p>
            </div>
            <div className="space-y-3 text-base text-gray-700 font-light">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                <span>Get personalized hints and guidance</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                <span>Completely private and confidential</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                <span>Available anytime you need help</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    placement: 'center',
  },

  {
    target: '.ai-help-button',
    content: (
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">AI Assistant Toggle</h3>
        <p className="text-gray-600 mb-5 font-light text-lg">
          Switch between public and private help modes
        </p>
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-lg border-l-4 border-purple-500">
            <p className="font-semibold text-purple-900 mb-2 text-lg">AI Help Mode</p>
            <p className="text-base text-gray-700 font-light">Private assistant for personalized guidance</p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-lg border-l-4 border-blue-500">
            <p className="font-semibold text-blue-900 mb-2 text-lg">Public Discussion Mode</p>
            <p className="text-base text-gray-700 font-light">Collaborate with classmates and teachers</p>
          </div>
        </div>
        <div className="mt-5 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <p className="text-base text-indigo-900 font-light">
            <span className="font-semibold">Note:</span> Your AI conversations are completely private
          </p>
        </div>
      </div>
    ),
    placement: 'bottom',
  },

  {
    target: '.summarize-button',
    content: (
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Discussion Summary</h3>
        <p className="text-gray-600 mb-5 font-light text-lg">
          Get an instant AI-powered summary of all public messages
        </p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
            <p className="text-sm font-semibold text-red-800 mb-1">Main Difficulties</p>
            <p className="text-sm text-gray-600 font-light">Common problems students face</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <p className="text-sm font-semibold text-blue-800 mb-1">Key Concepts</p>
            <p className="text-sm text-gray-600 font-light">Important topics discussed</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
            <p className="text-sm font-semibold text-green-800 mb-1">Helpful Answers</p>
            <p className="text-sm text-gray-600 font-light">Useful explanations provided</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
            <p className="text-sm font-semibold text-orange-800 mb-1">Open Questions</p>
            <p className="text-sm text-gray-600 font-light">Still awaiting answers</p>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <p className="text-base text-indigo-900 font-light">
            <span className="font-semibold">Tip:</span> Review the summary before reading the full discussion
          </p>
        </div>
      </div>
    ),
    placement: 'bottom',
  },

  // PART 4: MY COURSES
  {
    target: 'a[href="/eleve/courses"], a[href*="courses"]',
    content: (
      <div>
        <h3 className="text-xl font-bold mb-2">🎓 My Courses</h3>
        <p className="text-gray-700 mb-2">
          Click "My Courses" to see all your classes. Each course shows:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
          <li><strong>📘 Subject name</strong></li>
          <li><strong>👨‍🏫 Teacher</strong></li>
          <li><strong>📅 Weekly schedule</strong></li>
          <li><strong>📢 Recent announcements</strong></li>
        </ul>
      </div>
    ),
    placement: 'bottom',
  },

  // PART 5: CALENDAR
  {
    target: 'a[href="/eleve/calendar"], a[href*="calendar"]',
    content: (
      <div>
        <h3 className="text-xl font-bold mb-2">📅 Calendar</h3>
        <p className="text-gray-700 mb-2">
          Your calendar displays:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
          <li><strong>📚 All homework</strong> with deadlines</li>
          <li><strong>📖 Your weekly classes</strong></li>
          <li><strong>🎨 Color-coded</strong> by subject</li>
          <li><strong>📆 Views:</strong> Month / Week / Day</li>
        </ul>
        <p className="text-sm text-gray-600 mt-2">
          💡 Click any event for details!
        </p>
      </div>
    ),
    placement: 'bottom',
  },

  // PART 6: PROFILE
  {
    target: 'a[href="/eleve/profile"], .user-menu, button[aria-label*="profile"], button[aria-label*="Profile"]',
    content: (
      <div>
        <h3 className="text-xl font-bold mb-2">👤 Your Profile</h3>
        <p className="text-gray-700 mb-2">
          Your profile contains:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
          <li><strong>👤 Personal information</strong></li>
          <li><strong>🎓 Your class</strong></li>
          <li><strong>📧 Email</strong></li>
          <li><strong>📊 Progress statistics</strong></li>
        </ul>
      </div>
    ),
    placement: 'bottom',
  },

  // PART 7: HELP BUTTON
  {
    target: '.help-button, button[aria-label*="help"], button[aria-label*="Help"]',
    content: (
      <div>
        <h3 className="text-xl font-bold mb-2">❓ Need Help?</h3>
        <p className="text-gray-700 mb-2">
          Click the Help button anytime to:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
          <li><strong>🔄 Restart this tutorial</strong></li>
          <li><strong>📖 Access documentation</strong></li>
          <li><strong>💬 Contact support</strong></li>
        </ul>
      </div>
    ),
    placement: 'bottom',
  },

  // PART 8: CONCLUSION
  {
    target: 'body',
    content: (
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8 rounded-xl -m-8">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent tracking-tight">
            Tour Complete
          </h2>
          <p className="text-gray-700 text-xl font-light">
            You're all set to use HomeworkTracker
          </p>
        </div>

        <div className="bg-white p-7 rounded-xl shadow-sm mb-6 border border-green-200">
          <p className="font-semibold text-green-900 mb-5 text-center text-xl">What you've learned:</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-green-50 p-4 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span className="text-base font-medium text-gray-700">Homework management</span>
            </div>
            <div className="flex items-center gap-3 bg-purple-50 p-4 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-purple-600"></div>
              <span className="text-base font-medium text-gray-700">AI assistant</span>
            </div>
            <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span className="text-base font-medium text-gray-700">Course access</span>
            </div>
            <div className="flex items-center gap-3 bg-orange-50 p-4 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-orange-600"></div>
              <span className="text-base font-medium text-gray-700">Calendar view</span>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-200 mb-6">
          <p className="text-base text-indigo-900 text-center font-light">
            <span className="font-semibold">Need a refresher?</span><br/>
            Click the Help button anytime to restart this tour
          </p>
        </div>

        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-800 mb-2">
            Ready to get started
          </p>
          <p className="text-base text-gray-600 font-light">Good luck with your assignments</p>
        </div>
      </div>
    ),
    placement: 'center',
  }
];

// Custom styles for Joyride
export const joyrideStyles = {
  options: {
    arrowColor: '#ffffff',
    backgroundColor: '#ffffff',
    primaryColor: '#6366f1',
    textColor: '#1e293b',
    zIndex: 10000,
    debug: false,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  tooltip: {
    borderRadius: '1rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    padding: 0,
    maxWidth: '700px',
    minWidth: '500px',
  },
  tooltipContainer: {
    textAlign: 'left' as const,
  },
  tooltipTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '1rem',
    color: '#1e293b',
  },
  tooltipContent: {
    padding: '2rem',
    fontSize: '1.125rem',
    lineHeight: '1.8',
  },
  buttonNext: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    borderRadius: '0.75rem',
    padding: '1rem 2.5rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)',
    transition: 'all 0.2s',
  },
  buttonBack: {
    color: '#64748b',
    marginRight: '1rem',
    fontSize: '1.05rem',
    fontWeight: '500',
  },
  buttonSkip: {
    color: '#64748b',
    fontSize: '1.05rem',
    fontWeight: '500',
  },
  spotlight: {
    borderRadius: '0.75rem',
  },
};

export const joyrideLocale = {
  back: 'Back',
  close: 'Close',
  last: 'Finish',
  next: 'Next',
  skip: 'Skip',
};
