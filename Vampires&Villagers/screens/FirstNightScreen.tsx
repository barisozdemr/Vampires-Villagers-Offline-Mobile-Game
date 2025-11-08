import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeModules } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

const { MyModule } = NativeModules;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FirstNight'>;

type GameMap = { [playerName: string]: string };

const FirstNightScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [gameMap, setGameMap] = useState<GameMap>({});
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [roleShown, setRoleShown] = useState<boolean>(false);
  const [allDone, setAllDone] = useState<boolean>(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const map: GameMap = await MyModule.getGameMap();
        const ordered: string[] = await MyModule.getOrderedPlayers();
        // only include players that exist in the game map
        const filtered = ordered.filter((name) => map.hasOwnProperty(name));
        setGameMap(map);
        setPlayerNames(filtered);
      } catch (err: any) {
        console.error('Error fetching game data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true
    );
    return () => backHandler.remove();
  }, []);

  const onSeeRole = () => setRoleShown(true);

  const onNext = () => {
    const next = currentIndex + 1;
    if (next < playerNames.length) {
      setCurrentIndex(next);
      setRoleShown(false);
    } else {
      setAllDone(true);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'vampir': return '#c40000';
      case 'soytarı': return '#666';
      default: return '#059c00';
    }
  };

  const renderRoleSection = () => {
    const player = playerNames[currentIndex];
    const role = gameMap[player];
    if (!role) return null;

    return (
      <View style={styles.roleContainer}>
        <Text style={styles.roleText}>
          Rolün: <Text style={[styles.roleValue, { color: getRoleColor(role) }]}>{role.toUpperCase()}</Text>
        </Text>
        {role === 'vampir' && (
          <View style={styles.vampirListContainer}>
            <Text style={styles.vampirTitle}>Diğer Vampirler:</Text>
            {playerNames.filter(p => gameMap[p] === 'vampir' && p !== player).map(v => (
              <Text key={v} style={styles.vampirName}>• {v}</Text>
            ))}
            {playerNames.filter(p => gameMap[p] === 'vampir' && p !== player).length === 0 && (
              <Text style={styles.vampirName}>• Yok</Text>
            )}
          </View>
        )}
        <View style={styles.buttonSpacing}>
          <Button title="Devam Et" onPress={onNext} color="#6200ee" />
        </View>
      </View>
    );
  };

  const renderPlayerPassSection = () => (
    <View style={styles.passContainer}>
      <Text style={styles.playerName}>{playerNames[currentIndex]}</Text>
      <Text style={styles.instruction}>
        Telefonu <Text style={styles.highlight}>{playerNames[currentIndex]}</Text> adlı oyuncuya verin
      </Text>
      <View style={styles.roleButtonSpacing}>
        <Pressable style={styles.roleButton} onPress={onSeeRole}>
          <Text style={styles.roleButtonText}>!!  ROLÜ GÖR  !!</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderAllDoneSection = () => (
    <View style={styles.passContainer}>
      <Text style={styles.instruction}>
        Telefonu <Text style={styles.highlight}>Yönetici</Text>'ye verin
      </Text>
      <View style={styles.buttonSpacing}>
        <Pressable style={styles.finalButton} onPress={() => navigation.navigate('FirstMorning' as never)}>
          <Text style={styles.finalButtonText}>SABAHA GEÇ</Text>
        </Pressable>
      </View>
    </View>
  );

  if (loading) return (
    <View style={styles.centered}><ActivityIndicator size="large" color="#eaeaea" /></View>
  );

  if (!playerNames.length) return (
    <View style={styles.centered}><Text style={styles.defaultText}>Oyuncu bulunamadı.</Text></View>
  );

  return (
    <View style={styles.container}>
      {!allDone ? (
        !roleShown ? renderPlayerPassSection() : renderRoleSection()
      ) : (
        renderAllDoneSection()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#121212',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  passContainer: {
    alignItems: 'center',
    marginTop: 70,
  },
  playerName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#eaeaea',
  },
  instruction: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 24,
    color: '#eaeaea',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#eaeaea',
  },
  buttonSpacing: {
    marginBottom: 25,
    width: '65%',
    alignSelf: 'center',
  },
  roleButton: {
    backgroundColor: '#c40000',
    paddingVertical: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  roleButtonSpacing: {
    marginVertical: 8,
    width: '60%',
    height: '30%',
    alignSelf: 'center',
  },
  roleContainer: {
    alignItems: 'center',
  },
  roleText: {
    fontSize: 30,
    marginBottom: 16,
    color: '#eaeaea',
  },
  roleValue: {
    fontWeight: 'bold',
    color: '#eaeaea',
  },
  vampirListContainer: {
    marginTop: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  vampirTitle: {
    fontSize: 20,
    marginBottom: 8,
    color: '#eaeaea',
  },
  vampirName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c40000',
  },
  defaultText: {
    fontSize: 18,
    color: '#eaeaea',
  },
  finalButton: {
    backgroundColor: '#ff8f00',
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 2,
  },
  finalButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default FirstNightScreen;
