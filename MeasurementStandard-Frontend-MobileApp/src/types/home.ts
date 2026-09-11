import { MaterialCommunityIcons } from "@expo/vector-icons";

export type CategoryCardData = {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  backgroundColor: string;
  iconColor: string;
  buttonColor: string;
};

export type BottomTab = {
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  activeIcon: keyof typeof MaterialCommunityIcons.glyphMap;
};