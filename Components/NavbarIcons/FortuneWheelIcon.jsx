import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import AllColors from '../../assets/Colors';

const FortuneWheelIcon = ({ focused }) => {
  const size = 40;
  const radius = size / 2;

  const colors = focused
    ? [
        AllColors.greenColor,
        AllColors.whiteColor,
        AllColors.greenColor,
        AllColors.whiteColor,
        AllColors.greenColor,
        AllColors.whiteColor,
      ]
    : [
        AllColors.darkgreenColor,
        AllColors.darkwhiteColor,
        AllColors.darkgreenColor,
        AllColors.darkwhiteColor,
        AllColors.darkgreenColor,
        AllColors.darkwhiteColor,
      ];

  // حساب مسار كل جزء - اتجاه RTL
  const createSegmentPath = (index) => {
    const startAngle = (-index * 60 * Math.PI) / 180;
    const endAngle = (-(index + 1) * 60 * Math.PI) / 180;

    const x1 = radius + radius * Math.cos(startAngle);
    const y1 = radius + radius * Math.sin(startAngle);

    const x2 = radius + radius * Math.cos(endAngle);
    const y2 = radius + radius * Math.sin(endAngle);

    return `
      M ${radius} ${radius}
      L ${x1} ${y1}
      A ${radius} ${radius} 0 0 0 ${x2} ${y2}
      Z
    `;
  };

  return (
    <View style={wheelStyles.wheelOuterCircle}>

      {/* العجلة - اتجاه عربي RTL */}
      <View style={wheelStyles.wheelContainer}>
        <Svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          <G
            rotation="-90"
            origin={`${radius}, ${radius}`}
          >
            {colors.map((color, index) => (
              <Path
                key={index}
                d={createSegmentPath(index)}
                fill={color}
              />
            ))}
          </G>
        </Svg>

        {/* النقطة المركزية */}
        <View style={wheelStyles.centerDot} />
      </View>
    </View>
  );
};

const wheelStyles = StyleSheet.create({
  wheelOuterCircle: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  wheelContainer: {
    width: 32,
    height: 32,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: AllColors.darkgreenColor,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerDot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: AllColors.darkgreenColor,
    zIndex: 5,
  },
});

export default FortuneWheelIcon;