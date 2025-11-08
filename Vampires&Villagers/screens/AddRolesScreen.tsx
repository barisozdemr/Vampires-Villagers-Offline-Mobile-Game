import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeModules } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

const { MyModule } = NativeModules;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddRoles'>;

const VILLAGER_ROLES = ['köylü', 'doktor', 'avcı', 'bodyguard', 'dedektif'];
const VAMPIRE_ROLES = ['vampir'];

const AddRolesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  //const [totalPlayers, setTotalPlayers] = useState(0);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const count = await MyModule.getTotalPlayerCount();
      //setTotalPlayers(count);
      const initialRoles = ['vampir', ...Array(count - 1).fill('köylü')];
      setRoles(initialRoles);
    })();
  }, []);

  const updateRole = (newRole: string) => {
    if (selectedIndex === null) {return;}

    const currentRole = roles[selectedIndex];

    const vampireCount = roles.filter(r => r === 'vampir').length;
    //const villagerCount = roles.filter(r => VILLAGER_ROLES.includes(r)).length;
    //const independentCount = roles.filter(r => r === 'soytarı').length;

    // Yeni sayıları hesaplarken geçici olarak güncellenmiş rol listesini varsayalım
    const tempRoles = [...roles];
    tempRoles[selectedIndex] = newRole;

    const newVampireCount = tempRoles.filter(r => r === 'vampir').length;
    const newVillagerCount = tempRoles.filter(r => VILLAGER_ROLES.includes(r)).length;

    if ((newRole === 'vampir' ||  newRole === 'soytarı' ) && newVampireCount >= newVillagerCount) {
      Alert.alert('Hata', 'Vampir sayısı köylü sayısını geçemez veya eşit olamaz!');
      return;
    }

    if (currentRole === 'vampir' && vampireCount === 1 && newRole !== 'vampir') {
      Alert.alert('Hata', 'En az bir vampir olmalı!');
      return;
    }

    const temp = [...roles];
    temp[selectedIndex] = newRole;
    setRoles(temp);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'vampir':
        return '#c40000';
      case 'soytarı':
        return '#666'; // Koyu gri
      default:
        return '#059c00'; // Köylü veya diğerleri
    }
  };

const handleProceed = async () => {
    try {
        await MyModule.setRolesAndStartGame(roles);
        navigation.navigate('FirstNight');
    } catch (error) {
        console.error('Hata:', error);
    }
};

  // Satırları 3'lü gruplara ayır ve eksikse '' ile doldur
  const roleRows: string[][] = [];
  for (let i = 0; i < roles.length; i += 3) {
    const row = roles.slice(i, i + 3);
    while (row.length < 3) {row.push('');}
    roleRows.push(row);
  }

  return (
      <View style={styles.container}>
        <ScrollView style={styles.container}>
          <Text style={styles.title}>Mevcut Roller</Text>

          {roleRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.roleRow}>
              {row.map((role, idx) => {
                const realIndex = rowIndex * 3 + idx;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.roleSlot,
                      role === '' && styles.invisibleSlot,
                      role !== '' && { backgroundColor: getRoleColor(role) },
                      selectedIndex === realIndex && styles.selectedSlot,
                    ]}
                    onPress={() => role && setSelectedIndex(realIndex)}
                    disabled={role === ''}
                  >
                    <Text style={styles.roleSlotText}>{role}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          <View style={styles.separator} />

          <Text style={styles.title}>Rolleri Değiştir</Text>

          <Text style={styles.sectionTitle}>Vampir Rolleri:</Text>
          <View style={styles.buttonContainer}>
            {VAMPIRE_ROLES.map((role, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.roleButton}
                onPress={() => updateRole(role)}
              >
                <Text style={styles.roleText}>{role}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Köylü Rolleri:</Text>
          <View style={styles.buttonContainer}>
            {VILLAGER_ROLES.map((role, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.roleButton}
                onPress={() => updateRole(role)}
              >
                <Text style={styles.roleText}>{role}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Bağımsız Roller:</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.roleButton}
              onPress={() => updateRole('soytarı')}
            >
              <Text style={styles.roleText}>soytarı</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.startButton} onPress={handleProceed}>
          <Text style={styles.startButtonText}>Oyunu Başlat</Text>
        </TouchableOpacity>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#eaeaea',
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  roleSlot: {
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#eaeaea',
    paddingVertical: 15,
  },
  roleSlotText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  invisibleSlot: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  selectedSlot: {
    borderColor: 'blue',
    borderWidth: 3,
  },

  sectionTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#eaeaea',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  roleButton: {
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    margin: 4,
    backgroundColor: '#444',
    borderRadius: 6,
  },
  roleText: {
    color: '#eaeaea',
  },
  separator: {
    height: 1,
    backgroundColor: '#999',
    marginVertical: 16,
  },
  startButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddRolesScreen;
