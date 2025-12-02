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
// ✅ REMOVED: import { Picker } from '@react-native-picker/picker';
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
// ✅ REMOVED: import { getRoleDisplay } from '../../utils/roleUtils';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ROLES.FACULTY, // ✅ ALWAYS FACULTY - No longer changeable
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
        ROLES.FACULTY // ✅ ALWAYS REGISTER AS FACULTY
      );

      Alert.alert(
        'Success',
        'Faculty account created successfully!', // ✅ UPDATED MESSAGE
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join as Faculty Member</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            value={formData.name}
            onChangeText={text => handleChange('name', text)}
            error={errors.name}
            icon="account-outline"
          />

          <Input
            label="Email"
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
            value={formData.password}
            onChangeText={text => handleChange('password', text)}
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
            icon="lock-outline"
          />

          <Input
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={text => handleChange('confirmPassword', text)}
            secureTextEntry
            autoCapitalize="none"
            error={errors.confirmPassword}
            icon="lock-check-outline"
          />

          {/* ✅ REMOVED: Role Picker - Users always register as Faculty */}
          {/* 
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>I am a:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.role}
                onValueChange={value => handleChange('role', value)}
                style={styles.picker}
              >
                <Picker.Item label={getRoleDisplay(ROLES.CHAIRMAN)} value={ROLES.CHAIRMAN} />
                <Picker.Item label={getRoleDisplay(ROLES.FACULTY)} value={ROLES.FACULTY} />
              </Picker>
            </View>
          </View>
          */}

          {/* ✅ ADD THIS: Info text for users */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ All users register as Faculty. Contact admin to become Chairman.
            </Text>
          </View>

          <Button
            title={loading ? 'Creating Account...' : 'Register'}
            onPress={handleRegister}
            disabled={loading}
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
  // ✅ REMOVED: pickerContainer, label, pickerWrapper, picker styles
  /*
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
  */
  // ✅ ADD THIS: Info box style
  infoBox: {
    backgroundColor: COLORS.info + '20',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  registerButton: {
    marginTop: 8,
  },
});

export default RegisterScreen;
