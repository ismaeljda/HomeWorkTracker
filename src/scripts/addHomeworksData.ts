import { collection, doc, setDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Homework, Question } from '../firebase/firestore';

// Helper to create future dates
const addDays = (days: number): Timestamp => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return Timestamp.fromDate(date);
};

// QCM Questions by Subject
const mathQuestions: Question[] = [
  {
    id: 'math_q1',
    type: 'mcq',
    question: 'What is the value of π (pi) rounded to two decimal places?',
    options: ['3.12', '3.14', '3.16', '3.18'],
    correctAnswer: 1,
    points: 5
  },
  {
    id: 'math_q2',
    type: 'mcq',
    question: 'What is the solution to the equation 2x + 5 = 15?',
    options: ['x = 3', 'x = 5', 'x = 7', 'x = 10'],
    correctAnswer: 1,
    points: 10
  },
  {
    id: 'math_q3',
    type: 'true-false',
    question: 'A triangle with angles 60°, 60°, and 60° is called an equilateral triangle.',
    correctAnswer: true,
    points: 5
  },
  {
    id: 'math_q4',
    type: 'mcq',
    question: 'What is the area of a rectangle with length 8 cm and width 5 cm?',
    options: ['13 cm²', '26 cm²', '40 cm²', '80 cm²'],
    correctAnswer: 2,
    points: 10
  },
  {
    id: 'math_q5',
    type: 'mcq',
    question: 'Which of the following is a prime number?',
    options: ['15', '21', '23', '27'],
    correctAnswer: 2,
    points: 10
  },
  {
    id: 'math_q6',
    type: 'open-ended',
    question: 'Solve the following problem: A store sells apples at $3 per kilogram. If John buys 4.5 kg of apples and pays with a $20 bill, how much change does he receive? Show your work.',
    points: 20
  }
];

const englishQuestions: Question[] = [
  {
    id: 'eng_q1',
    type: 'mcq',
    question: 'Which word is a synonym for "happy"?',
    options: ['Sad', 'Joyful', 'Angry', 'Tired'],
    correctAnswer: 1,
    points: 5
  },
  {
    id: 'eng_q2',
    type: 'mcq',
    question: 'What is the past tense of the verb "to go"?',
    options: ['Goed', 'Went', 'Gone', 'Going'],
    correctAnswer: 1,
    points: 5
  },
  {
    id: 'eng_q3',
    type: 'true-false',
    question: 'The sentence "She don\'t like pizza" is grammatically correct.',
    correctAnswer: false,
    points: 5
  },
  {
    id: 'eng_q4',
    type: 'mcq',
    question: 'Which of the following is an adjective?',
    options: ['Run', 'Beautiful', 'Quickly', 'They'],
    correctAnswer: 1,
    points: 10
  },
  {
    id: 'eng_q5',
    type: 'mcq',
    question: 'What is the correct spelling?',
    options: ['Recieve', 'Receive', 'Receeve', 'Recive'],
    correctAnswer: 1,
    points: 5
  },
  {
    id: 'eng_q6',
    type: 'open-ended',
    question: 'Write a short paragraph (5-7 sentences) describing your favorite hobby and why you enjoy it.',
    points: 30
  }
];

const historyQuestions: Question[] = [
  {
    id: 'hist_q1',
    type: 'mcq',
    question: 'In which year did World War II end?',
    options: ['1943', '1944', '1945', '1946'],
    correctAnswer: 2,
    points: 5
  },
  {
    id: 'hist_q2',
    type: 'mcq',
    question: 'Who was the first President of the United States?',
    options: ['Thomas Jefferson', 'George Washington', 'Abraham Lincoln', 'John Adams'],
    correctAnswer: 1,
    points: 5
  },
  {
    id: 'hist_q3',
    type: 'true-false',
    question: 'The French Revolution began in 1789.',
    correctAnswer: true,
    points: 5
  },
  {
    id: 'hist_q4',
    type: 'mcq',
    question: 'Which ancient civilization built the pyramids?',
    options: ['Greeks', 'Romans', 'Egyptians', 'Mayans'],
    correctAnswer: 2,
    points: 10
  },
  {
    id: 'hist_q5',
    type: 'mcq',
    question: 'What was the name of the ship that brought the Pilgrims to America in 1620?',
    options: ['Santa Maria', 'Mayflower', 'Titanic', 'HMS Beagle'],
    correctAnswer: 1,
    points: 10
  },
  {
    id: 'hist_q6',
    type: 'open-ended',
    question: 'Explain the main causes of World War I. Include at least three factors in your answer.',
    points: 25
  }
];

const scienceQuestions: Question[] = [
  {
    id: 'sci_q1',
    type: 'mcq',
    question: 'What is the chemical symbol for water?',
    options: ['O2', 'H2O', 'CO2', 'NaCl'],
    correctAnswer: 1,
    points: 5
  },
  {
    id: 'sci_q2',
    type: 'mcq',
    question: 'Which planet is known as the "Red Planet"?',
    options: ['Venus', 'Jupiter', 'Mars', 'Saturn'],
    correctAnswer: 2,
    points: 5
  },
  {
    id: 'sci_q3',
    type: 'true-false',
    question: 'Plants use photosynthesis to convert sunlight into energy.',
    correctAnswer: true,
    points: 5
  },
  {
    id: 'sci_q4',
    type: 'mcq',
    question: 'What is the speed of light in a vacuum?',
    options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'],
    correctAnswer: 0,
    points: 10
  },
  {
    id: 'sci_q5',
    type: 'mcq',
    question: 'Which organ in the human body is responsible for pumping blood?',
    options: ['Liver', 'Brain', 'Heart', 'Lungs'],
    correctAnswer: 2,
    points: 10
  },
  {
    id: 'sci_q6',
    type: 'open-ended',
    question: 'Describe the water cycle and explain each of its main stages (evaporation, condensation, precipitation, collection).',
    points: 25
  }
];

const geographyQuestions: Question[] = [
  {
    id: 'geo_q1',
    type: 'mcq',
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 2,
    points: 5
  },
  {
    id: 'geo_q2',
    type: 'mcq',
    question: 'Which is the largest ocean on Earth?',
    options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
    correctAnswer: 3,
    points: 5
  },
  {
    id: 'geo_q3',
    type: 'true-false',
    question: 'Mount Everest is the tallest mountain in the world.',
    correctAnswer: true,
    points: 5
  },
  {
    id: 'geo_q4',
    type: 'mcq',
    question: 'Which continent is the Sahara Desert located on?',
    options: ['Asia', 'Africa', 'Australia', 'South America'],
    correctAnswer: 1,
    points: 10
  },
  {
    id: 'geo_q5',
    type: 'mcq',
    question: 'How many continents are there on Earth?',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2,
    points: 5
  },
  {
    id: 'geo_q6',
    type: 'open-ended',
    question: 'Explain the difference between weather and climate. Provide examples to support your answer.',
    points: 25
  }
];

export const addHomeworksData = async () => {
  console.log('🚀 Starting homework data initialization...');

  try {
    // Get all subjects
    const subjectsSnap = await getDocs(collection(db, 'subjects'));
    const subjects = subjectsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (subjects.length === 0) {
      console.error('❌ No subjects found. Please run initializeData first.');
      return { success: false, message: 'No subjects found' };
    }

    // Get all teachers
    const usersSnap = await getDocs(collection(db, 'users'));
    const teachers = usersSnap.docs
      .map(doc => ({ uid: doc.id, ...doc.data() }))
      .filter((user: any) => user.role === 'prof');

    let homeworkCount = 0;
    let examCount = 0;
    let quizCount = 0;

    // Create homeworks for each subject
    for (const subject of subjects) {
      const subjectData = subject as any;
      const teacher = teachers.find((t: any) => t.uid === subjectData.teacherId);
      
      if (!teacher) continue;

      // Initialize student completions
      const studentCompletions: { [key: string]: boolean } = {};
      subjectData.studentIds.forEach((studentId: string) => {
        studentCompletions[studentId] = false;
      });

      // Determine which questions to use based on subject
      let examQuestions: Question[] = [];
      let quizQuestions: Question[] = [];
      
      if (subjectData.name === 'Mathematics') {
        examQuestions = mathQuestions;
        quizQuestions = mathQuestions.slice(0, 3);
      } else if (subjectData.name === 'English') {
        examQuestions = englishQuestions;
        quizQuestions = englishQuestions.slice(0, 3);
      } else if (subjectData.name === 'History') {
        examQuestions = historyQuestions;
        quizQuestions = historyQuestions.slice(0, 3);
      } else if (subjectData.name === 'Science') {
        examQuestions = scienceQuestions;
        quizQuestions = scienceQuestions.slice(0, 3);
      } else if (subjectData.name === 'Geography') {
        examQuestions = geographyQuestions;
        quizQuestions = geographyQuestions.slice(0, 3);
      }

      // Create 3 regular homeworks
      for (let i = 1; i <= 3; i++) {
        const homeworkId = `hw_${subjectData.id}_${i}`;
        const homework: Omit<Homework, 'id'> = {
          title: `${subjectData.name} - Assignment ${i}`,
          type: 'homework',
          subjectId: subjectData.id,
          teacherId: subjectData.teacherId,
          description: `Complete exercises ${i * 10} to ${i * 10 + 9} from the textbook. Show all your work and explanations for full credit. This assignment will help reinforce the concepts we covered in class this week.`,
          deadline: addDays(i * 7),
          studentCompletions,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          locationType: 'online'
        };

        await setDoc(doc(db, 'homeworks', homeworkId), homework);
        homeworkCount++;
        console.log(`✅ Created homework: ${homework.title}`);
      }

      // Create 2 exams with questions
      for (let i = 1; i <= 2; i++) {
        const examId = `exam_${subjectData.id}_${i}`;
        const exam: Omit<Homework, 'id'> = {
          title: `${subjectData.name} - ${i === 1 ? 'Midterm' : 'Final'} Exam`,
          type: 'exam',
          subjectId: subjectData.id,
          teacherId: subjectData.teacherId,
          description: `This is the ${i === 1 ? 'midterm' : 'final'} exam for ${subjectData.name}. The exam covers all topics discussed in class. You will have ${i === 1 ? '60' : '90'} minutes to complete it. Make sure you have a stable internet connection before starting.`,
          deadline: addDays(i * 30),
          studentCompletions,
          questions: examQuestions,
          submissions: {},
          duration: i === 1 ? 60 : 90,
          isAvailable: i === 1,
          locationType: i === 1 ? 'online' : 'in-person',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        await setDoc(doc(db, 'homeworks', examId), exam);
        examCount++;
        console.log(`✅ Created exam: ${exam.title} (${exam.locationType})`);
      }

      // Create 2 quizzes with questions
      for (let i = 1; i <= 2; i++) {
        const quizId = `quiz_${subjectData.id}_${i}`;
        const quiz: Omit<Homework, 'id'> = {
          title: `${subjectData.name} - Quiz ${i}`,
          type: 'quiz',
          subjectId: subjectData.id,
          teacherId: subjectData.teacherId,
          description: `Quick assessment quiz on recent topics. This quiz is designed to test your understanding of the material covered in the last few weeks. It should take approximately 15 minutes.`,
          deadline: addDays(i * 14 + 3),
          studentCompletions,
          questions: quizQuestions,
          submissions: {},
          duration: 15,
          isAvailable: true,
          locationType: 'online',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        await setDoc(doc(db, 'homeworks', quizId), quiz);
        quizCount++;
        console.log(`✅ Created quiz: ${quiz.title}`);
      }
    }

    console.log('\n✨ Homework data initialization complete!\n');
    console.log('📋 Summary:');
    console.log(`   - Regular Homeworks: ${homeworkCount}`);
    console.log(`   - Exams: ${examCount}`);
    console.log(`   - Quizzes: ${quizCount}`);
    console.log(`   - Total: ${homeworkCount + examCount + quizCount}`);

    return {
      success: true,
      message: 'Homework data initialized successfully!',
      summary: {
        homeworks: homeworkCount,
        exams: examCount,
        quizzes: quizCount,
        total: homeworkCount + examCount + quizCount
      }
    };
  } catch (error: any) {
    console.error('❌ Initialization error:', error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
};
