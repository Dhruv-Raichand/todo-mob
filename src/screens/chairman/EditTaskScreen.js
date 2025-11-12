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
import CheckBox from '@react-native-community/checkbox';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { taskService } from '../../services/taskService';
import { userService } from '../../services/userService';
import { COLORS } from '../../constants/colors';
import { PRIORITY_LIST } from '../../constants/priorities';
import { formatDate } from '../../utils/dateUtils';

const EditTaskScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [loadingTask, setLoadingTask] = useState(true);
  const [loadingFaculty, setLoadingFaculty] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedFaculty: [],
    priority: 'medium',
    deadline: new Date(),
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadTask();
    loadFaculty();
  }, []);

  const loadTask = async () => {
    try {
      const taskData = await taskService.getTask(taskId);
      if (taskData) {
        setTask(taskData);
        setFormData({
          title: taskData.title,
          description: taskData.description || '',
          assignedFaculty: taskData.assignedFaculty || [],
          priority: taskData.priority,
          deadline: taskData.deadline.toDate ? taskData.deadline.toDate() : new Date(taskData.deadline),
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load task');
      console.error(error);
    } finally {
      setLoadingTask(false);
    }
  };

  const loadFaculty = async () => {
    try {
      const facultyList = await userService.getAllFaculty();
      setFaculty(facultyList);
    } catch (error) {
      Alert.alert('Error', 'Failed to load faculty');
      console.error(error);
    } finally {
      setLoadingFaculty(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleFaculty = facultyId => {
    setFormData(prev => {
      const assignedFaculty = prev.assignedFaculty.includes(facultyId)
        ? prev.assignedFaculty.filter(id => id !== facultyId)
        : [...prev.assignedFaculty, facultyId];
      return { ...prev, assignedFaculty };
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Task description is required';
    }

    if (formData.assignedFaculty.length === 0) {
      newErrors.assignedFaculty = 'Please select at least one faculty member';
    }

    if (formData.deadline < new Date()) {
      newErrors.deadline = 'Deadline must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      await taskService.updateTask(taskId, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        assignedFaculty: formData.assignedFaculty,
        priority: formData.priority,
        deadline: formData.deadline,
      });

      Alert.alert('Success', 'Task updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
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

  if (loadingTask || loadingFaculty) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Edit Task</Text>

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

        <Text style={styles.label}>Assigned Faculty *</Text>
        <Card style={styles.studentsCard}>
          {faculty.map(facultyMember => (
            <TouchableOpacity
              key={facultyMember.id}
              style={styles.studentRow}
              onPress={() => toggleFaculty(facultyMember.id)}
            >
              <CheckBox
                value={formData.assignedFaculty.includes(facultyMember.id)}
                onValueChange={() => toggleFaculty(facultyMember.id)}
                tintColors={{ true: COLORS.primary, false: COLORS.border }}
              />
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{facultyMember.name}</Text>
                <Text style={styles.studentEmail}>{facultyMember.email}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card>
        {errors.assignedFaculty && (
          <Text style={styles.errorText}>{errors.assignedFaculty}</Text>
        )}

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
          title="Update Task"
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  studentsCard: {
    marginBottom: 8,
    maxHeight: 300,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  studentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  studentEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  pickerContainer: {
    marginBottom: 16,
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
});

export default EditTaskScreen;
