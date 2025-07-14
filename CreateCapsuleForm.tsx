import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Switch, 
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TimeCapsule } from '../types';
import { saveTimeCapsule, saveVideo, updateStreak } from '../utils/storage';

interface CreateCapsuleFormProps {
  videoUri: string;
  onSuccess: (newCapsule: TimeCapsule) => void;
  onCancel: () => void;
}

export default function CreateCapsuleForm({ videoUri, onSuccess, onCancel }: CreateCapsuleFormProps) {
  const [caption, setCaption] = useState('');
  const [unlockDate, setUnlockDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSharedWithStranger, setIsSharedWithStranger] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setUnlockDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const isPhoto = videoUri.toLowerCase().endsWith('.jpg') || videoUri.toLowerCase().endsWith('.jpeg');
      
      const newCapsule: Omit<TimeCapsule, 'id'> = {
        videoUri: videoUri, 
        thumbnailUri: isPhoto ? videoUri : undefined, 
        createdAt: new Date().toISOString(),
        unlockDate: unlockDate.toISOString(),
        isSharedWithStranger,
        caption,
        isUnlocked: false,
      };
      
      const savedCapsule = await saveTimeCapsule(newCapsule);
      
      await updateStreak();
      
      onSuccess(savedCapsule);
    } catch (error) {
      console.error('Error saving time capsule:', error);
      alert('Failed to save your time capsule. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateForDisplay = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Time Capsule</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.videoPreviewContainer}>
        <Image 
          source={{ uri: videoUri }} 
          style={styles.videoThumbnail}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Caption (optional)</Text>
        <TextInput
          style={styles.input}
          value={caption}
          onChangeText={setCaption}
          placeholder="Add a caption to your future self..."
          placeholderTextColor="#888"
          multiline
          maxLength={150}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Unlock Date</Text>
        <TouchableOpacity 
          style={styles.dateSelector}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{formatDateForDisplay(unlockDate)}</Text>
          <Ionicons name="calendar" size={24} color="#4ecdc4" />
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={unlockDate}
            minimumDate={minDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Share with a random stranger</Text>
          <Switch
            value={isSharedWithStranger}
            onValueChange={setIsSharedWithStranger}
            trackColor={{ false: '#444', true: '#6a5acd' }}
            thumbColor={isSharedWithStranger ? '#4ecdc4' : '#f4f3f4'}
          />
        </View>
        <Text style={styles.helperText}>
          Your memory will be sent to another user, and you'll receive theirs when the unlock date arrives.
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.submitButton, isSubmitting && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <LinearGradient
          colors={['#6a5acd', '#4ecdc4']}
          style={styles.submitButtonGradient}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Saving...' : 'Send to the Future'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  videoPreviewContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#222',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateSelector: {
    backgroundColor: '#222',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  helperText: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
  },
  submitButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 40,
  },
  submitButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
}); 