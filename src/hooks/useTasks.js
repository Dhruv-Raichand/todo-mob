import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { taskService } from '../services/taskService';

export const useTasks = () => {
  const { user, userData } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !userData) {
      setLoading(false);
      return;
    }

    let unsubscribe;

    if (userData.role === 'teacher') {
      unsubscribe = taskService.subscribeToTeacherTasks(user.uid, loadedTasks => {
        console.log('useTasks - Teacher tasks updated:', loadedTasks.length);
        setTasks(loadedTasks);
        setLoading(false);
      });
    } else {
      unsubscribe = taskService.subscribeToStudentTasks(user.uid, loadedTasks => {
        console.log('useTasks - Student tasks updated:', loadedTasks.length);
        setTasks(loadedTasks);
        setLoading(false);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, userData]);

  const createTask = async taskData => {
    try {
      const taskId = await taskService.createTask(taskData);
      return taskId;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  return {
    tasks,
    loading,
    createTask,
  };
};
