// nativewind-interop.ts
import { cssInterop } from "nativewind";
import { Text, Image, ScrollView, FlatList } from "react-native";

// Cho phép các component này hiểu className
cssInterop(Text, { className: "style" });
cssInterop(Image, { className: "style" });
cssInterop(ScrollView, { className: "style" });
cssInterop(FlatList, { className: "style" });
