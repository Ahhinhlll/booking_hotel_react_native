import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { KhachSanServices, KhachSanData } from "../../services/KhachSanServices";

interface HotelWithDistance extends KhachSanData {
  distance?: number;
}

const { height } = Dimensions.get("window");

export default function MapScreen() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [hotels, setHotels] = useState<HotelWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<HotelWithDistance | null>(null);

  // Hàm tính khoảng cách giữa 2 điểm GPS (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  // Lấy vị trí GPS hiện tại
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission not granted");
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(userCoords);
      return userCoords;
    } catch (error) {
      console.log("GPS not available on this device:", error);
      // Không hiển thị alert, chỉ log lỗi
      // App vẫn hoạt động bình thường nhưng không có GPS tracking
      return null;
    }
  };

  // Lấy danh sách khách sạn và tính khoảng cách
  const loadHotels = async () => {
    try {
      setLoading(true);
      const data = await KhachSanServices.getAll();
      
      // Lọc chỉ các khách sạn có tọa độ
      const hotelsWithCoords = data.filter(
        (hotel) => hotel.latitude && hotel.longitude
      );

      // Lấy vị trí người dùng
      const userCoords = await getUserLocation();

      // Tính khoảng cách nếu có vị trí người dùng
      let hotelsWithDistance: HotelWithDistance[] = hotelsWithCoords;
      if (userCoords) {
        hotelsWithDistance = hotelsWithCoords.map((hotel) => ({
          ...hotel,
          distance: calculateDistance(
            userCoords.latitude,
            userCoords.longitude,
            hotel.latitude!,
            hotel.longitude!
          ),
        }));

        // Sắp xếp theo khoảng cách gần nhất
        hotelsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }

      setHotels(hotelsWithDistance);
      
      // Update map with hotels
      if (hotelsWithDistance.length > 0) {
        updateMapMarkers(hotelsWithDistance, userCoords);
      }
    } catch (error) {
      console.error("Error loading hotels:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách khách sạn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleOpenGoogleMaps = (hotel: HotelWithDistance) => {
    if (hotel.latitude && hotel.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${hotel.latitude},${hotel.longitude}`;
      Linking.openURL(url);
    } else if (hotel.diaChi) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.diaChi)}`;
      Linking.openURL(url);
    }
  };

  const handleMarkerPress = (hotel: HotelWithDistance) => {
    setSelectedHotel(hotel);
    // Center map on selected hotel
    if (hotel.latitude && hotel.longitude && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        map.setCenter({lat: ${hotel.latitude}, lng: ${hotel.longitude}});
        map.setZoom(15);
        true;
      `);
    }
  };

  const handleRefreshLocation = async () => {
    const userCoords = await getUserLocation();
    if (userCoords && hotels.length > 0) {
      // Tính lại khoảng cách
      const hotelsWithDistance = hotels.map((hotel) => ({
        ...hotel,
        distance: hotel.latitude && hotel.longitude
          ? calculateDistance(
              userCoords.latitude,
              userCoords.longitude,
              hotel.latitude,
              hotel.longitude
            )
          : undefined,
      }));

      // Sắp xếp lại theo khoảng cách
      hotelsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setHotels(hotelsWithDistance);
      
      // Update map
      updateMapMarkers(hotelsWithDistance, userCoords);
    }
  };

  const updateMapMarkers = (hotelsData: HotelWithDistance[], userCoords: {latitude: number, longitude: number} | null) => {
    if (!webViewRef.current) return;
    
    const markersData = hotelsData.map(h => ({
      lat: h.latitude,
      lng: h.longitude,
      title: h.tenKS,
      id: h.maKS
    }));
    
    const userMarker = userCoords ? {lat: userCoords.latitude, lng: userCoords.longitude} : null;
    
    webViewRef.current.injectJavaScript(`
      updateMarkers(${JSON.stringify(markersData)}, ${JSON.stringify(userMarker)});
      true;
    `);
  };

  const renderHotelItem = ({ item }: { item: HotelWithDistance }) => (
    <TouchableOpacity
      onPress={() => handleMarkerPress(item)}
      style={{
        backgroundColor: selectedHotel?.maKS === item.maKS ? "#EFF6FF" : "#FFFFFF",
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
        borderWidth: 1,
        borderColor: selectedHotel?.maKS === item.maKS ? "#3B82F6" : "#E5E7EB",
        width: 280,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        {item.anh && item.anh.length > 0 ? (
          <Image
            source={{ uri: item.anh[0] }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 8,
              marginRight: 12,
            }}
          />
        ) : (
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 8,
              marginRight: 12,
              backgroundColor: "#F3F4F6",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="business" size={32} color="#9CA3AF" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#1F2937",
              marginBottom: 4,
            }}
            numberOfLines={1}
          >
            {item.tenKS}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Ionicons name="location" size={14} color="#6B7280" />
            <Text
              style={{ fontSize: 12, color: "#6B7280", marginLeft: 4, flex: 1 }}
              numberOfLines={1}
            >
              {item.diaChi || "Chưa có địa chỉ"}
            </Text>
          </View>
          {item.distance !== undefined && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="navigate" size={14} color="#3B82F6" />
              <Text
                style={{
                  fontSize: 14,
                  color: "#3B82F6",
                  marginLeft: 4,
                  fontWeight: "600",
                }}
              >
                {item.distance < 1
                  ? `${(item.distance * 1000).toFixed(0)}m`
                  : `${item.distance.toFixed(1)}km`}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // HTML for Leaflet Map (Open Source - No API Key needed)
  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        * { margin: 0; padding: 0; }
        html, body, #map { height: 100%; width: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        let map;
        let markers = [];
        let userMarker = null;
        
        // Initialize map
        map = L.map('map').setView([10.762622, 106.660172], 12);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);
        
        function updateMarkers(hotelsData, userLocation) {
          // Clear existing markers
          markers.forEach(m => map.removeLayer(m));
          markers = [];
          if (userMarker) {
            map.removeLayer(userMarker);
            userMarker = null;
          }
          
          // Add user location marker
          if (userLocation) {
            const blueIcon = L.divIcon({
              className: 'custom-icon',
              html: '<div style="background-color: #4285F4; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            });
            
            userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: blueIcon })
              .addTo(map)
              .bindPopup('Vị trí của bạn');
            
            // Center on user location
            map.setView([userLocation.lat, userLocation.lng], 13);
          }
          
          // Add hotel markers
          if (hotelsData && hotelsData.length > 0) {
            const bounds = [];
            
            hotelsData.forEach(hotel => {
              if (hotel.lat && hotel.lng) {
                const orangeIcon = L.divIcon({
                  className: 'custom-icon',
                  html: '<div style="background-color: #FF6B35; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                  iconSize: [16, 16],
                  iconAnchor: [8, 8],
                });
                
                const marker = L.marker([hotel.lat, hotel.lng], { icon: orangeIcon })
                  .addTo(map)
                  .bindPopup(hotel.title);
                
                markers.push(marker);
                bounds.push([hotel.lat, hotel.lng]);
              }
            });
            
            // Fit bounds if no user location
            if (!userLocation && bounds.length > 0) {
              map.fitBounds(bounds, { padding: [50, 50] });
            }
          }
        }
      </script>
    </body>
    </html>
  `;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#6B7280" }}>
          Đang tải bản đồ...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 40,
          paddingHorizontal: 16,
          paddingBottom: 16,
          backgroundColor: "#FFFFFF",
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          zIndex: 10,
        }}
      >
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#333" }}>
          Bản đồ khách sạn
        </Text>
        <TouchableOpacity onPress={handleRefreshLocation}>
          <Ionicons name="locate" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Map WebView */}
      <View style={{ flex: 1 }}>
        {/* GPS not available banner */}
        {!userLocation && !loading && hotels.length > 0 && (
          <View
            style={{
              position: "absolute",
              top: 10,
              left: 16,
              right: 16,
              backgroundColor: "#FEF3C7",
              borderRadius: 8,
              padding: 12,
              flexDirection: "row",
              alignItems: "center",
              zIndex: 100,
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
          >
            <Ionicons name="information-circle" size={20} color="#F59E0B" />
            <Text
              style={{
                fontSize: 13,
                color: "#92400E",
                marginLeft: 8,
                flex: 1,
              }}
            >
              GPS không khả dụng. Bản đồ vẫn hiển thị khách sạn nhưng không tính khoảng cách.
            </Text>
          </View>
        )}
        
        <WebView
          ref={webViewRef}
          source={{ html: mapHTML }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
        />
      </View>

      {/* Hotel List */}
      {hotels.length > 0 && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#FFFFFF",
            paddingVertical: 16,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#1F2937" }}>
              {userLocation ? "Khách sạn gần bạn" : "Danh sách khách sạn"}
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280" }}>
              {hotels.length} khách sạn
            </Text>
          </View>

          <FlatList
            data={hotels}
            renderItem={renderHotelItem}
            keyExtractor={(item) => item.maKS}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />

          {selectedHotel && (
            <TouchableOpacity
              onPress={() => handleOpenGoogleMaps(selectedHotel)}
              style={{
                backgroundColor: "#3B82F6",
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginHorizontal: 16,
                marginTop: 12,
              }}
            >
              <Ionicons name="navigate" size={20} color="#FFFFFF" />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#FFFFFF",
                  marginLeft: 8,
                }}
              >
                Chỉ đường đến {selectedHotel.tenKS}
              </Text>
            </TouchableOpacity>
          )}

          {/* Bottom indicator */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: "#E5E7EB",
              borderRadius: 2,
              alignSelf: "center",
              marginTop: 12,
            }}
          />
        </View>
      )}

      {/* No hotels message */}
      {hotels.length === 0 && !loading && (
        <View
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: 16,
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          <Text style={{ fontSize: 16, color: "#6B7280", textAlign: "center" }}>
            Chưa có khách sạn nào có tọa độ GPS
          </Text>
        </View>
      )}
    </View>
  );
}
