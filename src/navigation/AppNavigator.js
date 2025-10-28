import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import StudentNavigator from './StudentNavigator';
import TeacherNavigator from './TeacherNavigator';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../components/common/Button';
import { COLORS } from '../constants/colors';

const AppNavigator = () => {
  const { user, userData, loading, isTeacher, isStudent, logout } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  // Not authenticated - show auth screens
  if (!user) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  // Teacher account waiting for verification
  if (userData?.role === 'teacher' && !userData?.verified) {
    return (
      <View style={styles.waitingContainer}>
        <Text style={styles.waitingTitle}>Account Pending Approval</Text>
        <Text style={styles.waitingText}>
          Your teacher account is waiting for admin verification.
        </Text>
        <Text style={styles.waitingText}>
          You will be notified once your account is approved.
        </Text>
        <Button
          title="Logout"
          onPress={logout}
          variant="outline"
          style={styles.logoutButton}
        />
      </View>
    );
  }

  // Authenticated - show appropriate navigator
  return (
    <NavigationContainer>
      {isTeacher ? <TeacherNavigator /> : <StudentNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  waitingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  waitingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  logoutButton: {
    marginTop: 24,
    minWidth: 200,
  },
});

export default AppNavigator;
