import PropTypes from "prop-types";
import React from "react";
import { Animated, View } from "react-native";
import {
  Circle,
  Defs,
  FeBlend,
  FeColorMatrix,
  FeComposite,
  FeGaussianBlur,
  FeOffset,
  Filter,
  G,
  LinearGradient,
  Path,
  Stop,
  Svg,
  LinearGradient as SvgGradient
} from "react-native-svg";

export default class CircularProgress extends React.PureComponent {
  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  circlePath(x, y, radius, startAngle, endAngle) {
    var start = this.polarToCartesian(x, y, radius, endAngle * 0.9999999);
    var end = this.polarToCartesian(x, y, radius, startAngle);
    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    var d = [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
    ];
    return d.join(" ");
  }

  clampFill = (fill) => Math.min(100, Math.max(0, fill));

  render() {
    const {
      size,
      width,
      backgroundWidth,
      tintColor,
      tintTransparency,
      backgroundColor,
      style,
      rotation,
      lineCap,
      fillLineCap = lineCap,
      arcSweepAngle,
      fill,
      children,
      childrenContainerStyle,
      padding,
      renderCap,
      dashedBackground,
      dashedTint,
    } = this.props;

    const maxWidthCircle = backgroundWidth
      ? Math.max(width, backgroundWidth)
      : width;
    const sizeWithPadding = size / 2 + padding / 2;
    const radius = size / 2 - maxWidthCircle / 2 - padding / 2;

    const currentFillAngle = (arcSweepAngle * this.clampFill(fill)) / 100;
    const backgroundPath = this.circlePath(
      sizeWithPadding,
      sizeWithPadding,
      radius,
      tintTransparency ? 0 : currentFillAngle,
      arcSweepAngle
    );
    const circlePath = this.circlePath(
      sizeWithPadding,
      sizeWithPadding,
      radius,
      0,
      currentFillAngle
    );
    const coordinate = this.polarToCartesian(
      sizeWithPadding,
      sizeWithPadding,
      radius,
      currentFillAngle
    );
    const cap = this.props.renderCap
      ? this.props.renderCap({ center: coordinate })
      : null;

    const offset = size - maxWidthCircle * 2;

    const localChildrenContainerStyle = {
      ...{
        position: "absolute",
        left: maxWidthCircle + padding / 2,
        top: maxWidthCircle + padding / 2,
        width: offset,
        height: offset,
        borderRadius: offset / 2,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      },
      ...childrenContainerStyle,
    };

    const strokeDasharrayTint =
      dashedTint.gap > 0
        ? Object.values(dashedTint).map((value) => parseInt(value))
        : null;

    const strokeDasharrayBackground =
      dashedBackground.gap > 0
        ? Object.values(dashedBackground).map((value) => parseInt(value))
        : null;

    return (
      <View style={style}>
        <Svg width={size + padding} height={size + padding}>
          <Defs>
            <SvgGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#0B6FFF" stopOpacity="0" />
              <Stop offset="0.3" stopColor="#9C5BF5" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#0B6FFF" stopOpacity="1" />
            </SvgGradient>
            <LinearGradient
              id="progressGradient"
              x1="120"
              y1="-4.5"
              x2="17.5"
              y2="148"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor="#0B6FFF" stopOpacity="0" />
              <Stop offset="0.3" stopColor="#0B6FFF" stopOpacity="0" />
              <Stop offset="1" stopColor="#0B6FFF" stopOpacity="0.3" />
            </LinearGradient>
            <Filter
              id="filter0_d_701_28334"
              x="0.6"
              y="0.6"
              width="22.8"
              height="22.8"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <FeColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <FeOffset dy="1" />
              <FeGaussianBlur stdDeviation="1.2" />
              <FeComposite in2="hardAlpha" operator="out" />
              <FeColorMatrix
                type="matrix"
                values="0 0 0 0 0.180601 0 0 0 0 0.317666 0 0 0 0 0.606614 0 0 0 0.36 0"
              />
              <FeBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_701_28334"
              />
              <FeBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_701_28334"
                result="shape"
              />
            </Filter>
            <LinearGradient
              id="paint0_linear_701_28334"
              x1="12"
              y1="2"
              x2="12"
              y2="20"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0.372679" stopColor="white" />
              <Stop offset="1" stopColor="#9EBDFF" />
            </LinearGradient>
          </Defs>
          <G
            rotation={rotation}
            originX={(size + padding) / 2}
            originY={(size + padding) / 2}
          >
            {backgroundColor && (
              <Path
                d={backgroundPath}
                stroke={backgroundColor}
                strokeWidth={backgroundWidth || width}
                strokeLinecap={lineCap}
                strokeDasharray={strokeDasharrayBackground}
                fill="transparent"
              />
            )}
            {fill > 0 && (
              <Path
                d={circlePath}
                stroke={tintColor}
                strokeWidth={width}
                strokeLinecap={fillLineCap}
                strokeDasharray={strokeDasharrayTint}
                fill="transparent"
              />
            )}
            {cap && (
              <>
                <G
                  filter="url(#filter0_d_701_28334)"
                  x={coordinate.x - 12}
                  y={coordinate.y - 11}
                >
                  <Circle
                    cx="12"
                    cy="11"
                    r="9"
                    fill="url(#paint0_linear_701_28334)"
                  />
                </G>
                <Circle
                  cx={coordinate.x}
                  cy={coordinate.y}
                  r="6"
                  fill="#1862FE"
                />
              </>
            )}
          </G>
        </Svg>
        {children && (
          <View style={localChildrenContainerStyle}>{children(fill)}</View>
        )}
      </View>
    );
  }
}

CircularProgress.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  size: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.instanceOf(Animated.Value),
  ]).isRequired,
  fill: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  backgroundWidth: PropTypes.number,
  tintColor: PropTypes.string,
  tintTransparency: PropTypes.bool,
  backgroundColor: PropTypes.string,
  rotation: PropTypes.number,
  lineCap: PropTypes.string,
  arcSweepAngle: PropTypes.number,
  children: PropTypes.func,
  childrenContainerStyle: PropTypes.object,
  padding: PropTypes.number,
  renderCap: PropTypes.func,
  dashedBackground: PropTypes.object,
  dashedTint: PropTypes.object,
};

CircularProgress.defaultProps = {
  tintColor: "black",
  tintTransparency: true,
  rotation: 90,
  lineCap: "butt",
  arcSweepAngle: 360,
  padding: 0,
  dashedBackground: { width: 0, gap: 0 },
  dashedTint: { width: 0, gap: 0 },
};
