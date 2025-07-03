import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface DataPoint {
  value: number;
  label: string;
  color?: string;
}

interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  padding?: number;
}

type Point = {
  x: number;
  y: number;
};

export default function LineChart({ 
  data,
  width = 343, // 默认宽度
  height = 104.54, // 默认高度
  padding = 20,
}: LineChartProps) {
  const GRAPH_WIDTH = width - padding * 2;
  const GRAPH_HEIGHT = height - padding * 2;

  // 找到数据中的最大值和最小值
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue;

  // 计算每个数据点的坐标
  const points = data.map((point, index) => {
    const x = padding + (index * (GRAPH_WIDTH - padding)) / (data.length - 1);
    const y = padding + GRAPH_HEIGHT - ((point.value - minValue) / valueRange) * GRAPH_HEIGHT;
    return { x, y };
  });

  // 生成贝塞尔曲线路径
  const bezierPath = points.reduce((path, point, i, points) => {
    if (i === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const prevPoint = points[i - 1];
    const xDiff = point.x - prevPoint.x;
    
    // 计算切线方向
    const getTangent = (p0: Point, p1: Point, p2: Point | null) => {
      if (!p2) return { x: p1.x - p0.x, y: p1.y - p0.y };
      return {
        x: (p2.x - p0.x) / 2,
        y: (p2.y - p0.y) / 2
      };
    };

    const nextPoint = points[i + 1];
    const tension = 0.25; // ECharts 默认的张力系数

    // 计算当前段的切线
    const prevTangent = getTangent(
      i > 1 ? points[i - 2] : prevPoint,
      prevPoint,
      point
    );
    const nextTangent = getTangent(
      prevPoint,
      point,
      nextPoint || point
    );

    // 控制点位置
    const cp1x = prevPoint.x + prevTangent.x * tension;
    const cp1y = prevPoint.y + prevTangent.y * tension;
    const cp2x = point.x - nextTangent.x * tension;
    const cp2y = point.y - nextTangent.y * tension;

    return `${path} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
  }, '');

  // 生成填充区域的路径
  const fillPath = `${bezierPath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="gradient-line-chart" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#00A1FF" stopOpacity="0.2" />
            <Stop offset="1" stopColor="#00A1FF" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* 绘制填充区域 */}
        <Path
          d={fillPath}
          fill="url(#gradient-line-chart)"
        />

        {/* 绘制贝塞尔曲线 */}
        <Path
          d={bezierPath}
          stroke="#00A1FF"
          strokeWidth="2"
          fill="none"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 