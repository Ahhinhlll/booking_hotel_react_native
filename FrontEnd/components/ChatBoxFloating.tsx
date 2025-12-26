import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  Alert,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChatBoxServices, ChatMessage } from "../services/ChatBoxServices";

const { width, height } = Dimensions.get("window");
const CHAT_HISTORY_KEY = "chatbox_history";
const BUTTON_POSITION_KEY = "chatbox_button_position";
const BUTTON_SIZE = 60;

// Lấy IP động như trong request.ts
const getDevHostIp = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) return hostUri.split(":")[0];
  if (Constants.manifest?.debuggerHost)
    return Constants.manifest.debuggerHost.split(":")[0];
  if (Constants.manifest2?.extra?.expoClient?.hostUri) {
    return Constants.manifest2.extra.expoClient.hostUri.split(":")[0];
  }
  return null;
};

const devHostIp = getDevHostIp();
const API_URL = devHostIp
  ? `http://${devHostIp}:3333`
  : "http://localhost:3333";

// Interface cho card khách sạn/phòng
interface HotelCard {
  type: "hotel" | "room";
  maKS?: string;
  maPhong?: string;
  tenKS?: string;
  tenPhong?: string;
  anh?: string[];
  gia?: number;
  diaChi?: string;
  loaiPhong?: string;
  sucChua?: number;
  dienTich?: number;
}

// Extended ChatMessage với cards
interface ExtendedChatMessage extends ChatMessage {
  cards?: HotelCard[];
}

// Tin nhắn chào mừng
const welcomeMessage: ExtendedChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Xin chào! 👋 Tôi là trợ lý ảo của hệ thống đặt phòng khách sạn. Tôi có thể giúp bạn:\n\n• Tìm kiếm khách sạn\n• Kiểm tra phòng trống\n• Xem khuyến mãi\n• Thông tin giá phòng\n\nBạn cần hỗ trợ gì?",
  timestamp: new Date(),
};

interface ChatBoxFloatingProps {
  visible?: boolean;
}

const ChatBoxFloating: React.FC<ChatBoxFloatingProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([
    welcomeMessage,
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  // Vị trí của nút floating (animated values)
  const pan = useRef(
    new Animated.ValueXY({ x: width - BUTTON_SIZE - 20, y: height - 180 })
  ).current;

  // Tạo PanResponder để xử lý kéo thả
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Chỉ bắt đầu drag khi di chuyển đủ xa
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        // Lưu vị trí hiện tại
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });
        setIsDragging(true);
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        setIsDragging(false);

        // Giới hạn vị trí trong màn hình
        let newX = (pan.x as any)._value;
        let newY = (pan.y as any)._value;

        // Đảm bảo nút không ra ngoài màn hình
        if (newX < 10) newX = 10;
        if (newX > width - BUTTON_SIZE - 10) newX = width - BUTTON_SIZE - 10;
        if (newY < 50) newY = 50;
        if (newY > height - BUTTON_SIZE - 100)
          newY = height - BUTTON_SIZE - 100;

        // Snap về cạnh trái hoặc phải
        const snapToEdge = newX < width / 2 ? 10 : width - BUTTON_SIZE - 10;

        Animated.spring(pan, {
          toValue: { x: snapToEdge, y: newY },
          useNativeDriver: false,
          friction: 5,
        }).start();

        // Lưu vị trí vào AsyncStorage
        saveButtonPosition(snapToEdge, newY);

        // Nếu không drag nhiều (chỉ tap), mở chat
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          setIsOpen(true);
        }
      },
    })
  ).current;

  // Lưu vị trí nút vào AsyncStorage
  const saveButtonPosition = async (x: number, y: number) => {
    try {
      await AsyncStorage.setItem(BUTTON_POSITION_KEY, JSON.stringify({ x, y }));
    } catch (error) {
      console.error("Error saving button position:", error);
    }
  };

  // Load vị trí nút từ AsyncStorage
  const loadButtonPosition = async () => {
    try {
      const savedPosition = await AsyncStorage.getItem(BUTTON_POSITION_KEY);
      if (savedPosition) {
        const { x, y } = JSON.parse(savedPosition);
        pan.setValue({ x, y });
      }
    } catch (error) {
      console.error("Error loading button position:", error);
    }
  };

  // Load vị trí khi mount
  useEffect(() => {
    loadButtonPosition();
  }, []);

  // Load chat history khi component mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Save chat history khi messages thay đổi (trừ lần đầu tiên)
  useEffect(() => {
    if (messages.length > 1) {
      saveChatHistory();
      setHasHistory(true);
    }
  }, [messages]);

  // Load chat history từ AsyncStorage
  const loadChatHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        // Chuyển đổi timestamp string thành Date object
        const messagesWithDates = parsedHistory.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        if (messagesWithDates.length > 1) {
          setMessages(messagesWithDates);
          setHasHistory(true);
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  // Save chat history vào AsyncStorage
  const saveChatHistory = async () => {
    try {
      await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  };

  // Xóa lịch sử chat
  const clearChatHistory = () => {
    Alert.alert(
      "Xóa lịch sử chat",
      "Bạn có chắc muốn xóa toàn bộ lịch sử cuộc trò chuyện?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
              setMessages([
                {
                  ...welcomeMessage,
                  id: Date.now().toString(),
                  timestamp: new Date(),
                },
              ]);
              setHasHistory(false);
            } catch (error) {
              console.error("Error clearing chat history:", error);
            }
          },
        },
      ]
    );
  };

  // Pulse animation for floating button (disabled khi đang drag)
  useEffect(() => {
    if (isDragging) return; // Không chạy pulse khi đang drag

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: false, // Phải dùng false vì pan dùng false
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    if (!isOpen && !isDragging) {
      pulse.start();
    } else {
      pulse.stop();
      scaleAnim.setValue(1);
    }
    return () => pulse.stop();
  }, [isOpen, isDragging]);

  // Hàm chuyển đổi URL ảnh
  const getImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl) return "";
    // Nếu đã là URL đầy đủ
    if (imageUrl.startsWith("http")) return imageUrl;

    // Kiểm tra xem đã có /uploads/ chưa
    let path = imageUrl;
    if (!path.startsWith("/uploads/") && !path.startsWith("uploads/")) {
      // Thêm /uploads/ vào đầu
      path = `/uploads/${path.startsWith("/") ? path.slice(1) : path}`;
    }

    return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // Xử lý click vào card
  const handleCardPress = (card: HotelCard) => {
    setIsOpen(false); // Đóng chat

    if (card.type === "hotel" && card.maKS) {
      // Navigate to hotel detail: /hotels/[id]
      router.push(`/hotels/${card.maKS}` as any);
    } else if (card.type === "room" && card.maPhong) {
      // Navigate to room detail: /room-detail/[maPhong]
      router.push(`/room-detail/${card.maPhong}` as any);
    }
  };

  // Parse response để extract cards
  const parseResponseForCards = (responseData: any): HotelCard[] => {
    const cards: HotelCard[] = [];

    if (responseData?.data) {
      // Lấy ảnh khách sạn để làm fallback
      const hotelImages = responseData.data.hotel?.anh;

      // Check for hotel info
      if (responseData.data.hotel) {
        const hotel = responseData.data.hotel;
        cards.push({
          type: "hotel",
          maKS: hotel.maKS,
          tenKS: hotel.tenKS,
          diaChi: hotel.diaChi,
          anh: hotel.anh,
          gia: hotel.giaThapNhat,
        });
      }

      // Check for available rooms
      if (responseData.data.rooms?.availableList) {
        responseData.data.rooms.availableList.forEach((room: any) => {
          // Sử dụng ảnh phòng, nếu không có thì dùng ảnh khách sạn
          const roomImages =
            room.anh && room.anh.length > 0 ? room.anh : hotelImages;
          cards.push({
            type: "room",
            maPhong: room.maPhong,
            maKS: responseData.data.hotel?.maKS,
            tenPhong: room.tenPhong,
            loaiPhong: room.LoaiPhong?.tenLoaiPhong || room.loaiPhong,
            gia: room.gia,
            sucChua: room.sucChua,
            dienTich: room.dienTich,
            anh: roomImages,
          });
        });
      }
    }

    return cards;
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ExtendedChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await ChatBoxServices.sendMessage(userMessage.content);

      // Parse cards từ response
      const cards = parseResponseForCards(response);

      const assistantMessage: ExtendedChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.success
          ? response.message
          : "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.",
        timestamp: new Date(),
        cards: cards.length > 0 ? cards : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: ExtendedChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Xin lỗi, có lỗi xảy ra khi kết nối với hệ thống. Vui lòng thử lại sau.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Render hotel/room card
  const renderCard = (card: HotelCard, index: number) => {
    // Lấy URL ảnh đầu tiên
    const imageUrl =
      card.anh && card.anh.length > 0 ? getImageUrl(card.anh[0]) : null;

    return (
      <TouchableOpacity
        key={index}
        style={styles.card}
        onPress={() => handleCardPress(card)}
        activeOpacity={0.8}
      >
        {/* Image */}
        <View style={styles.cardImageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.cardImage}
              resizeMode="cover"
              onError={(e) =>
                console.log("Image load error:", e.nativeEvent.error, imageUrl)
              }
            />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <Ionicons
                name={card.type === "hotel" ? "business" : "bed"}
                size={24}
                color="#ccc"
              />
            </View>
          )}
          <View style={styles.cardTypeBadge}>
            <Text style={styles.cardTypeBadgeText}>
              {card.type === "hotel" ? "Khách sạn" : "Phòng"}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {card.type === "hotel" ? card.tenKS : card.tenPhong}
          </Text>

          {card.type === "hotel" && card.diaChi && (
            <View style={styles.cardRow}>
              <Ionicons name="location-outline" size={12} color="#666" />
              <Text style={styles.cardSubtext} numberOfLines={1}>
                {card.diaChi}
              </Text>
            </View>
          )}

          {card.type === "room" && (
            <>
              {card.loaiPhong && (
                <View style={styles.cardRow}>
                  <Ionicons name="pricetag-outline" size={12} color="#666" />
                  <Text style={styles.cardSubtext}>{card.loaiPhong}</Text>
                </View>
              )}
              <View style={styles.cardRow}>
                {card.sucChua && (
                  <View style={styles.cardTag}>
                    <Ionicons name="people-outline" size={10} color="#D95500" />
                    <Text style={styles.cardTagText}>{card.sucChua} người</Text>
                  </View>
                )}
                {card.dienTich && (
                  <View style={styles.cardTag}>
                    <Ionicons name="resize-outline" size={10} color="#D95500" />
                    <Text style={styles.cardTagText}>{card.dienTich}m²</Text>
                  </View>
                )}
              </View>
            </>
          )}

          {card.gia && (
            <Text style={styles.cardPrice}>
              {card.gia.toLocaleString()} VNĐ
            </Text>
          )}

          <View style={styles.cardAction}>
            <Text style={styles.cardActionText}>Xem chi tiết</Text>
            <Ionicons name="chevron-forward" size={14} color="#D95500" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessage = ({ item }: { item: ExtendedChatMessage }) => (
    <View
      style={[
        styles.messageContainer,
        item.role === "user" ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      {item.role === "assistant" && (
        <View style={styles.avatarContainer}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
        </View>
      )}
      <View style={styles.messageContent}>
        <View
          style={[
            styles.messageBubble,
            item.role === "user" ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              item.role === "user" ? styles.userText : styles.assistantText,
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.timestamp,
              item.role === "user" && styles.userTimestamp,
            ]}
          >
            {item.timestamp.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        {/* Render cards nếu có */}
        {item.cards && item.cards.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.cardsContainer}
          >
            {item.cards.map((card, index) => renderCard(card, index))}
          </ScrollView>
        )}
      </View>
    </View>
  );

  const quickActions = [
    "Khách sạn nào đang có khuyến mãi?",
    "Có phòng trống không?",
    "Giá phòng thấp nhất?",
  ];

  return (
    <>
      {/* Floating Button - Draggable */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.floatingButtonDraggable,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale: isDragging ? 1.1 : scaleAnim },
            ],
          },
        ]}
      >
        <View
          style={[
            styles.floatingButtonInner,
            isDragging && styles.floatingButtonDragging,
          ]}
        >
          <Ionicons name="chatbubbles" size={28} color="#fff" />
        </View>
        {/* Badge hiển thị khi có lịch sử chat */}
        {hasHistory && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {messages.length > 99 ? "99+" : messages.length - 1}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Chat Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.chatContainer}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Trợ lý AI</Text>
                  <Text style={styles.headerSubtitle}>
                    Luôn sẵn sàng hỗ trợ
                  </Text>
                </View>
              </View>
              <View style={styles.headerRight}>
                {/* Nút xóa lịch sử */}
                {messages.length > 1 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearChatHistory}
                  >
                    <Ionicons name="trash-outline" size={20} color="#999" />
                  </TouchableOpacity>
                )}
                {/* Nút đóng */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsOpen(false)}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Messages */}
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              showsVerticalScrollIndicator={false}
            />

            {/* Quick Actions */}
            {messages.length <= 2 && (
              <View style={styles.quickActions}>
                {quickActions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickActionButton}
                    onPress={() => {
                      setInputText(action);
                    }}
                  >
                    <Text style={styles.quickActionText}>{action}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#D95500" />
                <Text style={styles.loadingText}>Đang xử lý...</Text>
              </View>
            )}

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nhập tin nhắn..."
                placeholderTextColor="#999"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
                ]}
                onPress={sendMessage}
                disabled={!inputText.trim() || isLoading}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={inputText.trim() && !isLoading ? "#fff" : "#ccc"}
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    zIndex: 1000,
    elevation: 10,
    shadowColor: "#D95500",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  floatingButtonDraggable: {
    position: "absolute",
    zIndex: 1000,
    elevation: 10,
    shadowColor: "#D95500",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  floatingButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#D95500",
    justifyContent: "center",
    alignItems: "center",
  },
  floatingButtonDragging: {
    backgroundColor: "#C04500",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff3b30",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  chatContainer: {
    height: height * 0.85,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#D95500",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  clearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  messageContent: {
    flex: 1,
    maxWidth: "85%",
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  assistantMessage: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#D95500",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginTop: 4,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: "#D95500",
    borderBottomRightRadius: 4,
    alignSelf: "flex-end",
  },
  assistantBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: "#fff",
  },
  assistantText: {
    color: "#333",
  },
  timestamp: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  userTimestamp: {
    color: "rgba(255,255,255,0.7)",
  },
  // Card styles
  cardsContainer: {
    marginTop: 8,
    marginLeft: -4,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginRight: 10,
    marginLeft: 4,
    width: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  cardImageContainer: {
    width: 90,
    height: 110,
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTypeBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#D95500",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardTypeBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },
  cardInfo: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
    gap: 4,
  },
  cardSubtext: {
    fontSize: 11,
    color: "#666",
    flex: 1,
  },
  cardTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
    gap: 3,
  },
  cardTagText: {
    fontSize: 10,
    color: "#D95500",
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#D95500",
    marginTop: 4,
  },
  cardAction: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  cardActionText: {
    fontSize: 11,
    color: "#D95500",
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    backgroundColor: "#f8f9fa",
    gap: 8,
  },
  quickActionButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D95500",
  },
  quickActionText: {
    fontSize: 13,
    color: "#D95500",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#666",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 50,
    fontSize: 15,
    maxHeight: 100,
    color: "#333",
  },
  sendButton: {
    position: "absolute",
    right: 20,
    bottom: Platform.OS === "ios" ? 36 : 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D95500",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#e0e0e0",
  },
});

export default ChatBoxFloating;
