import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Additional schedule items to complement existing schedules
const additionalSchedulesBySubject: { [key: string]: any[] } = {
  'Mathematics': [
    { dayOfWeek: 3, startTime: '10:00', endTime: '11:00', room: 'Room 101', type: 'Tutorial' }
  ],
  'English': [
    { dayOfWeek: 3, startTime: '13:00', endTime: '14:00', room: 'Room 102', type: 'Writing Workshop' }
  ],
  'History': [
    { dayOfWeek: 5, startTime: '10:00', endTime: '11:00', room: 'Room 103', type: 'Discussion' }
  ],
  'Science': [
    { dayOfWeek: 3, startTime: '15:00', endTime: '16:00', room: 'Lab 201', type: 'Lab Session' }
  ],
  'Geography': [
    { dayOfWeek: 1, startTime: '13:00', endTime: '14:00', room: 'Room 104', type: 'Map Reading' }
  ],
  'Physics': [
    { dayOfWeek: 4, startTime: '15:00', endTime: '16:30', room: 'Lab 203', type: 'Practical Lab' }
  ],
  'Chemistry': [
    { dayOfWeek: 3, startTime: '13:00', endTime: '14:30', room: 'Lab 204', type: 'Lab Experiment' }
  ],
  'Biology': [
    { dayOfWeek: 2, startTime: '13:00', endTime: '14:30', room: 'Lab 205', type: 'Dissection Lab' }
  ],
  'Computer Science': [
    { dayOfWeek: 5, startTime: '13:00', endTime: '14:30', room: 'Computer Lab', type: 'Coding Practice' }
  ]
};

export const addScheduleItems = async () => {
  console.log('📅 Starting to add additional schedule items...');

  try {
    // Get all subjects from Firestore
    const subjectsSnapshot = await getDocs(collection(db, 'subjects'));

    if (subjectsSnapshot.empty) {
      console.log('❌ No subjects found in database!');
      return {
        success: false,
        message: 'No subjects found in database',
      };
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const subjectDoc of subjectsSnapshot.docs) {
      const subject = subjectDoc.data();
      const subjectId = subjectDoc.id;

      // Get additional schedule for this subject
      const additionalSchedule = additionalSchedulesBySubject[subject.name];

      if (!additionalSchedule) {
        console.log(`⏭️  Skipping ${subject.name} - no additional schedule defined`);
        skippedCount++;
        continue;
      }

      // Get existing schedule
      const existingSchedule = subject.schedule || [];

      // Create new schedule items with proper IDs
      const newScheduleItems = additionalSchedule.map(slot => ({
        ...slot,
        subjectId: subjectId,
        id: `${subjectId}_${slot.dayOfWeek}_${slot.startTime}_${slot.type || 'class'}`,
        isCancelled: false
      }));

      // Combine existing and new schedules
      const combinedSchedule = [...existingSchedule, ...newScheduleItems];

      // Update the subject with the combined schedule
      await updateDoc(doc(db, 'subjects', subjectId), {
        schedule: combinedSchedule
      });

      updatedCount++;
      console.log(`✅ Added ${newScheduleItems.length} schedule item(s) to ${subject.name}`);
      newScheduleItems.forEach(item => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        console.log(`   - ${days[item.dayOfWeek]} ${item.startTime}-${item.endTime}: ${item.type || 'Class'} in ${item.room}`);
      });
    }

    console.log('\n✨ Schedule addition complete!\n');
    console.log('📋 Summary:');
    console.log(`   - Subjects updated: ${updatedCount}`);
    console.log(`   - Subjects skipped: ${skippedCount}`);

    return {
      success: true,
      message: 'Additional schedule items added successfully!',
      summary: {
        updated: updatedCount,
        skipped: skippedCount
      }
    };

  } catch (error) {
    console.error('❌ Error adding schedule items:', error);
    return {
      success: false,
      message: `Error: ${error}`,
    };
  }
};
