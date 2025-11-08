import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeModules } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Morning'>;

type GameMap = Record<string, string>;
type RoleActionsMap = { [action: string]: [string, string][] };

const { MyModule } = NativeModules as {
  MyModule: {
    getGameMap(): Promise<Record<string, string>>;
    getNextDaysGameMap(): Promise<Record<string, string>>;
    getRoleActions(): Promise<RoleActionsMap>;
  };
};

const MorningScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [gameMap, setGameMap] = useState<GameMap>({});
  const [news, setNews] = useState<string[]>([]);
  const [phase, setPhase] = useState<'news' | 'discussion' | 'voting' | 'results'>('news');
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(180);
  const [resultText, setResultText] = useState<string>('');
  const [gameEnded, setGameEnded] = useState(false);
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const previousMap = await MyModule.getGameMap();
      const currentMap = await MyModule.getNextDaysGameMap();
      const roleActionsMap = await MyModule.getRoleActions();
      setGameMap(currentMap);
      generateNews(previousMap, currentMap, roleActionsMap);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (phase === 'discussion') {
      intervalId.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(intervalId.current!);
            setPhase('voting');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
    };
  }, [phase]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true
    );
    return () => backHandler.remove();
  }, []);

  const nextDay = () => {
    MyModule.setGameMap(gameMap);
    navigation.navigate('RoleDoing');
  }

  const generateNews = (previous: GameMap, current: GameMap, actionsMap?: RoleActionsMap) => {
    let n: string[] = [];

    const previousPlayers = Object.keys(previous);
    const currentPlayers = Object.keys(current);

    const deadPlayers = previousPlayers.filter(p => !currentPlayers.includes(p));

    deadPlayers.forEach(p => n.push(`${p} bu gece öldü.`));

    const shoots = actionsMap?.shoot;
    if (shoots) {
      shoots.forEach(([shootersName, _]) => {
        n.push(`${shootersName} avcıydı ve bu gece mermisini kullandı.`);
      });
    }

    const currentVampires      = Object.keys(current).filter(p => current[p] === 'vampir');
    const currentNonVampires   = Object.keys(current).filter(p => current[p] !== 'vampir');

    if (currentVampires.length >= currentNonVampires.length) {
      const currRoles = Object.values(current); // ['köylü','avcı','vampir',...]

      const hunterCount    = currRoles.filter(r => r === 'avcı').length;
      const bodyguardCount   = currRoles.filter(r => r === 'bodyguard').length;
      const doctorCount    = currRoles.filter(r => r === 'doktor').length;

      let extra = 0;
      extra += hunterCount;
      extra += bodyguardCount;
      extra += doctorCount;

      if (extra > 0 && hunterCount === 0) {
        extra = 0;
      }

      const vampCount  = currentVampires.length - extra;
      const nonVampCount = currentNonVampires.length - 1;

      if(vampCount >= nonVampCount){
        setResultText('Vampirler oyunu kazandı!');
        setGameEnded(true);
      }
    }
    else if (currentVampires.length === 0) {
      setResultText('Köylüler oyunu kazandı!');
      setGameEnded(true);
    }

    setNews(n);
  };

  const players = Object.keys(gameMap);
  const currentVoter = players[currentVoterIndex];

  const handleSkipNews = () => {
    if (gameEnded) {
      setPhase('results');
    } else {
      setPhase('discussion');
    }
  };

  const handleStartVoting = () => {
    clearInterval(intervalId.current!);
    setPhase('voting');
  };

  const handleVote = () => {
    if (!selectedPlayer) {
      Alert.alert('Hata', 'Lütfen bir oyuncu seçin.');
      return;
    }

    const updatedVotes = {
      ...votes,
      [selectedPlayer]: (votes[selectedPlayer] || 0) + 1,
    };

    setVotes(updatedVotes);
    setSelectedPlayer(null);

    if (currentVoterIndex + 1 < players.length) {
      setCurrentVoterIndex(prev => prev + 1);
    } else {
      setPhase('results');
    }
  };

  const renderResults = () => {
    const finalVotes = { ...votes };
    if (phase === 'results' && selectedPlayer !== null) {
      finalVotes[selectedPlayer] = (finalVotes[selectedPlayer] || 0) + 1;
    }

    if (resultText) {
      return <Text style={styles.text}>{resultText}</Text>;
    }

    const maxVotes = Math.max(...Object.values(finalVotes), 0);
    const topVoted = Object.entries(finalVotes).filter(([_, v]) => v === maxVotes);

    if (topVoted.length === 1) {
      const [nameToLynch] = topVoted[0];
      const roleOfLynched = gameMap[nameToLynch]; // Asılan oyuncunun rolünü al

      // Soytarı kontrolü için ek mesaj
      const jesterMessage = roleOfLynched === 'soytarı'
        ? '\nSoytarı kazandı ve kasabadan intikamını alacak!'
        : '';

      if (gameMap[nameToLynch]) {
        setGameMap(prevMap => {
          const newMap = { ...prevMap };
          delete newMap[nameToLynch];

          const players = Object.keys(newMap);

          const vampireCount = players.filter(p => newMap[p] === 'vampir').length;
          const nonVampireCount = players.length - vampireCount;

          if (vampireCount === 0) {
            setResultText(
              `${nameToLynch}, ${maxVotes} oy ile asıldı ${jesterMessage}\n\nKöylüler oyunu kazandı!`
            );
            setGameEnded(true);
          }
          else if (vampireCount >= nonVampireCount) {
            const currRoles = Object.values(newMap); // ['köylü','avcı','vampir',...]

            const hunterCount    = currRoles.filter(r => r === 'avcı').length;
            const bodyguardCount   = currRoles.filter(r => r === 'bodyguard').length;
            const doctorCount    = currRoles.filter(r => r === 'doktor').length;
            const revengeCount = jesterMessage ? 1 : 0;

            let extra = 0;
            extra += hunterCount;
            extra += bodyguardCount;
            extra += doctorCount;
            extra += revengeCount;

            if (extra > 0 && hunterCount === 0 && revengeCount === 0) {
              extra = 0;
            }

            const adjustedVamps    = vampireCount - extra;
            const adjustedNonVamps = nonVampireCount - 1;

            if (adjustedVamps >= adjustedNonVamps) {
              setResultText(
                `${nameToLynch}, ${maxVotes} oy ile asıldı ${jesterMessage}\n\nVampirler oyunu kazandı!`
              );
              setGameEnded(true);
            }
          }
          else {
            setResultText(`${nameToLynch}, ${maxVotes} oy ile asıldı!\n${jesterMessage}`);
          }

          return newMap;
        });
      }

      return <Text style={styles.text}>{nameToLynch}, {maxVotes} oyla asıldı!{jesterMessage}</Text>;
    }

    return <Text style={styles.text}>Oy çokluğu sağlanamadı. Kimse asılmadı!</Text>;
  };

  return (
    <View style={styles.container}>
      {phase === 'news' && (
        <View style={styles.newsContainer}>
          <Text style={styles.header}>Sabah oldu!</Text>
          <Text style={styles.subHeader}>Haberler</Text>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {news.length > 0 ? (
              news.map((item, i) => (
                <Text key={i} style={styles.newsText}>• {item}</Text>
              ))
            ) : (
              <Text style={styles.newsText}>• Bu gece kimse ölmedi!</Text>
            )}
          </ScrollView>
          <TouchableOpacity style={styles.fullWidthButton} onPress={handleSkipNews}>
            <Text style={styles.fullWidthButtonText}>Haberleri Geç</Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === 'discussion' && (
        <View style={styles.discussionContainer}>
          <View style={styles.centeredContent}>
            <Text style={styles.timeText}>
              ⏳ Kalan süre: {Math.floor(countdown / 60)}:
              {(countdown % 60).toString().padStart(2, '0')}
            </Text>

            <TouchableOpacity
              style={styles.addTimeButton}
              onPress={() => setCountdown(prev => prev + 60)}
            >
              <Text style={styles.addTimeText}>+1:00</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.centerButton}
              onPress={handleStartVoting}
            >
              <Text style={styles.centerButtonText}>Oylamayı Başlat</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.fullWidthButton, { backgroundColor: '#1f00ab' }]}
            onPress={() => nextDay()}
          >
            <Text style={styles.fullWidthButtonText}>Geceye Geç</Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === 'voting' && currentVoter && (
        <View style={styles.votingContainer}>
          <Text style={styles.voteHeader}>{currentVoter} oy veriyor</Text>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {players.map(
              p =>
                p !== currentVoter && (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setSelectedPlayer(p)}
                    style={[
                      styles.voteButton,
                      selectedPlayer === p && styles.selectedButton,
                    ]}
                  >
                    <Text style={styles.text}>{p}</Text>
                    <Text style={styles.voteText}>Oy: {votes[p] || 0}</Text>
                  </TouchableOpacity>
                )
            )}
          </ScrollView>
          <TouchableOpacity
            style={[
              styles.fullWidthButton,
              { backgroundColor: selectedPlayer ? '#6200ee' : '#888888' }
            ]}
            onPress={handleVote}
            disabled={!selectedPlayer}
          >
            <Text style={styles.fullWidthButtonText}>Oy Ver</Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === 'results' && (
        <View style={styles.centerContainer}>
          {gameEnded ? (
            <>
              {/* Oyun bittiğinde sonuç metni ve yeni oyun butonu */}
              <Text style={styles.text}>{resultText}</Text>
              <TouchableOpacity
                style={styles.centerButton}
                onPress={() => navigation.navigate('Start')}
              >
                <Text style={styles.centerButtonText}>Yeni Oyuna Başla</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Oyun bitmediyse sadece geceye geç butonu */}
              <Text style={styles.text}>{renderResults()}</Text>
              <TouchableOpacity
                style={[styles.centerButton, { backgroundColor: '#1f00ab' }]}
                onPress={() => nextDay()}
              >
                <Text style={styles.centerButtonText}>Geceye Geç</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  newsContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    color: '#eaeaea',
    fontSize: 24,
    fontWeight: 'bold',
    top: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  subHeader: {
    color: '#eaeaea',
    fontSize: 20,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 4,
    left: 20,
  },
  voteHeader: {
    color: '#eaeaea',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  scroll: {
    width: '100%',
    maxHeight: '90%',
    marginBottom: 8,
  },
  scrollContent: {
    alignItems: 'flex-start',
    paddingHorizontal: 5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  votingContainer: {
    flex: 1,
  },
  text: {
    color: '#eaeaea',
    fontSize: 20,
    marginVertical: 4,
    textAlign: 'center',
  },
  centerButtonText: {
    color: '#eaeaea',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
    textAlign: 'center',
  },
  newsText: {
    color: '#eaeaea',
    fontSize: 16,
    marginVertical: 4,
    textAlign: 'left',
  },
  voteText: {
    color: '#ff2525',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
    textAlign: 'center',
  },
  timeText: {
    color: '#eaeaea',
    fontSize: 30,
    marginVertical: 4,
    textAlign: 'center',
  },
  centerButton: {
    backgroundColor: '#c40000',
    padding: 8,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
    width: '60%',
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#eaeaea',
    fontSize: 16,
  },
  voteButton: {
    borderWidth: 3,
    borderColor: '#eaeaea',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    width: '90%',
    alignSelf: 'center',
  },
  selectedButton: {
    borderColor: 'blue',
  },
  discussionContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  fullWidthButton: {
    backgroundColor: '#6200ee',
    padding: 8,
    marginBottom: 10,
    borderRadius: 6,
    alignItems: 'center',
    width: '100%',
  },
  fullWidthButtonText: {
    color: '#eaeaea',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
    textAlign: 'left',
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTimeButton: {
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#444',
    borderRadius: 8,
  },
  addTimeText: {
    color: '#eaeaea',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MorningScreen;
