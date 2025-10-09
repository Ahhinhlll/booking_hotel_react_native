import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PAYMENT_METHODS, PaymentMethod } from '../services/BookingServices';

interface PaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (methodId: string) => void;
  selectedMethod?: string | null;
}

export default function PaymentMethodModal({
  visible,
  onClose,
  onSelect,
  selectedMethod,
}: PaymentMethodModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Phương thức thanh toán</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.paymentMethodsList}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.paymentMethodItem}
                onPress={() => onSelect(method.id)}
              >
                <View style={styles.paymentMethodLeft}>
                  <View style={[styles.paymentMethodIcon, { backgroundColor: method.color }]}>
                    <Ionicons name={method.icon as any} size={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <Text style={styles.paymentMethodName}>{method.name}</Text>
                    {method.promotion && (
                      <Text style={styles.promotionText}>{method.promotion}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.radioButton}>
                  {selectedMethod === method.id && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity 
            style={styles.confirmButton}
            onPress={onClose}
          >
            <Text style={styles.confirmButtonText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  paymentMethodsList: {
    maxHeight: 400,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    marginBottom: 2,
  },
  promotionText: {
    fontSize: 12,
    color: '#FB923C',
    fontWeight: '500',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
  confirmButton: {
    backgroundColor: '#FB923C',
    paddingVertical: 16,
    margin: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
