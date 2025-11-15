import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebase/config';

// Sample data structure
const sampleData = {
  // Classes
  classes: [
    { id: 'class_6a', name: '6A' },
    { id: 'class_6b', name: '6B' },
    { id: 'class_terminale_s', name: 'Terminale S' },
  ],

  // Teachers with their subjects
  teachers: [
    { email: 'john.smith@school.com', password: 'password123', name: 'Mr. Smith (Math)', role: 'prof' as const, subject: 'Mathematics' },
    { email: 'emily.johnson@school.com', password: 'password123', name: 'Ms. Johnson (English)', role: 'prof' as const, subject: 'English' },
    { email: 'michael.brown@school.com', password: 'password123', name: 'Mr. Brown (History)', role: 'prof' as const, subject: 'History' },
    { email: 'sarah.davis@school.com', password: 'password123', name: 'Ms. Davis (Science)', role: 'prof' as const, subject: 'Science' },
    { email: 'david.wilson@school.com', password: 'password123', name: 'Mr. Wilson (Geography)', role: 'prof' as const, subject: 'Geography' },
  ],

  // Students for 6A
  students_6a: [
    { email: 'alex.thompson@school.com', password: 'password123', name: 'Alex Thompson', classId: 'class_6a', role: 'eleve' as const },
    { email: 'emma.garcia@school.com', password: 'password123', name: 'Emma Garcia', classId: 'class_6a', role: 'eleve' as const },
    { email: 'noah.martinez@school.com', password: 'password123', name: 'Noah Martinez', classId: 'class_6a', role: 'eleve' as const },
    { email: 'olivia.rodriguez@school.com', password: 'password123', name: 'Olivia Rodriguez', classId: 'class_6a', role: 'eleve' as const },
    { email: 'liam.anderson@school.com', password: 'password123', name: 'Liam Anderson', classId: 'class_6a', role: 'eleve' as const },
    { email: 'sophia.taylor@school.com', password: 'password123', name: 'Sophia Taylor', classId: 'class_6a', role: 'eleve' as const },
    { email: 'james.thomas@school.com', password: 'password123', name: 'James Thomas', classId: 'class_6a', role: 'eleve' as const },
    { email: 'ava.jackson@school.com', password: 'password123', name: 'Ava Jackson', classId: 'class_6a', role: 'eleve' as const },
    { email: 'william.white@school.com', password: 'password123', name: 'William White', classId: 'class_6a', role: 'eleve' as const },
    { email: 'mia.harris@school.com', password: 'password123', name: 'Mia Harris', classId: 'class_6a', role: 'eleve' as const },
    { email: 'benjamin.clark@school.com', password: 'password123', name: 'Benjamin Clark', classId: 'class_6a', role: 'eleve' as const },
    { email: 'charlotte.lewis@school.com', password: 'password123', name: 'Charlotte Lewis', classId: 'class_6a', role: 'eleve' as const },
    { email: 'lucas.walker@school.com', password: 'password123', name: 'Lucas Walker', classId: 'class_6a', role: 'eleve' as const },
    { email: 'amelia.hall@school.com', password: 'password123', name: 'Amelia Hall', classId: 'class_6a', role: 'eleve' as const },
    { email: 'henry.allen@school.com', password: 'password123', name: 'Henry Allen', classId: 'class_6a', role: 'eleve' as const },
  ],

  // Students for 6B
  students_6b: [
    { email: 'ethan.young@school.com', password: 'password123', name: 'Ethan Young', classId: 'class_6b', role: 'eleve' as const },
    { email: 'isabella.king@school.com', password: 'password123', name: 'Isabella King', classId: 'class_6b', role: 'eleve' as const },
    { email: 'mason.wright@school.com', password: 'password123', name: 'Mason Wright', classId: 'class_6b', role: 'eleve' as const },
    { email: 'harper.lopez@school.com', password: 'password123', name: 'Harper Lopez', classId: 'class_6b', role: 'eleve' as const },
    { email: 'alexander.hill@school.com', password: 'password123', name: 'Alexander Hill', classId: 'class_6b', role: 'eleve' as const },
    { email: 'evelyn.scott@school.com', password: 'password123', name: 'Evelyn Scott', classId: 'class_6b', role: 'eleve' as const },
    { email: 'sebastian.green@school.com', password: 'password123', name: 'Sebastian Green', classId: 'class_6b', role: 'eleve' as const },
    { email: 'abigail.adams@school.com', password: 'password123', name: 'Abigail Adams', classId: 'class_6b', role: 'eleve' as const },
    { email: 'jack.baker@school.com', password: 'password123', name: 'Jack Baker', classId: 'class_6b', role: 'eleve' as const },
    { email: 'ella.nelson@school.com', password: 'password123', name: 'Ella Nelson', classId: 'class_6b', role: 'eleve' as const },
    { email: 'daniel.carter@school.com', password: 'password123', name: 'Daniel Carter', classId: 'class_6b', role: 'eleve' as const },
    { email: 'emily.mitchell@school.com', password: 'password123', name: 'Emily Mitchell', classId: 'class_6b', role: 'eleve' as const },
    { email: 'matthew.perez@school.com', password: 'password123', name: 'Matthew Perez', classId: 'class_6b', role: 'eleve' as const },
    { email: 'scarlett.roberts@school.com', password: 'password123', name: 'Scarlett Roberts', classId: 'class_6b', role: 'eleve' as const },
    { email: 'jackson.turner@school.com', password: 'password123', name: 'Jackson Turner', classId: 'class_6b', role: 'eleve' as const },
  ],

  // Admin
  admin: {
    email: 'admin@homeworktracker.com',
    password: 'admin123',
    name: 'Administrator',
    role: 'admin' as const,
  },
};

// Subject names
const subjectNames = [
  'Mathematics',
  'English',
  'History',
  'Science',
  'Geography',
];

export const initializeDatabase = async () => {
  console.log('🚀 Starting database initialization...');

  try {
    const createdUsers: any = {
      teachers: [],
      students_6a: [],
      students_6b: [],
      admin: null,
    };

    // 1. Check if Admin exists, if not create
    console.log('📌 Checking admin account...');
    const usersSnap = await getDocs(collection(db, 'users'));
    const adminExists = usersSnap.docs.some(doc => doc.data().email === sampleData.admin.email);

    if (adminExists) {
      console.log('✅ Admin already exists, skipping...');
      const adminDoc = usersSnap.docs.find(doc => doc.data().email === sampleData.admin.email);
      createdUsers.admin = adminDoc?.id;
    } else {
      try {
        const adminCred = await createUserWithEmailAndPassword(
          auth,
          sampleData.admin.email,
          sampleData.admin.password
        );
        await setDoc(doc(db, 'users', adminCred.user.uid), {
          uid: adminCred.user.uid,
          name: sampleData.admin.name,
          email: sampleData.admin.email,
          role: sampleData.admin.role,
          classId: '',
          subjectIds: [],
        });
        createdUsers.admin = adminCred.user.uid;
        console.log('✅ Admin created:', sampleData.admin.email);
      } catch (error: any) {
        console.error('❌ Error creating admin:', error.message);
      }
    }

    // 2. Create Classes
    console.log('\n📚 Creating classes...');
    for (const cls of sampleData.classes) {
      await setDoc(doc(db, 'classes', cls.id), cls);
      console.log(`✅ Class created: ${cls.name}`);
    }

    // 3. Create Teachers
    console.log('\n👨‍🏫 Creating teachers...');
    for (const teacher of sampleData.teachers) {
      try {
        const teacherCred = await createUserWithEmailAndPassword(
          auth,
          teacher.email,
          teacher.password
        );
        await setDoc(doc(db, 'users', teacherCred.user.uid), {
          uid: teacherCred.user.uid,
          name: teacher.name,
          email: teacher.email,
          role: teacher.role,
          classId: '',
          subjectIds: [],
        });
        createdUsers.teachers.push({
          uid: teacherCred.user.uid,
          name: teacher.name,
          email: teacher.email,
          subject: teacher.subject,
        });
        console.log(`✅ Teacher created: ${teacher.name} (${teacher.email})`);
      } catch (error: any) {
        console.error(`❌ Error creating teacher ${teacher.email}:`, error.message);
      }
    }

    // 4. Create Students for 6A
    console.log('\n🎓 Creating students for 6A...');
    for (const student of sampleData.students_6a) {
      try {
        const studentCred = await createUserWithEmailAndPassword(
          auth,
          student.email,
          student.password
        );
        await setDoc(doc(db, 'users', studentCred.user.uid), {
          uid: studentCred.user.uid,
          name: student.name,
          email: student.email,
          role: student.role,
          classId: student.classId,
          subjectIds: [], // Will be updated when subjects are created
        });
        createdUsers.students_6a.push({
          uid: studentCred.user.uid,
          name: student.name,
          email: student.email,
        });
        console.log(`✅ Student created: ${student.name} (${student.email})`);
      } catch (error: any) {
        console.error(`❌ Error creating student ${student.email}:`, error.message);
      }
    }

    // 5. Create Students for 6B
    console.log('\n🎓 Creating students for 6B...');
    for (const student of sampleData.students_6b) {
      try {
        const studentCred = await createUserWithEmailAndPassword(
          auth,
          student.email,
          student.password
        );
        await setDoc(doc(db, 'users', studentCred.user.uid), {
          uid: studentCred.user.uid,
          name: student.name,
          email: student.email,
          role: student.role,
          classId: student.classId,
          subjectIds: [],
        });
        createdUsers.students_6b.push({
          uid: studentCred.user.uid,
          name: student.name,
          email: student.email,
        });
        console.log(`✅ Student created: ${student.name} (${student.email})`);
      } catch (error: any) {
        console.error(`❌ Error creating student ${student.email}:`, error.message);
      }
    }

    // 6. Create Subjects for 6A with schedules
    console.log('\n📖 Creating subjects with schedules for 6A...');
    const student6aIds = createdUsers.students_6a.map((s: any) => s.uid);
    const subjectIds6a: string[] = [];

    // Define schedule templates (different time slots for each subject)
    const scheduleTemplates = [
      // Mathematics - Monday & Thursday 08:00-09:30
      [
        { dayOfWeek: 1, startTime: '08:00', endTime: '09:30', room: 'Room 101' },
        { dayOfWeek: 4, startTime: '08:00', endTime: '09:30', room: 'Room 101' }
      ],
      // English - Tuesday & Friday 10:00-11:30
      [
        { dayOfWeek: 2, startTime: '10:00', endTime: '11:30', room: 'Room 102' },
        { dayOfWeek: 5, startTime: '10:00', endTime: '11:30', room: 'Room 102' }
      ],
      // History - Monday & Wednesday 14:00-15:30
      [
        { dayOfWeek: 1, startTime: '14:00', endTime: '15:30', room: 'Room 103' },
        { dayOfWeek: 3, startTime: '14:00', endTime: '15:30', room: 'Room 103' }
      ],
      // Science - Tuesday & Thursday 13:00-14:30
      [
        { dayOfWeek: 2, startTime: '13:00', endTime: '14:30', room: 'Lab 201' },
        { dayOfWeek: 4, startTime: '13:00', endTime: '14:30', room: 'Lab 201' }
      ],
      // Geography - Wednesday & Friday 15:45-17:15
      [
        { dayOfWeek: 3, startTime: '15:45', endTime: '17:15', room: 'Room 104' },
        { dayOfWeek: 5, startTime: '15:45', endTime: '17:15', room: 'Room 104' }
      ],
    ];

    for (let i = 0; i < subjectNames.length; i++) {
      const subjectId = `subject_${subjectNames[i].toLowerCase().replace(/[^a-z]/g, '')}_6a`;

      // Find the teacher assigned to this specific subject
      const assignedTeacher = createdUsers.teachers.find((t: any) => t.subject === subjectNames[i]);
      const teacherId = assignedTeacher?.uid;

      if (teacherId) {
        const schedule = scheduleTemplates[i].map(slot => ({
          ...slot,
          subjectId: subjectId,
          id: `${subjectId}_${slot.dayOfWeek}_${slot.startTime}`,
          isCancelled: false
        }));

        await setDoc(doc(db, 'subjects', subjectId), {
          id: subjectId,
          name: subjectNames[i],
          classId: 'class_6a',
          teacherId: teacherId,
          studentIds: student6aIds,
          schedule: schedule,
        });
        subjectIds6a.push(subjectId);
        console.log(`✅ Subject created: ${subjectNames[i]} (6A) - Teacher: ${assignedTeacher.name} - ${schedule.length} classes/week`);
      }
    }

    // Update students with their subject IDs
    for (const student of createdUsers.students_6a) {
      await setDoc(
        doc(db, 'users', student.uid),
        { subjectIds: subjectIds6a },
        { merge: true }
      );
    }

    // 7. Create Subjects for 6B with schedules
    console.log('\n📖 Creating subjects with schedules for 6B...');
    const student6bIds = createdUsers.students_6b.map((s: any) => s.uid);
    const subjectIds6b: string[] = [];

    // Same schedule templates but different rooms
    const scheduleTemplates6b = [
      // Mathematics - Monday & Thursday 09:45-11:15
      [
        { dayOfWeek: 1, startTime: '09:45', endTime: '11:15', room: 'Room 105' },
        { dayOfWeek: 4, startTime: '09:45', endTime: '11:15', room: 'Room 105' }
      ],
      // English - Tuesday & Friday 08:00-09:30
      [
        { dayOfWeek: 2, startTime: '08:00', endTime: '09:30', room: 'Room 106' },
        { dayOfWeek: 5, startTime: '08:00', endTime: '09:30', room: 'Room 106' }
      ],
      // History - Wednesday & Friday 13:00-14:30
      [
        { dayOfWeek: 3, startTime: '13:00', endTime: '14:30', room: 'Room 107' },
        { dayOfWeek: 5, startTime: '13:00', endTime: '14:30', room: 'Room 107' }
      ],
      // Science - Monday & Thursday 13:00-14:30
      [
        { dayOfWeek: 1, startTime: '13:00', endTime: '14:30', room: 'Lab 202' },
        { dayOfWeek: 4, startTime: '13:00', endTime: '14:30', room: 'Lab 202' }
      ],
      // Geography - Tuesday & Wednesday 10:00-11:30
      [
        { dayOfWeek: 2, startTime: '10:00', endTime: '11:30', room: 'Room 108' },
        { dayOfWeek: 3, startTime: '10:00', endTime: '11:30', room: 'Room 108' }
      ],
    ];

    for (let i = 0; i < subjectNames.length; i++) {
      const subjectId = `subject_${subjectNames[i].toLowerCase().replace(/[^a-z]/g, '')}_6b`;

      // Find the teacher assigned to this specific subject
      const assignedTeacher = createdUsers.teachers.find((t: any) => t.subject === subjectNames[i]);
      const teacherId = assignedTeacher?.uid;

      if (teacherId) {
        const schedule = scheduleTemplates6b[i].map(slot => ({
          ...slot,
          subjectId: subjectId,
          id: `${subjectId}_${slot.dayOfWeek}_${slot.startTime}`,
          isCancelled: false
        }));

        await setDoc(doc(db, 'subjects', subjectId), {
          id: subjectId,
          name: subjectNames[i],
          classId: 'class_6b',
          teacherId: teacherId,
          studentIds: student6bIds,
          schedule: schedule,
        });
        subjectIds6b.push(subjectId);
        console.log(`✅ Subject created: ${subjectNames[i]} (6B) - Teacher: ${assignedTeacher.name} - ${schedule.length} classes/week`);
      }
    }

    // Update students with their subject IDs
    for (const student of createdUsers.students_6b) {
      await setDoc(
        doc(db, 'users', student.uid),
        { subjectIds: subjectIds6b },
        { merge: true }
      );
    }

    console.log('\n✨ Database initialization complete!\n');
    console.log('📋 Summary:');
    console.log(`   - Admin: 1`);
    console.log(`   - Classes: ${sampleData.classes.length}`);
    console.log(`   - Teachers: ${createdUsers.teachers.length}`);
    console.log(`   - Students (6A): ${createdUsers.students_6a.length}`);
    console.log(`   - Students (6B): ${createdUsers.students_6b.length}`);
    console.log(`   - Subjects: ${subjectNames.length * 2}`);
    console.log('\n🔑 Login Credentials:');
    console.log(`   Admin: ${sampleData.admin.email} / ${sampleData.admin.password}`);
    console.log(`   Teachers: [name]@school.fr / password123`);
    console.log(`   Students: [name]@school.fr / password123`);

    return {
      success: true,
      message: 'Database initialized successfully!',
      summary: {
        admin: 1,
        classes: sampleData.classes.length,
        teachers: createdUsers.teachers.length,
        students: createdUsers.students_6a.length + createdUsers.students_6b.length,
        subjects: subjectNames.length * 2,
      },
    };
  } catch (error: any) {
    console.error('❌ Initialization error:', error);
    return {
      success: false,
      message: `Error: ${error.message}`,
    };
  }
};
