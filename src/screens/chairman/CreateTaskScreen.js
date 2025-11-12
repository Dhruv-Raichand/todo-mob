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

const CreateTaskScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedStudents: [],
    priority: 'medium',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      // CHANGED: Call getAllFaculty instead of getAllStudents
      const studentsList = await userService.getAllFaculty();
      setStudents(studentsList);
    } catch (error) {
      Alert.alert('Error', 'Failed to load faculty');
      console.error(error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleStudent = studentId => {
    setFormData(prev => {
      const assignedStudents = prev.assignedStudents.includes(studentId)
        ? prev.assignedStudents.filter(id => id !== studentId)
        : [...prev.assignedStudents, studentId];
      return { ...prev, assignedStudents };
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setFormData(prev => ({ ...prev, assignedStudents: [] }));
    } else {
      setFormData(prev => ({
        ...prev,
        assignedStudents: students.map(s => s.id),
      }));
    }
    setSelectAll(!selectAll);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Task description is required';
    }

    if (formData.assignedStudents.length === 0) {
      newErrors.assignedStudents = 'Please select at least one faculty member';
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
    Alert.alert('Error', 'No faculty available to assign tasks');
    return;
  }

  // Validate user
  if (!user || !user.uid) {
    Alert.alert('Error', 'User session expired. Please login again.');
    return;
  }

  // Validate all required fields
  if (!formData.title || !formData.description || !formData.deadline || !formData.priority) {
    Alert.alert('Error', 'Please fill all required fields');
    return;
  }

  if (!formData.assignedStudents || formData.assignedStudents.length === 0) {
    Alert.alert('Error', 'Please select at least one faculty member');
    return;
  }

  setSubmitting(true);
  try {
    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      assignedFaculty: formData.assignedStudents,
      priority: formData.priority,
      deadline: formData.deadline,
      chairmanId: user.uid,
    };

    // Log for debugging
    console.log('📝 Creating task with data:', taskData);

    await taskService.createTask(taskData);

    Alert.alert(
      'Success',
      `Task created and assigned to ${formData.assignedStudents.length} faculty member(s)!`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  } catch (error) {
    console.error('❌ Create task error:', error);
    Alert.alert('Error', error.message || 'Failed to create task');
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
    return <LoadingSpinner message="Loading faculty..." />;
  }

  if (students.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No faculty found. Faculty members need to register first.
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

        <View style={styles.studentsSection}>
          <View style={styles.studentsHeader}>
            <Text style={styles.label}>Assign to Faculty *</Text>
            <TouchableOpacity
              style={styles.selectAllButton}
              onPress={toggleSelectAll}
            >
              <Text style={styles.selectAllText}>
                {selectAll ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.selectedCount}>
            {formData.assignedStudents.length} of {students.length} selected
          </Text>

          <Card style={styles.studentsCard}>
            {students.map(student => (
              <TouchableOpacity
                key={student.id}
                style={styles.studentRow}
                onPress={() => toggleStudent(student.id)}
              >
                <CheckBox
                  value={formData.assignedStudents.includes(student.id)}
                  onValueChange={() => toggleStudent(student.id)}
                  tintColors={{ true: COLORS.primary, false: COLORS.border }}
                />
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentEmail}>{student.email}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Card>
          {errors.assignedStudents && (
            <Text style={styles.errorText}>{errors.assignedStudents}</Text>
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
  studentsSection: {
    marginBottom: 16,
  },
  studentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  selectAllText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  selectedCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
