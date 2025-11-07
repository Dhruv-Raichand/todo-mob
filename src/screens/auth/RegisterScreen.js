import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../constants/colors';
import { ROLES } from '../../constants/roles';
import {
  validateEmail,
  validatePassword,
  validateRequired,
  getErrorMessage,
} from '../../utils/validationUtils';
import { getRoleDisplay } from '../../utils/roleUtils';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ROLES.STUDENT,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!validateRequired(formData.name)) {
      newErrors.name = 'Name is required';
    }

    if (!validateRequired(formData.email)) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!validateRequired(formData.password)) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!validateRequired(formData.confirmPassword)) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await register(
        formData.email.trim(),
        formData.password,
        formData.name.trim(),
        formData.role
      );
      Alert.alert(
        'Success',
        formData.role === ROLES.TEACHER
          ? 'Account created! Waiting for admin approval.'
          : 'Account created successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Registration Failed', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join TaskMaster today!</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={formData.name}
            onChangeText={text => handleChange('name', text)}
            error={errors.name}
            icon="account-outline"
          />

          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={text => handleChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
            icon="email-outline"
          />

          <Input
            label="Password"
            placeholder="Create a password"
            value={formData.password}
            onChangeText={text => handleChange('password', text)}
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
            icon="lock-outline"
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChangeText={text => handleChange('confirmPassword', text)}
            secureTextEntry
            autoCapitalize="none"
            error={errors.confirmPassword}
            icon="lock-check-outline"
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>I am a:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.role}
                onValueChange={value => handleChange('role', value)}
                style={styles.picker}
              >
                <Picker.Item label={getRoleDisplay(ROLES.STUDENT)} value={ROLES.STUDENT} />
<Picker.Item label={getRoleDisplay(ROLES.TEACHER)} value={ROLES.TEACHER} />

              </Picker>
            </View>
          </View>

          <Button
            title="Register"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />

          <Button
            title="Already have an account? Login"
            onPress={() => navigation.goBack()}
            variant="outline"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  registerButton: {
    marginTop: 8,
  },
});

export default RegisterScreen;
