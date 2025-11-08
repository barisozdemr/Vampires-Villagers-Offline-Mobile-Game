import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  BackHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeModules } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RoleDoing'>;

type GameMap = { [player: string]: string };
type RoleActionsMap = { [action: string]: [string, string][] };

const { MyModule } = NativeModules as {
  MyModule: {
    getGameMap(): Promise<GameMap>;
    getOrderedPlayers(): Promise<string[]>;
    setRoleActions(actions: RoleActionsMap): void;
    getRoleActions(): Promise<RoleActionsMap>;
  };
};

const RoleDoingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [gameMap, setGameMap] = useState<GameMap>({});
  const [playerOrder, setPlayerOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [previousActions, setPreviousActions] = useState<RoleActionsMap>({});

  const [currentIndex, setCurrentIndex] = useState(0);
  const [roleActions, setRoleActions] = useState<RoleActionsMap>({});
  const [showRole, setShowRole] = useState(false); // Yeni state: Rol görüntüleme durumu

  const [revengePlayer, setRevengePlayer] = useState<string | null>(null);
  const [revengeTarget, setRevengeTarget] = useState<string | null>(null);
  const [revengeDone, setRevengeDone] = useState(false);

  const [vampireVictim, setVampireVictim] = useState<string | null>(null);
  const [vampireKiller, setVampireKiller] = useState<string | null>(null);

  const [killVotes, setKillVotes] = useState<Record<string, number>>({});
  const [killerVotes, setKillerVotes] = useState<Record<string, number>>({});

  const [mathQuestions, setMathQuestions] = useState<
    { a: number;
      b: number;
      answer: number;
      choices: number[] }[]
  >([]);
  const [mathSelected, setMathSelected] = useState<(number | null)[]>([]);

  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  const [detectiveTarget, setDetectiveTarget] = useState<string | null>(null);
  const [detectiveInspected, setDetectiveInspected] = useState<boolean>(false);
  const [detectiveResult, setDetectiveResult] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const map = await MyModule.getGameMap();
        const ordered = await MyModule.getOrderedPlayers();

        // remove jester from normal processing
        const jester = ordered.find(p => map[p] === 'revenge') || null;

        if (jester) {
          setRevengePlayer(jester);
        }

        const pruned = { ...map };
        if (jester) {
          delete pruned[jester];
        }

        // filter ordered by pruned map
        const filteredOrder = ordered.filter(p => pruned.hasOwnProperty(p));

        setGameMap(pruned);
        setPlayerOrder(filteredOrder);

      } catch (err) {
        if (__DEV__) {
          console.error('fetchData error:', err);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    MyModule.getRoleActions()
      .then((actions: RoleActionsMap) => {
        setPreviousActions(actions);
      })
      .catch(err => {
        if (__DEV__) {
          console.error('getRoleActions error:', err);
        }
      });
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true
    );
    return () => backHandler.remove();
  }, []);

  const generateMathQuestions = () => {
    const generateSingle = () => {
      const a = Math.floor(Math.random() * 90) + 10;
      const b = Math.floor(Math.random() * 90) + 10;
      const answer = a + b;
      const choices = new Set<number>([answer]);
      while (choices.size < 5) {
        const fake = answer + (Math.floor(Math.random() * 21) - 10);
        if (fake !== answer && fake > 0) choices.add(fake);
      }
      const choicesArray = Array.from(choices).sort(() => 0.5 - Math.random());
      return { a, b, answer, choices: choicesArray };
    };

    const q1 = generateSingle();
    const q2 = generateSingle();
    setMathQuestions([q1, q2]);
    setMathSelected([null, null]);
  };

  useEffect(() => {
    setShowRole(false);
    setVampireVictim(null);
    setVampireKiller(null);
    setMathSelected([]);
    setSelectedTarget(null);
    setDetectiveTarget(null);
    setDetectiveInspected(false);
    setDetectiveResult(null);

    // generate questions if needed
    const role = gameMap[playerOrder[currentIndex]];

    if (role === 'köylü' || role === 'soytarı') {
      generateMathQuestions();
    }

  }, [currentIndex, gameMap]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#eaeaea" />
      </View>
    );
  }

  // 1.1) Normal roller için hazırlık ekranı (ROLÜ GÖR butonlu)
  if (
    currentIndex < playerOrder.length &&
    !showRole // Rol henüz gösterilmediyse
  ) {
    const player = playerOrder[currentIndex];
    return (
      <View style={styles.container}>
        <Text style={styles.headerText}>{player}</Text>
        <Text style={styles.subHeader}>
          Telefonu <Text style={styles.highlight}>{player}</Text> adlı oyuncuya verin
        </Text>
        <Pressable
          style={styles.revealButton}
          onPress={() => setShowRole(true)}
        >
          <Text style={styles.revealButtonText}>!!  ROLÜ GÖR  !!</Text>
        </Pressable>
      </View>
    );
  }

  // 1.2) İntikam aşaması
  if (
    currentIndex >= playerOrder.length &&
    !!revengePlayer &&
    !revengeDone
  ) {
    const alivePlayers = [...playerOrder];
    return (
      <View style={styles.container}>
        <Text style={styles.headerText}>{'\n'+revengePlayer}</Text>
        <Text style={styles.headerText}>------------</Text>
        <Text style={styles.headerText}>{'Soytarı\n'}</Text>
        <Text style={styles.headerText}>
          <Text style={{ color: '#c40000' }}>İntikamını</Text> Al!
        </Text>

        <View style={styles.content}>
          <View style={styles.buttonGrid}>
            {alivePlayers.map(p => (
              <Pressable
                key={`revenge-${p}`}
                style={[
                  styles.playerButton,
                  revengeTarget === p && styles.selectedButton,
                ]}
                onPress={() => setRevengeTarget(p)}
              >
                <Text style={styles.buttonText}>{p}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Pressable
          style={[
            styles.killButton,
            !revengeTarget && styles.proceedDisabled,
          ]}
          disabled={!revengeTarget}
          onPress={() => {
            const copy = { ...roleActions };
            if (!copy['revenge']) {
              copy['revenge'] = [];
            }
            copy['revenge'].push([revengePlayer, revengeTarget!]);
            setRoleActions(copy);
            setRevengeDone(true);
          }}
        >
          <Text style={styles.proceedButtonText}>İntikamını Al</Text>
        </Pressable>
      </View>
    );
  }

  // 2) Final ekranı
  if (currentIndex >= playerOrder.length && (revengeDone || !revengePlayer)) {
    const handleFinish = () => {
      MyModule.setRoleActions(roleActions);
      navigation.navigate('Morning');
    };
    return (
      <View style={styles.container}>
        <Text style={styles.finishText}>
          Telefonu <Text style={styles.highlight}>Yönetici</Text>'ye verin
        </Text>
        <Pressable style={styles.finalButton} onPress={handleFinish}>
          <Text style={styles.finalButtonText}>SABAHA GEÇ</Text>
        </Pressable>
      </View>
    );
  }

  // 3) Normal rollerin rol ekranı
  const player = playerOrder[currentIndex];
  const role = gameMap[player];
  const vampires = playerOrder.filter(p => gameMap[p] === 'vampir');
  const others = playerOrder.filter(p => p !== player);

  const getCanProceed = (): boolean => {
    switch (role) {
      case 'vampir':
        return !!vampireVictim && !!vampireKiller;
      case 'soytarı':
      case 'köylü':
        return (
          mathQuestions.length === 2 &&
          Array.isArray(mathSelected) &&
          mathSelected.length === 2 &&
          mathQuestions.every((q, i) => mathSelected[i] === q.answer)
        );
      case 'doktor':
      case 'bodyguard':
      case 'avcı':
        return !!selectedTarget;
      case 'dedektif':
        return detectiveInspected;
      default:
        return true;
    }
  };

  const canProceed = getCanProceed();

  const handleProceed = () => {
    const actionsCopy: RoleActionsMap = { ...roleActions };

    switch (role) {
      case 'vampir':
        if (!actionsCopy['kill']) actionsCopy['kill'] = [];
        actionsCopy['kill'].push([player, vampireVictim!]);
        if (!actionsCopy['killer']) actionsCopy['killer'] = [];
        actionsCopy['killer'].push([player, vampireKiller!]);
        break;
      case 'doktor':
        if (!actionsCopy['heal']) actionsCopy['heal'] = [];
        actionsCopy['heal'].push([player, selectedTarget!]);
        break;
      case 'avcı':
        if(!selectedTarget) break;
        if (!actionsCopy['shoot']) actionsCopy['shoot'] = [];
        actionsCopy['shoot'].push([player, selectedTarget!]);
        break;
      case 'bodyguard':
        if (!actionsCopy['guard']) actionsCopy['guard'] = [];
        actionsCopy['guard'].push([player, selectedTarget!]);
        break;
      case 'dedektif':
        if (!actionsCopy['investigate']) actionsCopy['investigate'] = [];
        actionsCopy['investigate'].push([player, detectiveTarget!]);
        break;
      default:
        break;
    }

    setRoleActions(actionsCopy);

    setShowRole(false);
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 50);
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'vampir': return '#c40000';
      case 'soytarı': return '#666';
      default: return '#059c00';
    }
  };

  const renderRoleUI = () => {
    switch (role) {
      case 'vampir':
        return (
          <>
            <Text style={styles.sectionTitle}>Öldürülecek kişiyi seçin:</Text>
            <View style={styles.buttonGrid}>
              {others.map(p => {
                const isVampire = gameMap[p] === 'vampir';
                const count = killVotes[p] || 0;
                return (
                  <Pressable
                    key={`victim-${p}`}
                    style={[
                      styles.playerButton,
                      isVampire && styles.disabledKillButton,
                      vampireVictim === p && styles.selectedButton,
                    ]}
                    disabled={isVampire}
                    onPress={() => {
                      // 1) Önceki seçimi geri al
                      if (vampireVictim && killVotes[vampireVictim]) {
                        setKillVotes(kv => ({ ...kv, [vampireVictim]: kv[vampireVictim]! - 1 }));
                      }
                      // 2) Yeni oyu ekle
                      setVampireVictim(p);
                      setKillVotes(kv => ({ ...kv, [p]: (kv[p] || 0) + 1 }));
                    }}
                  >
                    <Text style={styles.buttonText}>
                      {p} <Text style={{ color:'#c40000' }}>{isVampire ? '' : count}</Text>
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.sectionTitle}>Öldürmeye gidecek vampiri seçin:</Text>
            <View style={styles.buttonGrid}>
              {vampires.map(p => {
                const count = killerVotes[p] || 0;
                return (
                  <Pressable
                    key={`killer-${p}`}
                    style={[
                      styles.playerButton,
                      vampireKiller === p && styles.selectedButton,
                    ]}
                    onPress={() => {
                      if (vampireKiller && killerVotes[vampireKiller]) {
                        setKillerVotes(kv => ({ ...kv, [vampireKiller]: kv[vampireKiller]! - 1 }));
                      }
                      setVampireKiller(p);
                      setKillerVotes(kv => ({ ...kv, [p]: (kv[p] || 0) + 1 }));
                    }}
                  >
                    <Text style={styles.buttonText}>
                      {p} <Text style={{ color:'#c40000' }}>{count}</Text>
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        );
      case 'soytarı':
      case 'köylü':
        if (mathQuestions.length !== 2) return null;
        return (
          <>
            {mathQuestions.map((q, index) => (
              <View key={`q-${index}`} style={{ marginBottom: 20 }}>
                <Text style={styles.sectionTitle}>
                  {q.a} + {q.b} = ?
                </Text>
                <View style={styles.buttonGrid}>
                  {q.choices.map(num => (
                    <Pressable
                      key={`choice-${index}-${num}`}
                      style={[
                        styles.playerButton,
                        mathSelected[index] === num && styles.selectedButton,
                      ]}
                      onPress={() => {
                        const copy = [...mathSelected];
                        copy[index] = num;
                        setMathSelected(copy);
                      }}
                    >
                      <Text style={styles.buttonText}>{num}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </>
        );
      case 'doktor':
        const prevHealed = previousActions.heal?.map(pair => pair[1]) || [];

        return (
          <>
            <Text style={styles.sectionTitle}>Tedavi edeceğin kişiyi seç:</Text>
            <View style={styles.buttonGrid}>
              {playerOrder.map(p => {
                const alreadyHealed = prevHealed.includes(p);
                return (
                  <Pressable
                    key={`heal-${p}`}
                    style={[
                      styles.playerButton,
                      selectedTarget === p && styles.selectedButton,
                      alreadyHealed && styles.disabledHealButton,
                    ]}
                    onPress={() => !alreadyHealed && setSelectedTarget(p)}
                    disabled={alreadyHealed}
                  >
                    <Text style={styles.buttonText}>{p}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        );
      case 'avcı':
        return (
          <>
            <Text style={styles.sectionTitle}>Vuracağın kişiyi seç:</Text>
            <View style={styles.buttonGrid}>
              {others.map(p => (
                <Pressable
                  key={`shoot-${p}`}
                  style={[
                    styles.playerButton,
                    selectedTarget === p && styles.selectedButton,
                  ]}
                  onPress={() => setSelectedTarget(prev => (prev === p ? null : p))}
                >
                  <Text style={styles.buttonText}>{p}</Text>
                </Pressable>
              ))}
            </View>
          </>
        );
      case 'bodyguard':
        return (
          <>
            <Text style={styles.sectionTitle}>Koruyacağın kişiyi seç:</Text>
            <View style={styles.buttonGrid}>
              {others.map(p => (
                <Pressable
                  key={`guard-${p}`}
                  style={[
                    styles.playerButton,
                    selectedTarget === p && styles.selectedButton,
                  ]}
                  onPress={() => setSelectedTarget(p)}
                >
                  <Text style={styles.buttonText}>{p}</Text>
                </Pressable>
              ))}
            </View>
          </>
        );
      case 'dedektif':
        return (
          <>
            <Text style={styles.sectionTitle}>İncelemek için bir kişi seç:</Text>
            <View style={styles.buttonGrid}>
              {others.map(p => (
                <Pressable
                  key={`investigate-${p}`}
                  style={[
                    styles.playerButton,
                    detectiveTarget === p && styles.selectedButton,
                  ]}
                  onPress={() => setDetectiveTarget(p)}
                >
                  <Text style={styles.buttonText}>{p}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              style={[
                styles.inspectButton,
                detectiveInspected && styles.inspectedButton,
              ]}
              disabled={!detectiveTarget || detectiveInspected}
              onPress={() => {
                const roleOfTarget = gameMap[detectiveTarget!];
                const resultText = ['vampir', 'avcı', 'soytarı'].includes(roleOfTarget)
                  ? detectiveTarget + ':\nVampir, Avcı veya Soytarı'
                  : detectiveTarget + ':\nKöylü, Doktor, Bodyguard veya Dedektif';
                setDetectiveResult(resultText);
                setDetectiveInspected(true);
              }}
            >
              <Text style={styles.inspectButtonText}>
                {detectiveInspected ? detectiveResult || '-' : 'İncele'}
              </Text>
            </Pressable>
          </>
        );
      default:
        return null;
    }
  };

  const renderRoleProceedButton = () =>{
    switch(role){
      case 'vampir':
        return(
          <Pressable
            style={[styles.killButton, !canProceed && styles.proceedDisabled]}
            disabled={!canProceed}
            onPress={handleProceed}
          >
            <Text style={styles.proceedButtonText}>Öldür</Text>
          </Pressable>
        )
      case 'köylü':
        return(
          <Pressable
            style={[styles.proceedButton, !canProceed && styles.proceedDisabled]}
            disabled={!canProceed}
            onPress={handleProceed}
          >
            <Text style={styles.proceedButtonText}>İlerle</Text>
          </Pressable>
        )
      case 'doktor':
        return(
          <Pressable
            style={[styles.proceedButton, !canProceed && styles.proceedDisabled]}
            disabled={!canProceed}
            onPress={handleProceed}
          >
            <Text style={styles.proceedButtonText}>Tedavi Et</Text>
          </Pressable>
        )
      case 'avcı':
        return(
          <Pressable
            style={[
              styles.proceedButton,
              canProceed && styles.killButton,
            ]}
            onPress={handleProceed}
          >
            <Text style={styles.proceedButtonText}>
            {canProceed ? 'Avla!' : 'Ateş etme'}
            </Text>
          </Pressable>
        )
      case 'bodyguard':
        return(
          <Pressable
            style={[styles.proceedButton, !canProceed && styles.proceedDisabled]}
            disabled={!canProceed}
            onPress={handleProceed}
          >
            <Text style={styles.proceedButtonText}>Koru</Text>
          </Pressable>
        )
      case 'dedektif':
        return(
          <Pressable
            style={[styles.proceedButton, !canProceed && styles.proceedDisabled]}
            disabled={!canProceed}
            onPress={handleProceed}
          >
            <Text style={styles.proceedButtonText}>İlerle</Text>
          </Pressable>
        )
      case 'soytarı':
        return(
          <Pressable
            style={[styles.proceedButton, !canProceed && styles.proceedDisabled]}
            disabled={!canProceed}
            onPress={handleProceed}
          >
            <Text style={styles.proceedButtonText}>İlerle</Text>
          </Pressable>
        )
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>{player}</Text>
      <Text style={styles.headerText}>----------------</Text>
      <Text style={[styles.roleText, { color: getRoleColor(role) }]}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Text>

      <View style={styles.content}>{renderRoleUI()}</View>

      {renderRoleProceedButton()}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 16,
    paddingTop: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 30,
    color: '#eaeaea',
    fontWeight: 'bold',
  },
  subHeader: {
    color: '#eaeaea',
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 8,
    textAlign: 'center',
  },
  roleText: {
    fontSize: 28,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#eaeaea',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  playerButton: {
    borderWidth: 3,
    borderColor: '#eaeaea',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    margin: 5,
  },
  selectedButton: {
    borderColor: 'blue',
  },
  disabledKillButton: {
    borderColor: '#c40000',
  },
  disabledHealButton: {
    borderColor: '#444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  inspectButton: {
    backgroundColor: 'green',
    paddingVertical: 15,
    paddingHorizontal: 45,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#eaeaea',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  inspectedButton: {
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#eaeaea',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  inspectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  proceedButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 14,
    position: 'absolute',
    alignItems: 'center',
    borderRadius: 8,
    bottom: 20,
    left: 16,
    right: 16,
  },
  killButton: {
    backgroundColor: '#c40000',
    paddingVertical: 14,
    position: 'absolute',
    alignItems: 'center',
    borderRadius: 8,
    bottom: 20,
    left: 16,
    right: 16,
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  proceedDisabled: {
    backgroundColor: '#444',
  },
  finishText: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#eaeaea',
  },
  finalButton: {
    backgroundColor: '#ff8f00',
    paddingVertical: 8,
    paddingHorizontal: 40,
    borderRadius: 2,
    width: '%80',
  },
  finalButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Yeni eklenen stiller
  revealButton: {
    backgroundColor: '#c40000',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 30,
    marginBottom: 40,
  },
  revealButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RoleDoingScreen;