import { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';

export const useTaskDetail = taskId => {
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) return;

    // Get task details
    const fetchTask = async () => {
      try {
        const taskData = await taskService.getTask(taskId);
        setTask(taskData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching task:', error);
        setLoading(false);
      }
    };

    fetchTask();

    // Subscribe to comments
    const unsubscribe = taskService.subscribeToComments(taskId, commentsData => {
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [taskId]);

  return { task, comments, loading };
};
