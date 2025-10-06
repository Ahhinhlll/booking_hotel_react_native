// components/DateTimePicker.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateTimePickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: {
    checkInDate: Date;
    checkOutDate: Date;
    checkInTime: Date;
    checkOutTime: Date;
    bookingType: 'hourly' | 'overnight' | 'daily';
    duration: number;
  }) => void;
  initialData?: {
    checkInDate: Date;
    checkOutDate: Date;
    checkInTime: Date;
    checkOutTime: Date;
    bookingType: 'hourly' | 'overnight' | 'daily';
    duration: number;
  };
}

export default function CustomDateTimePicker({
  visible,
  onClose,
  onConfirm,
  initialData,
}: DateTimePickerProps) {
  const [checkInDate, setCheckInDate] = useState(
    initialData?.checkInDate || new Date()
  );
  const [checkOutDate, setCheckOutDate] = useState(
    initialData?.checkOutDate || new Date()
  );
  const [checkInTime, setCheckInTime] = useState(
    initialData?.checkInTime || new Date()
  );
  const [checkOutTime, setCheckOutTime] = useState(
    initialData?.checkOutTime || new Date()
  );
  const [bookingType, setBookingType] = useState<'hourly' | 'overnight' | 'daily'>(
    initialData?.bookingType || 'hourly'
  );
  const [duration, setDuration] = useState(initialData?.duration || 2);

  const [showDatePicker, setShowDatePicker] = useState<'checkin' | null>(null);
  const [showTimePicker, setShowTimePicker] = useState<'checkin' | null>(null);

  // Function to calculate checkout date and time based on checkin and booking type
  const calculateCheckoutDateTime = (checkInDate: Date, checkInTime: Date, bookingType: string, duration: number) => {
    const checkoutDate = new Date(checkInDate);
    const checkoutTime = new Date(checkInTime);

    switch (bookingType) {
      case 'hourly':
        // Add duration hours to checkout time
        checkoutTime.setHours(checkoutTime.getHours() + duration);
        // If checkout time goes to next day, update checkout date
        if (checkoutTime.getHours() >= 24) {
          checkoutDate.setDate(checkoutDate.getDate() + 1);
          checkoutTime.setHours(checkoutTime.getHours() - 24);
        }
        break;
      case 'overnight':
        // Add 1 day and set checkout time to 9:00 AM
        checkoutDate.setDate(checkoutDate.getDate() + 1);
        checkoutTime.setHours(9, 0, 0, 0);
        break;
      case 'daily':
        // Add 1 day and set checkout time to 12:00 PM
        checkoutDate.setDate(checkoutDate.getDate() + 1);
        checkoutTime.setHours(12, 0, 0, 0);
        break;
    }

    return { checkoutDate, checkoutTime };
  };

  // Auto-calculate checkout when checkin, booking type, or duration changes
  useEffect(() => {
    const { checkoutDate, checkoutTime } = calculateCheckoutDateTime(checkInDate, checkInTime, bookingType, duration);
    setCheckOutDate(checkoutDate);
    setCheckOutTime(checkoutTime);
  }, [checkInDate, checkInTime, bookingType, duration]);

  const handleConfirm = () => {
    onConfirm({
      checkInDate,
      checkOutDate,
      checkInTime,
      checkOutTime,
      bookingType,
      duration,
    });
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDurationText = () => {
    switch (bookingType) {
      case 'hourly':
        return `${duration} giờ`;
      case 'overnight':
        return '1 đêm';
      case 'daily':
        return '1 ngày';
      default:
        return `${duration} giờ`;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn thời gian</Text>
          <TouchableOpacity onPress={handleConfirm}>
            <Text style={styles.confirmButton}>Xác nhận</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Booking Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loại đặt phòng</Text>
            <View style={styles.typeContainer}>
              {[
                { key: 'hourly', label: 'Theo giờ', icon: 'hourglass-outline' },
                { key: 'overnight', label: 'Qua đêm', icon: 'moon-outline' },
                { key: 'daily', label: 'Theo ngày', icon: 'business-outline' },
              ].map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeButton,
                    bookingType === type.key && styles.typeButtonActive,
                  ]}
                  onPress={() => setBookingType(type.key as any)}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={20}
                    color={bookingType === type.key ? '#FB923C' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      bookingType === type.key && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Duration for hourly */}
          {bookingType === 'hourly' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thời gian</Text>
              <View style={styles.durationContainer}>
                {[1, 2, 3, 4, 6, 8, 12].map((hours) => (
                  <TouchableOpacity
                    key={hours}
                    style={[
                      styles.durationButton,
                      duration === hours && styles.durationButtonActive,
                    ]}
                    onPress={() => setDuration(hours)}
                  >
                    <Text
                      style={[
                        styles.durationButtonText,
                        duration === hours && styles.durationButtonTextActive,
                      ]}
                    >
                      {hours}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Check-in Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ngày nhận phòng</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker('checkin')}
            >
              <Ionicons name="calendar-outline" size={20} color="#FB923C" />
              <Text style={styles.dateTimeText}>{formatDate(checkInDate)}</Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Check-in Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Giờ nhận phòng</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker('checkin')}
            >
              <Ionicons name="time-outline" size={20} color="#FB923C" />
              <Text style={styles.dateTimeText}>{formatTime(checkInTime)}</Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Check-out Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ngày trả phòng (Tự động)</Text>
            <View style={[styles.dateTimeButton, { backgroundColor: '#F9FAFB' }]}>
              <Ionicons name="calendar-outline" size={20} color="#10B981" />
              <Text style={[styles.dateTimeText, { color: '#10B981' }]}>{formatDate(checkOutDate)}</Text>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
          </View>

          {/* Check-out Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Giờ trả phòng (Tự động)</Text>
            <View style={[styles.dateTimeButton, { backgroundColor: '#F9FAFB' }]}>
              <Ionicons name="time-outline" size={20} color="#10B981" />
              <Text style={[styles.dateTimeText, { color: '#10B981' }]}>{formatTime(checkOutTime)}</Text>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
          </View>

          {/* Summary */}
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Tóm tắt đặt phòng</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Loại:</Text>
              <Text style={styles.summaryValue}>{getDurationText()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Nhận phòng:</Text>
              <Text style={styles.summaryValue}>
                {formatTime(checkInTime)}, {formatDate(checkInDate)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Trả phòng:</Text>
              <Text style={styles.summaryValue}>
                {formatTime(checkOutTime)}, {formatDate(checkOutDate)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={checkInDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                setCheckInDate(selectedDate);
              }
              setShowDatePicker(null);
            }}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={checkInTime}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              if (selectedTime) {
                setCheckInTime(selectedTime);
              }
              setShowTimePicker(null);
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  confirmButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FB923C',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  typeButtonActive: {
    borderColor: '#FB923C',
    backgroundColor: '#FEF3E7',
  },
  typeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#FB923C',
    fontWeight: '600',
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  durationButton: {
    width: '14%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  durationButtonActive: {
    borderColor: '#FB923C',
    backgroundColor: '#FEF3E7',
  },
  durationButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  durationButtonTextActive: {
    color: '#FB923C',
    fontWeight: '600',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  dateTimeText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  summary: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
});
