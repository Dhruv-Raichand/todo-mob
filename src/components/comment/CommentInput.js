import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { COLORS } from '../../constants/colors';

const CommentInput = ({ onSubmit, placeholder = 'Add a comment...' }) => {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit(comment.trim());
      setComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        value={comment}
        onChangeText={setComment}
        multiline
        maxLength={500}
      />
      <TouchableOpacity
        style={[styles.button, !comment.trim() && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!comment.trim() || submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? 'Sending...' : 'Send'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default CommentInput;
