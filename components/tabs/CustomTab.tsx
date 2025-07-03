import React from "react";
import { AccessibilityState, GestureResponderEvent, StyleSheet, TouchableOpacity } from "react-native";

interface CustomTabProps {
  children: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  accessibilityState?: AccessibilityState;
  style?: any;
}

export default function CustomTab({ 
  children, 
  onPress, 
  accessibilityState,
  style,
}: CustomTabProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      accessibilityState={accessibilityState}
      style={[
        styles.container,
        style,
        accessibilityState?.selected && styles.selected,
      ]}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  selected: {
    backgroundColor: "transparent",
  },
}); 