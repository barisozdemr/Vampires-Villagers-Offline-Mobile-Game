import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Start'>;

const StartScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vampirler ve Köylüler</Text>

      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('AddPlayer')}
      >
        <Text style={styles.buttonText}>Yeni Oyuna Başla</Text>
      </Pressable>

      <Pressable
        style={[styles.button, { backgroundColor: 'blue' }]}
        onPress={() => navigation.navigate('Rules')}
      >
        <Text style={styles.buttonText}>Kurallar</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 36,
    color: '#eaeaea',
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#c40000',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  rulesButton: {
    backgroundColor: '#blue',
  },
  buttonText: {
    color: '#eaeaea',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default StartScreen;
