import { useMemo, useRef, useState } from 'react';
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
import Svg, { G, Path, Circle } from 'react-native-svg';
import * as d3Shape from 'd3-shape';

import Logo from '../assets/images/Logo.png';
import AllColors from '../assets/Colors';

const { width } = Dimensions.get('window');

const SIZE = Math.min(width * 0.85, 360);
const CENTER = SIZE / 2;
const RADIUS = CENTER - 4;
const INNER_RADIUS = 38;

const SPIN_DURATION = 4500;
const FULL_SPINS = 5;

const LABEL_WIDTH = 92;
const LABEL_HEIGHT = 38;

const ACCENT_COLOR = '#FFD700';

const Spinner = ({ items = [], onFinish, disabled = false }) => {
  const rotate = useRef(new Animated.Value(0)).current;
  const spinningRef = useRef(false);

  const [spinning, setSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState(null);

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.85)).current;

  const count = items.length;
  const angleOffset = count > 0 ? 360 / count / 2 : 0;

  const wheelPaths = useMemo(() => {
    if (!count) return [];

    const data = Array.from({ length: count }).fill(1);
    const arcs = d3Shape.pie()(data);

    const arcGenerator = d3Shape
      .arc()
      .outerRadius(RADIUS)
      .innerRadius(INNER_RADIUS);

    return arcs.map((arc, index) => ({
      path: arcGenerator(arc),
      centroid: arcGenerator.centroid(arc),
      index,
    }));
  }, [count]);

  const spin = () => {
    if (spinningRef.current || disabled || count === 0) return;

    spinningRef.current = true;
    setSpinning(true);
    setWinnerIndex(null);

    cardOpacity.setValue(0);
    cardScale.setValue(0.85);

    // العجلة مجرد ديكور بتلف بشكل عشوائي بالكامل، مفيش علاقة بينها وبين الفايز
    const selectedWinner = Math.floor(Math.random() * count);
    const randomRotation = Math.random() * 360;
    const rotationAmount = FULL_SPINS * 360 + randomRotation;

    Animated.timing(rotate, {
      toValue: rotationAmount,
      duration: SPIN_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      spinningRef.current = false;
      setSpinning(false);

      if (!finished) return;

      setWinnerIndex(selectedWinner);

      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 5,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();

      onFinish?.(items[selectedWinner], selectedWinner);
    });
  };

  const rotation = rotate.interpolate({
    inputRange: [0, 3600],
    outputRange: ['0deg', '3600deg'],
    extrapolate: 'extend',
  });

  return (
    <View style={styles.container}>
      <View style={styles.wheelArea}>
        <Animated.View
          style={[styles.wheel, { transform: [{ rotate: rotation }] }]}
        >
          <View
            style={[
              styles.wheelContent,
              { transform: [{ rotate: `-${angleOffset}deg` }] },
            ]}
          >
            <Svg width={SIZE} height={SIZE}>
              <G x={CENTER} y={CENTER}>
                {wheelPaths.map((arc, i) => (
                  <Path
                    key={items[i]?.id ?? i}
                    d={arc.path}
                    fill={i % 2 === 0 ? AllColors.greenColor : AllColors.whiteColor}
                    stroke="#2A2A2A"
                    strokeWidth={3}
                  />
                ))}

                <Circle
                  cx={0}
                  cy={0}
                  r={INNER_RADIUS}
                  fill="#141515"
                  stroke={AllColors.greenColor}
                  strokeWidth={3}
                />
              </G>
            </Svg>

            {wheelPaths.map((arc, i) => {
              const [x, y] = arc.centroid;

              return (
                <View
                  key={`label-${items[i]?.id ?? i}`}
                  style={[
                    styles.label,
                    {
                      left: CENTER + x - LABEL_WIDTH / 2,
                      top: CENTER + y - LABEL_HEIGHT / 2,
                    },
                  ]}
                >
                  <Text
                    style={styles.labelText}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.65}
                  >
                    {items[i]?.title ?? ''}
                  </Text>
                </View>
              );
            })}
          </View>

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
    alignItems: 'center',
    justifyContent: 'center',
  },

  wheel: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
  },

  wheelContent: {
    width: SIZE,
    height: SIZE,
  },

  label: {
    position: 'absolute',
    width: LABEL_WIDTH,
    height: LABEL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },

  labelText: {
    color: AllColors.blackColor,
    fontFamily: 'Cairo',
    fontSize: 11,
    textAlign: 'center',
    writingDirection: 'rtl',
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

  resultCard: {
    marginTop: 22,
    minWidth: 230,
    maxWidth: SIZE,
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: '#1D2A24',
    borderWidth: 1.5,
    borderColor: ACCENT_COLOR,
    alignItems: 'center',
  },

  resultBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: ACCENT_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  resultBadgeIcon: {
    color: '#141515',
    fontFamily: 'Cairo',
    fontSize: 18,
  },

  resultLabel: {
    color: ACCENT_COLOR,
    fontFamily: 'Cairo',
    fontSize: 12,
    marginBottom: 4,
  },

  resultName: {
    color: '#FFFFFF',
    fontFamily: 'Cairo',
    fontSize: 18,
    textAlign: 'center',
    writingDirection: 'rtl',
  },

  button: {
    marginTop: 25,
    minWidth: 170,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    backgroundColor: AllColors.greenColor,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabled: {
    opacity: 0.55,
  },

  buttonText: {
    color: AllColors.whiteColor,
    fontFamily: 'Cairo',
    fontSize: 17,
  },
});

export default Spinner;