import React from "react";
import { Dumbbell } from "lucide-react-native";

interface DumbbellIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const DumbbellIcon: React.FC<DumbbellIconProps> = ({
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
}) => {
  return <Dumbbell size={size} color={color} strokeWidth={strokeWidth} />;
};
