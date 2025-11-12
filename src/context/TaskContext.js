import React, { createContext, useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { useAuth } from '../hooks/useAuth';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setTasks([]);
      setLoading(false);
      return;
    }

    let unsubscribe;

    // Subscribe based on role
    if (user.role === 'chairman') {
      unsubscribe = taskService.subscribeToChairmanTasks(user.uid, (fetchedTasks) => {
        setTasks(fetchedTasks);
        setLoading(false);
      });
    } else if (user.role === 'faculty') {
      unsubscribe = taskService.subscribeToFacultyTasks(
        user.uid,
        (fetchedTasks) => {
          setTasks(fetchedTasks);
          setLoading(false);
        },
        (error) => {
          console.error('Error in TaskContext:', error);
          setLoading(false);
        }
      );
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid, user?.role]);

  const refreshTasks = async () => {
    // The real-time listener will automatically update
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <TaskContext.Provider value={{ tasks, loading, refreshTasks }}>
      {children}
    </TaskContext.Provider>
  );
};
