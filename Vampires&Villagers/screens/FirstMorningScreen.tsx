import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, TouchableOpacity, BackHandler} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeModules } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

const { MyModule } = NativeModules;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FirstMorning'>;

const FirstMorningScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [timeLeft, setTimeLeft] = useState(3 * 60); // 3 dakika
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigatedRef = useRef(false); // çift geçişi engellemek için

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (!navigatedRef.current) {
            navigatedRef.current = true;
            navigation.navigate('RoleDoingScreen');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true
    );

    return () => backHandler.remove();
  }, []);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleAddMinute = () => {
    setTimeLeft(prev => prev + 60);
  };

  const handleSkipToNight = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!navigatedRef.current) {
      navigatedRef.current = true;
      navigation.navigate('RoleDoing');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>⏳ Kalan süre: {formatTime(timeLeft)}</Text>

      <Pressable style={styles.button} onPress={handleAddMinute}>
        <Text style={styles.buttonText}>+1.00</Text>
      </Pressable>

      <TouchableOpacity style={styles.skipButton} onPress={handleSkipToNight}>
        <Text style={styles.buttonText}>Geceye geç</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 30,
    color: '#eaeaea',
    marginBottom: 40
  },
  button: {
    backgroundColor: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 40
  },
  skipButton: {
    backgroundColor: '#1f00ab',
    paddingVertical: 12,
    borderRadius: 8,
    position: 'absolute',
    alignItems: 'center',
    bottom: 20,
    left: 16,
    right: 16
  },
  buttonText: {
    color: '#eaeaea',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default FirstMorningScreen;
