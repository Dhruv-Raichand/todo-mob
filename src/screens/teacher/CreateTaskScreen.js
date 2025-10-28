import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { useTasks } from '../../hooks/useTasks';
import { userService } from '../../services/userService';
import { COLORS } from '../../constants/colors';
import { PRIORITY_LIST } from '../../constants/priorities';
import { formatDate } from '../../utils/dateUtils';

const CreateTaskScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { createTask } = useTasks();
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const studentsList = await userService.getAllStudents();
      setStudents(studentsList);
      if (studentsList.length > 0) {
        setFormData(prev => ({ ...prev, assignedTo: studentsList[0].id }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load students');
      console.error(error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Task description is required';
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Please select a student';
    }

    if (formData.deadline < new Date()) {
      newErrors.deadline = 'Deadline must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (students.length === 0) {
      Alert.alert('Error', 'No students available to assign tasks');
      return;
    }

    setSubmitting(true);
    try {
      await createTask({
        title: formData.title.trim(),
        description: formData.description.trim(),
        assignedTo: formData.assignedTo,
        priority: formData.priority,
        deadline: formData.deadline,
        teacherId: user.uid,
      });

      Alert.alert('Success', 'Task created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange('deadline', selectedDate);
    }
  };

  if (loadingStudents) {
    return <LoadingSpinner message="Loading students..." />;
  }

  if (students.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No students found. Students need to register first.
        </Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Task Details</Text>

        <Input
          label="Task Title *"
          placeholder="Enter task title"
          value={formData.title}
          onChangeText={text => handleChange('title', text)}
          error={errors.title}
          icon="file-document-outline"
        />

        <Input
          label="Description *"
          placeholder="Describe the task..."
          value={formData.description}
          onChangeText={text => handleChange('description', text)}
          multiline
          numberOfLines={4}
          error={errors.description}
          icon="text"
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Assign to Student *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.assignedTo}
              onValueChange={value => handleChange('assignedTo', value)}
              style={styles.picker}
            >
              {students.map(student => (
                <Picker.Item
                  key={student.id}
                  label={`${student.name} (${student.email})`}
                  value={student.id}
                />
              ))}
            </Picker>
          </View>
          {errors.assignedTo && (
            <Text style={styles.errorText}>{errors.assignedTo}</Text>
          )}
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.priority}
              onValueChange={value => handleChange('priority', value)}
              style={styles.picker}
            >
              {PRIORITY_LIST.map(priority => (
                <Picker.Item
                  key={priority.value}
                  label={`${priority.icon} ${priority.label}`}
                  value={priority.value}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.dateContainer}>
          <Text style={styles.label}>Deadline *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(formData.deadline)}</Text>
          </TouchableOpacity>
          {errors.deadline && (
            <Text style={styles.errorText}>{errors.deadline}</Text>
          )}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.deadline}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        <Button
          title="Create Task"
          onPress={handleSubmit}
          loading={submitting}
          style={styles.submitButton}
        />

        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
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
  dateContainer: {
    marginBottom: 16,
  },
  dateButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 14,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.text,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  submitButton: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default CreateTaskScreen;
