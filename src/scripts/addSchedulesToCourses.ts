import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Schedule templates for each subject (Monday = 1, Sunday = 0)
// Time slots without overlaps: 8:00-9:30, 9:45-11:15, 11:30-13:00, 13:15-14:45, 15:00-16:30
const schedulesBySubject: { [key: string]: any[] } = {
  'Mathematics': [
    { dayOfWeek: 1, startTime: '08:00', endTime: '09:30', room: 'Room 101' },
    { dayOfWeek: 3, startTime: '09:45', endTime: '11:15', room: 'Room 101' },
    { dayOfWeek: 5, startTime: '08:00', endTime: '09:30', room: 'Room 101' }
  ],
  'English': [
    { dayOfWeek: 2, startTime: '09:45', endTime: '11:15', room: 'Room 102' },
    { dayOfWeek: 4, startTime: '11:30', endTime: '13:00', room: 'Room 102' }
  ],
  'History': [
    { dayOfWeek: 1, startTime: '13:15', endTime: '14:45', room: 'Room 103' },
    { dayOfWeek: 4, startTime: '09:45', endTime: '11:15', room: 'Room 103' }
  ],
  'Science': [
    { dayOfWeek: 2, startTime: '13:15', endTime: '14:45', room: 'Lab 201' },
    { dayOfWeek: 3, startTime: '13:15', endTime: '14:45', room: 'Lab 201' }
  ],
  'Geography': [
    { dayOfWeek: 1, startTime: '15:00', endTime: '16:30', room: 'Room 104' },
    { dayOfWeek: 5, startTime: '13:15', endTime: '14:45', room: 'Room 104' }
  ],
  'Physics': [
    { dayOfWeek: 2, startTime: '08:00', endTime: '09:30', room: 'Lab 203' },
    { dayOfWeek: 4, startTime: '13:15', endTime: '14:45', room: 'Lab 203' }
  ],
  'Chemistry': [
    { dayOfWeek: 1, startTime: '09:45', endTime: '11:15', room: 'Lab 204' },
    { dayOfWeek: 5, startTime: '09:45', endTime: '11:15', room: 'Lab 204' }
  ],
  'Biology': [
    { dayOfWeek: 3, startTime: '08:00', endTime: '09:30', room: 'Lab 205' },
    { dayOfWeek: 4, startTime: '15:00', endTime: '16:30', room: 'Lab 205' }
  ],
  'French': [
    { dayOfWeek: 2, startTime: '11:30', endTime: '13:00', room: 'Room 201' },
    { dayOfWeek: 5, startTime: '15:00', endTime: '16:30', room: 'Room 201' }
  ],
  'Spanish': [
    { dayOfWeek: 1, startTime: '11:30', endTime: '13:00', room: 'Room 202' },
    { dayOfWeek: 3, startTime: '15:00', endTime: '16:30', room: 'Room 202' }
  ],
  'German': [
    { dayOfWeek: 2, startTime: '15:00', endTime: '16:30', room: 'Room 203' },
    { dayOfWeek: 4, startTime: '08:00', endTime: '09:30', room: 'Room 203' }
  ],
  'Art': [
    { dayOfWeek: 3, startTime: '11:30', endTime: '13:00', room: 'Art Studio' },
    { dayOfWeek: 5, startTime: '11:30', endTime: '13:00', room: 'Art Studio' }
  ],
  'Music': [
    { dayOfWeek: 2, startTime: '15:00', endTime: '16:30', room: 'Music Room' }
  ],
  'Physical Education': [
    { dayOfWeek: 1, startTime: '09:45', endTime: '11:15', room: 'Gymnasium' },
    { dayOfWeek: 4, startTime: '15:00', endTime: '16:30', room: 'Gymnasium' }
  ],
  'Computer Science': [
    { dayOfWeek: 3, startTime: '15:00', endTime: '16:30', room: 'Computer Lab' },
    { dayOfWeek: 5, startTime: '15:00', endTime: '16:30', room: 'Computer Lab' }
  ],
  'Philosophy': [
    { dayOfWeek: 1, startTime: '11:30', endTime: '13:00', room: 'Room 301' }
  ],
  'Economics': [
    { dayOfWeek: 2, startTime: '08:00', endTime: '09:30', room: 'Room 302' },
    { dayOfWeek: 3, startTime: '11:30', endTime: '13:00', room: 'Room 302' }
  ],
  'Literature': [
    { dayOfWeek: 4, startTime: '11:30', endTime: '13:00', room: 'Room 303' }
  ]
};

// Alternative schedules for 6B classes (different times to avoid conflicts)
const schedulesBySubject6B: { [key: string]: any[] } = {
  'Mathematics': [
    { dayOfWeek: 2, startTime: '08:00', endTime: '09:30', room: 'Room 105' },
    { dayOfWeek: 4, startTime: '08:00', endTime: '09:30', room: 'Room 105' },
    { dayOfWeek: 5, startTime: '09:45', endTime: '11:15', room: 'Room 105' }
  ],
  'English': [
    { dayOfWeek: 1, startTime: '08:00', endTime: '09:30', room: 'Room 106' },
    { dayOfWeek: 3, startTime: '08:00', endTime: '09:30', room: 'Room 106' }
  ],
  'History': [
    { dayOfWeek: 2, startTime: '13:15', endTime: '14:45', room: 'Room 107' },
    { dayOfWeek: 5, startTime: '11:30', endTime: '13:00', room: 'Room 107' }
  ],
  'Science': [
    { dayOfWeek: 1, startTime: '13:15', endTime: '14:45', room: 'Lab 202' },
    { dayOfWeek: 4, startTime: '09:45', endTime: '11:15', room: 'Lab 202' }
  ],
  'Geography': [
    { dayOfWeek: 2, startTime: '09:45', endTime: '11:15', room: 'Room 108' },
    { dayOfWeek: 4, startTime: '15:00', endTime: '16:30', room: 'Room 108' }
  ],
  'Physics': [
    { dayOfWeek: 1, startTime: '15:00', endTime: '16:30', room: 'Lab 206' },
    { dayOfWeek: 3, startTime: '13:15', endTime: '14:45', room: 'Lab 206' }
  ],
  'Chemistry': [
    { dayOfWeek: 2, startTime: '11:30', endTime: '13:00', room: 'Lab 207' },
    { dayOfWeek: 5, startTime: '08:00', endTime: '09:30', room: 'Lab 207' }
  ],
  'Biology': [
    { dayOfWeek: 1, startTime: '09:45', endTime: '11:15', room: 'Lab 208' },
    { dayOfWeek: 3, startTime: '09:45', endTime: '11:15', room: 'Lab 208' }
  ],
  'French': [
    { dayOfWeek: 1, startTime: '11:30', endTime: '13:00', room: 'Room 204' },
    { dayOfWeek: 4, startTime: '13:15', endTime: '14:45', room: 'Room 204' }
  ],
  'Spanish': [
    { dayOfWeek: 2, startTime: '15:00', endTime: '16:30', room: 'Room 205' },
    { dayOfWeek: 5, startTime: '15:00', endTime: '16:30', room: 'Room 205' }
  ],
  'German': [
    { dayOfWeek: 3, startTime: '11:30', endTime: '13:00', room: 'Room 206' },
    { dayOfWeek: 5, startTime: '13:15', endTime: '14:45', room: 'Room 206' }
  ],
  'Art': [
    { dayOfWeek: 2, startTime: '09:45', endTime: '11:15', room: 'Art Studio B' }
  ],
  'Music': [
    { dayOfWeek: 4, startTime: '11:30', endTime: '13:00', room: 'Music Room B' }
  ],
  'Physical Education': [
    { dayOfWeek: 3, startTime: '15:00', endTime: '16:30', room: 'Sports Field' },
    { dayOfWeek: 5, startTime: '15:00', endTime: '16:30', room: 'Sports Field' }
  ],
  'Computer Science': [
    { dayOfWeek: 1, startTime: '15:00', endTime: '16:30', room: 'Computer Lab 2' },
    { dayOfWeek: 4, startTime: '15:00', endTime: '16:30', room: 'Computer Lab 2' }
  ],
  'Philosophy': [
    { dayOfWeek: 2, startTime: '11:30', endTime: '13:00', room: 'Room 304' }
  ],
  'Economics': [
    { dayOfWeek: 1, startTime: '09:45', endTime: '11:15', room: 'Room 305' },
    { dayOfWeek: 3, startTime: '15:00', endTime: '16:30', room: 'Room 305' }
  ],
  'Literature': [
    { dayOfWeek: 3, startTime: '09:45', endTime: '11:15', room: 'Room 306' }
  ]
};

export const addSchedulesToCourses = async () => {
  console.log('🕐 Starting to add schedules to existing courses...');

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

      // Determine if it's a 6B class
      const is6B = subject.classId === 'class_6b' || subjectId.includes('_6b');
      
      // Get the appropriate schedule template
      const scheduleTemplates = is6B ? schedulesBySubject6B : schedulesBySubject;
      const scheduleTemplate = scheduleTemplates[subject.name];

      if (!scheduleTemplate) {
        console.log(`⚠️  No schedule template found for ${subject.name}, using default...`);
        // Use a default schedule
        const defaultSchedule = [
          { dayOfWeek: 1, startTime: '10:00', endTime: '11:30', room: 'TBD' },
          { dayOfWeek: 3, startTime: '10:00', endTime: '11:30', room: 'TBD' }
        ];
        
        const schedule = defaultSchedule.map(slot => ({
          ...slot,
          subjectId: subjectId,
          id: `${subjectId}_${slot.dayOfWeek}_${slot.startTime}`,
          isCancelled: false
        }));

        await updateDoc(doc(db, 'subjects', subjectId), {
          schedule: schedule
        });

        updatedCount++;
        console.log(`✅ Added default schedule to ${subject.name} (${subject.classId || 'unknown class'})`);
        continue;
      }

      // Create the schedule with proper IDs
      const schedule = scheduleTemplate.map(slot => ({
        ...slot,
        subjectId: subjectId,
        id: `${subjectId}_${slot.dayOfWeek}_${slot.startTime}`,
        isCancelled: false
      }));

      // Update the subject with the schedule
      await updateDoc(doc(db, 'subjects', subjectId), {
        schedule: schedule
      });

      updatedCount++;
      console.log(`✅ Added schedule to ${subject.name} (${subject.classId || 'unknown class'}) - ${schedule.length} classes/week`);
    }

    console.log('\n✨ Schedule addition complete!\n');
    console.log('📋 Summary:');
    console.log(`   - Subjects updated: ${updatedCount}`);
    console.log(`   - Subjects skipped (already had schedule): ${skippedCount}`);
    console.log(`   - Total subjects: ${subjectsSnapshot.size}`);

    return {
      success: true,
      message: 'Schedules added successfully!',
      summary: {
        updated: updatedCount,
        skipped: skippedCount,
        total: subjectsSnapshot.size
      }
    };

  } catch (error) {
    console.error('❌ Error adding schedules:', error);
    return {
      success: false,
      message: `Error: ${error}`,
    };
  }
};
