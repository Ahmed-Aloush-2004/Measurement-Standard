import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

interface HomeBottomBarProps {
  activeTab: string;
  onNavigate: (route: string) => void;
}

interface TabItemProps {
  label: string;
  active: boolean;
  onPress: () => void;
  icon: React.ReactNode;
}

function TabItem({
  label,
  active,
  onPress,
  icon,
}: TabItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className="flex-1 items-center justify-center"
    >
      <View
        className={`w-[38px] h-[30px] rounded-full items-center justify-center ${
          active ? "bg-[#EAE7FA]" : ""
        }`}
      >
        {icon}
      </View>

      <Text
        className={`text-[9px] mt-[2px] ${
          active
            ? "text-[#30266F] font-black"
            : "text-[#85858C] font-medium"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeBottomBar({
  activeTab,
  onNavigate,
}: HomeBottomBarProps) {
  return (
    <View className="h-[66px] bg-white border-t border-[#EEEEF2] flex-row items-center px-2 shadow-sm">
      {/* المزيد */}
      <TabItem
        label="المزيد"
        active={activeTab === "more"}
        onPress={() => onNavigate("/more")}
        icon={
          <MaterialCommunityIcons
            name="apps"
            size={19}
            color={
              activeTab === "more"
                ? "#30266F"
                : "#85858C"
            }
          />
        }
      />

      {/* المفضلة */}
      <TabItem
        label="المفضلة"
        active={activeTab === "favorites"}
        onPress={() => onNavigate("/favorites")}
        icon={
          <Ionicons
            name={
              activeTab === "favorites"
                ? "star"
                : "star-outline"
            }
            size={19}
            color={
              activeTab === "favorites"
                ? "#30266F"
                : "#85858C"
            }
          />
        }
      />

      {/* الرئيسية */}
      <TabItem
        label="الرئيسية"
        active={activeTab === "home"}
        onPress={() => onNavigate("/")}
        icon={
          <Ionicons
            name={
              activeTab === "home"
                ? "home"
                : "home-outline"
            }
            size={19}
            color={
              activeTab === "home"
                ? "#30266F"
                : "#85858C"
            }
          />
        }
      />

      {/* الاختبارات */}
      <TabItem
        label="الاختبارات"
        active={activeTab === "tests"}
        onPress={() => onNavigate("/tests")}
        icon={
          <Feather
            name="file-text"
            size={18}
            color={
              activeTab === "tests"
                ? "#30266F"
                : "#85858C"
            }
          />
        }
      />

      {/* ملفي */}
      <TabItem
        label="ملفي"
        active={activeTab === "profile"}
        onPress={() => onNavigate("/profile/edit")}
        icon={
          <Ionicons
            name={
              activeTab === "profile"
                ? "person"
                : "person-outline"
            }
            size={19}
            color={
              activeTab === "profile"
                ? "#30266F"
                : "#85858C"
            }
          />
        }
      />
    </View>
  );
}