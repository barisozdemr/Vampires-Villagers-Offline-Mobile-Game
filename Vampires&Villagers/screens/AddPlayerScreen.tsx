import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeModules } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

const { MyModule } = NativeModules;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddPlayer'>;

const AddPlayerScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState<string[]>([]);

  const handleAddPlayer = () => {
    const trimmed = playerName.trim();
    if (trimmed && !players.includes(trimmed)) {
      setPlayers(prev => [...prev, trimmed]);
      setPlayerName('');
    }
  };

  const handleRemovePlayer = (index: number) => {
    setPlayers(prev => prev.filter((_, i) => i !== index));
  };

  const handleProceed = () => {
    MyModule.setPlayers(players);
    navigation.navigate('AddRoles');
  };

  // split into rows of 3
  const rows: string[][] = [];
  for (let i = 0; i < players.length; i += 3) {
    rows.push(players.slice(i, i + 3));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Oyuncu Ekle</Text>

      <TextInput
        style={styles.input}
        placeholder="Oyuncu ismi"
        value={playerName}
        onChangeText={setPlayerName}
      />

      <Button color='#444' title="Ekle" onPress={handleAddPlayer} />

      <Text style={styles.subtitle}>Eklenen Oyuncular</Text>
      <ScrollView style={styles.rowsContainer}>
        {rows.map((row, rowIndex) => {
          // ensure each row has exactly 3 items by padding with empty strings
          const fullRow = [...row];
          while (fullRow.length < 3) {
            fullRow.push('');
          }

          return (
            <View key={rowIndex} style={styles.row}>
              {fullRow.map((name, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.playerCell,
                    name === '' && styles.invisibleCell,
                  ]}
                  onPress={() => {
                    if (name !== '') {handleRemovePlayer(rowIndex * 3 + idx);}
                  }}
                  disabled={name === ''}
                >
                  <Text style={styles.playerText}>{name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.nextButton} onPress={handleProceed}>
        <Text style={styles.nextButtonText}>Rolleri Seç</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#eaeaea',
  },
  subtitle: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
    color: '#eaeaea',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    color: '#eaeaea',
  },
  rowsContainer: {
    flex: 1,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  playerCell: {
    width: '30%',
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 15,
  },
  invisibleCell: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  playerText: {
    fontSize: 14,
    color: '#eaeaea',
  },
  nextButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddPlayerScreen;
