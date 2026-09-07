import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Image,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Logo from '../assets/images/Logo.png';
import AllColors from '../assets/Colors';

const { width } = Dimensions.get('window');

const SIZE = Math.min(width * 0.85, 360);
const CENTER = SIZE / 2;
const RADIUS = CENTER - 4;
const EXTRA_FULL_TURNS = 5;
const SPIN_DURATION = 4500;

const Spinner = ({ items = [], onFinish, disabled = false }) => {
  const rotate = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);
  const spinningRef = useRef(false);

  const [spinning, setSpinning] = useState(false);

  const count = items.length;
  const angle = count ? 360 / count : 0;

  const point = (deg, radius = RADIUS) => {
    const rad = ((deg - 90) * Math.PI) / 180;

    return {
      x: CENTER + radius * Math.cos(rad),
      y: CENTER + radius * Math.sin(rad),
    };
  };

  const slicePath = (start, end) => {
    const a = point(end);
    const b = point(start);

    return `
      M ${CENTER} ${CENTER}
      L ${a.x} ${a.y}
      A ${RADIUS} ${RADIUS} 0 0 0 ${b.x} ${b.y}
      Z
    `;
  };

  const spin = () => {
    if (spinningRef.current || disabled || count === 0) return;

    spinningRef.current = true;
    setSpinning(true);

    const winner = Math.floor(Math.random() * count);
    const winnerCenter = winner * angle + angle / 2;

    const current = ((currentRotation.current % 360) + 360) % 360;
    const target = (360 - winnerCenter) % 360;
    const delta = (target - current + 360) % 360;

    const finalRotation =
      currentRotation.current + EXTRA_FULL_TURNS * 360 + delta;

    Animated.timing(rotate, {
      toValue: finalRotation,
      duration: SPIN_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      spinningRef.current = false;
      setSpinning(false);

      if (!finished) return;

      currentRotation.current = finalRotation;
      rotate.setValue(finalRotation);

      onFinish?.(items[winner], winner);
    });
  };

  const rotation = rotate.interpolate({
    inputRange: [-360, 0, 360, 720, 1080, 1440, 1800, 2160],
    outputRange: [
      '-360deg',
      '0deg',
      '360deg',
      '720deg',
      '1080deg',
      '1440deg',
      '1800deg',
      '2160deg',
    ],
  });

  return (
    <View style={styles.container}>
      <View style={styles.wheelArea}>
        <View style={styles.pointer}>
          <View style={styles.arrow} />
        </View>

        <Animated.View
          style={[styles.wheel, { transform: [{ rotate: rotation }] }]}
        >
          <Svg width={SIZE} height={SIZE}>
            {items.map((item, i) => (
              <Path
                key={item.id ?? i}
                d={slicePath(i * angle, (i + 1) * angle)}
                fill={
                  i % 2 === 0
                    ? AllColors.greenColor
                    : AllColors.whiteColor
                }
                stroke="#2A2A2A"
                strokeWidth={6}
              />
            ))}

            <Circle
              cx={CENTER}
              cy={CENTER}
              r={38}
              fill="#141515"
              stroke={AllColors.greenColor}
              strokeWidth={3}
            />
          </Svg>

          {items.map((item, i) => {
            const pos = point(
              i * angle + angle / 2,
              RADIUS * 0.62
            );

            return (
              <View
                key={item.id ?? i}
                style={[
                  styles.label,
                  {
                    left: pos.x - 45,
                    top: pos.y - 15,
                  },
                ]}
              >
                <Text
                  style={styles.labelText}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
              </View>
            );
          })}

          <View style={styles.centerText}>
            <Image source={Logo} style={styles.centerImage} />
          </View>
        </Animated.View>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          (spinning || disabled || count === 0) && styles.disabled,
        ]}
        onPress={spin}
        disabled={spinning || disabled || count === 0}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {spinning ? 'جاري الدوران...' : 'دوران'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141515',
  },

  wheelArea: {
    width: SIZE,
    height: SIZE,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pointer: {
    position: 'absolute',
    top: -2,
    left: CENTER - 14,
    width: 28,
    height: 28,
    zIndex: 20,
    alignItems: 'center',
  },

  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 28,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFD700',
  },

  wheel: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
  },

  label: {
    position: 'absolute',
    width: 90,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  labelText: {
    color: AllColors.blackColor,
    fontFamily: 'Cairo',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },

  centerText: {
    position: 'absolute',
    left: CENTER - 38,
    top: CENTER - 38,
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#141515',
    borderWidth: 3,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerImage: {
    width: 80,
    height: 80,
  },

  button: {
    marginTop: 35,
    minWidth: 170,
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: AllColors.greenColor,
    alignItems: 'center',
  },

  disabled: {
    opacity: 0.55,
  },

  buttonText: {
    color: AllColors.whiteColor,
    fontSize: 17,
    fontWeight: '700',
  },
});

export default Spinner;
