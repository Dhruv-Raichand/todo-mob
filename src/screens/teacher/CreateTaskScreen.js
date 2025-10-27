import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useAuth } from '../../hooks/useAuth';
import { taskService } from '../../services/taskService';
import { userService } from '../../services/userService';
import { COLORS } from '../../constants/colors';
import { PRIORITY_LIST } from '../../constants/priorities';

const CreateTaskScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const studentsList = await userService.getAllStudents();
      setStudents(studentsList);
    } catch (error) {
      console.error('Error loading students:', error);
      Alert.alert('Error', 'Failed to load students');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
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

  const handleCreateTask = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        assignedTo: formData.assignedTo,
        priority: formData.priority,
        deadline: formData.deadline,
        teacherId: user.uid,
        progress: 0,
      };

      await taskService.createTask(taskData);
      Alert.alert('Success', 'Task created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      handleChange('deadline', selectedDate);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <Card>
        <Text style={styles.sectionTitle}>Task Details</Text>

        <Input
          label="Task Title *"
          placeholder="Enter task title"
          value={formData.title}
          onChangeText={text => handleChange('title', text)}
          error={errors.title}
        />

        <Input
          label="Description *"
          placeholder="Enter task description"
          value={formData.description}
          onChangeText={text => handleChange('description', text)}
          multiline
          numberOfLines={4}
          style={styles.textArea}
          error={errors.description}
        />

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Assign to Student *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.assignedTo}
              onValueChange={value => handleChange('assignedTo', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select a student" value="" />
              {students.map(student => (
                <Picker.Item
                  key={student.id}
                  label={student.name}
                  value={student.id}
                />
              ))}
            </Picker>
          </View>
          {errors.assignedTo && (
            <Text style={styles.error}>{errors.assignedTo}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Priority *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.priority}
              onValueChange={value => handleChange('priority', value)}
              style={styles.picker}
            >
              {PRIORITY_LIST.map(priority => (
                <Picker.Item
                  key={priority.value}
                  label={priority.label}
                  value={priority.value}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Deadline *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {formData.deadline.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
          {errors.deadline && (
            <Text style={styles.error}>{errors.deadline}</Text>
          )}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.deadline}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Create Task"
            onPress={handleCreateTask}
            loading={loading}
          />
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="outline"
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  picker: {
    height: 50,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.surface,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.text,
  },
  error: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 8,
    gap: 8,
  },
});

export default CreateTaskScreen;
