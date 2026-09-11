import React from "react";
import { View } from "react-native";

interface Props {
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
}

export default function ProgressBar({
  progress,
  color = "#25B7A9",
  trackColor = "#E5E7EB",
  height = 8,
}: Props) {
  const clamped = Math.min(Math.max(progress, 0), 100);

  return (
    <View
      style={{
        width: "100%",
        height,
        borderRadius: height / 2,
        backgroundColor: trackColor,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${clamped}%`,
          height: "100%",
          borderRadius: height / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
