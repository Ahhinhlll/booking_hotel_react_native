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
import { PAYMENT_METHODS, PaymentMethod } from '../services/DatPhongServices';

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
  const handleConfirm = () => {
    if (selectedMethod) {
      onSelect(selectedMethod);
    }
    onClose();
  };

  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method.id) {
      case 'momo':
        return (
          <View style={[styles.paymentIcon, { backgroundColor: '#D946EF' }]}>
            <Text style={styles.paymentIconText}>mo mo</Text>
          </View>
        );
      case 'zalopay':
        return (
          <View style={[styles.paymentIcon, { backgroundColor: '#00A651' }]}>
            <Text style={styles.paymentIconText}>Zalo Pay</Text>
          </View>
        );
      case 'shopeepay':
        return (
          <View style={[styles.paymentIcon, { backgroundColor: '#FF6B35' }]}>
            <Text style={styles.paymentIconText}>S</Text>
          </View>
        );
      case 'credit':
        return (
          <View style={[styles.paymentIcon, { backgroundColor: '#1E40AF' }]}>
            <Ionicons name="card" size={20} color="#FFFFFF" />
          </View>
        );
      case 'atm':
        return (
          <View style={[styles.paymentIcon, { backgroundColor: '#2563EB' }]}>
            <Text style={styles.paymentIconText}>ATM</Text>
          </View>
        );
      case 'hotel':
        return (
          <View style={[styles.paymentIcon, { backgroundColor: '#6B7280' }]}>
            <Ionicons name="business" size={20} color="#FFFFFF" />
          </View>
        );
      default:
        return (
          <View style={[styles.paymentIcon, { backgroundColor: '#6B7280' }]}>
            <Ionicons name="card" size={20} color="#FFFFFF" />
          </View>
        );
    }
  };

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
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="chevron-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Phương thức thanh toán</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.paymentMethodsList}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.paymentMethodItem}
                onPress={() => onSelect(method.id)}
              >
                <View style={styles.paymentMethodLeft}>
                  {getPaymentIcon(method)}
                  <View style={styles.paymentMethodInfo}>
                    <Text style={styles.paymentMethodName}>{method.name}</Text>
                    {method.promotion && (
                      <View style={styles.promotionBox}>
                        <Text style={styles.promotionText}>{method.promotion}</Text>
                      </View>
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
            style={[
              styles.confirmButton,
              !selectedMethod && styles.confirmButtonDisabled
            ]}
            onPress={handleConfirm}
            disabled={!selectedMethod}
          >
            <Text style={[
              styles.confirmButtonText,
              !selectedMethod && styles.confirmButtonTextDisabled
            ]}>
              Xác nhận
            </Text>
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    marginBottom: 4,
  },
  promotionBox: {
    backgroundColor: '#E0F2FE',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  promotionText: {
    fontSize: 12,
    color: '#0EA5E9',
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
  confirmButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  confirmButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
