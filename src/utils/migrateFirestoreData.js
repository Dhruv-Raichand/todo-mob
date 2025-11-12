import firestore from '@react-native-firebase/firestore';

export const migrateAllData = async () => {
  console.log('🚀 Starting migration...');
  
  try {
    // 1. Migrate Users
    const usersSnapshot = await firestore().collection('users').get();
    
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      const updates = {};
      
      if (data.role === 'teacher') {
        updates.role = 'chairman';
        updates.verified = true;
      } else if (data.role === 'student') {
        updates.role = 'faculty';
      }
      
      if (Object.keys(updates).length > 0) {
        await doc.ref.update(updates);
        console.log(`✅ Updated user: ${data.email}`);
      }
    }
    
    // 2. Migrate Tasks
    const tasksSnapshot = await firestore().collection('tasks').get();
    
    for (const doc of tasksSnapshot.docs) {
      const data = doc.data();
      const updates = {};
      
      // Rename fields
      if (data.teacherId) {
        updates.chairmanId = data.teacherId;
      }
      
      if (data.assignedStudents) {
        updates.assignedFaculty = data.assignedStudents;
      }
      
      if (data.studentProgress) {
        updates.facultyProgress = data.studentProgress;
      }
      
      if (Object.keys(updates).length > 0) {
        await doc.ref.update(updates);
        
        // Delete old fields
        await doc.ref.update({
          teacherId: firestore.FieldValue.delete(),
          assignedStudents: firestore.FieldValue.delete(),
          studentProgress: firestore.FieldValue.delete(),
        });
        
        console.log(`✅ Updated task: ${data.title}`);
      }
    }
    
    console.log('✅ Migration complete!');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    return { success: false, error: error.message };
  }
};
