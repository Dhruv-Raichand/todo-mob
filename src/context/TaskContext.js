import React, { createContext, useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { useAuth } from '../hooks/useAuth';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { user, isTeacher } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    let unsubscribe;

    if (isTeacher) {
      unsubscribe = taskService.subscribeToTeacherTasks(user.uid, tasksList => {
        setTasks(tasksList);
        setLoading(false);
      });
    } else {
      unsubscribe = taskService.subscribeToStudentTasks(user.uid, tasksList => {
        setTasks(tasksList);
        setLoading(false);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, isTeacher]);

  const value = {
    tasks,
    loading,
    createTask: taskService.createTask,
    updateTask: taskService.updateTask,
    updateTaskStatus: taskService.updateTaskStatus,
    updateTaskProgress: taskService.updateTaskProgress,
    deleteTask: taskService.deleteTask,
    addComment: taskService.addComment,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
