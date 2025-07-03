import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';

interface CustomCheckboxProps {
  checked: boolean;
  onPress: () => void;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
  label?: ReactNode;
  labelStyle?: object;
  shape?: 'square' | 'circle';
}

export default function CustomCheckbox({
  checked,
  onPress,
  size = 20,
  activeColor = '#19DBF2',
  inactiveColor = '#A9AEB8',
  label,
  labelStyle,
  shape = 'square',
}: CustomCheckboxProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.wrapper}
    >
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            backgroundColor: checked ? activeColor : 'transparent',
            borderColor: checked ? activeColor : inactiveColor,
            borderRadius: shape === 'circle' ? size / 2 : 6,
          },
        ]}
      >
        {checked && (
          <Svg width={14} height={14} viewBox="0 0 10 8" fill="none">
            <Path
              d="M9.0625 0.625C9.25 0.8125 9.25 1.125 9.0625 1.3125L4.3125 7.3125C4.125 7.5 3.8125 7.5 3.625 7.3125L0.875 4.5625C0.6875 4.375 0.6875 4.0625 0.875 3.875C1.0625 3.6875 1.375 3.6875 1.5625 3.875L3.9375 6.25L8.375 0.625C8.5625 0.4375 8.875 0.4375 9.0625 0.625Z"
              fill="white"
            />
          </Svg>
        )}
      </View>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
}); 