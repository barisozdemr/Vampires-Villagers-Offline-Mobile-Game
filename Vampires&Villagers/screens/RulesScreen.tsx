import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const RulesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Kurallar</Text>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Buraya kuralları yazabilirsiniz */}
        <Text style={styles.ruleText}>1. Bu oyun, aynı ortamda bulunan bir arkadaş grubu tarafından telefon sırayla elden ele dolaştırılarak oynanır.</Text>
        <Text style={styles.ruleText}>2. Oyun başlamadan önce bir yönetici seçilmelidir.</Text>
        <Text style={styles.ruleText}>3. Her gece herkes sırayla rolününün gereksinimlerini yerine getirir.</Text>
        <Text style={styles.ruleText}>4. Gece neler olduğunu yönetici sabah herkese açıklar.</Text>
        <Text style={styles.ruleText}>5. Oyun sabah tartışma ve oylama ile devam eder.</Text>
        <Text style={styles.ruleText}>6. Kasaba isterse o sabah birisini oy çokluğu ile seçip öldürmek üzere asabilir.</Text>
        <Text style={styles.ruleText}>7. Vampirler gece vakti bir kurbanı öldürmek üzere seçerler ve onu öldürecek vampiri de seçerler.</Text>
        <Text style={styles.ruleText}>8. Vampirler oy çokluğuna erişemezse en çok oyu alanlardan birisi rastgele seçilir.</Text>
        <Text style={styles.ruleText}>9. Doktor her gece bir kişiyi tedavi eder, aynı kişiyi 2 gün boyunca üst üste tedavi edemez.</Text>
        <Text style={styles.ruleText}>
        10. Avcının 1 tane mermisi vardır ve gece isterse 1 kişiyi vurabilir.
        O gecenin sabahı kendisini açığa çıkarır ve bir köylüye dönüşür.
        </Text>
        <Text style={styles.ruleText}>
        11. Bodyguard her gece kendisi hariç birisini korur ve o gece onu öldürmeye gelen kişiyi öldürür.
        Bu kişi avcı da vampir de olabilir. Kendisi de bu süreçte ölür.
        </Text>
        <Text style={styles.ruleText}>12. Dedektif her gece bir kişiyi araştırır ve rolü hakkında fikir edinir.</Text>
        <Text style={styles.ruleText}>
        13. Soytarının tek amacı sabah kendini astırmaktır. Bunu başarırsa kazandı sayılır.
        Kendini astırdığı günün gecesi kasabadan intikamını almak üzere bir kişiyi öldürür.
        </Text>
        <Text style={styles.ruleText}>14. Doktorun tedavisi sadece kişiyi vampirler öldürürse işe yarar. Avcının mermisini ve bodyguardın korumasını tedavi edemez.</Text>
        <Text style={styles.ruleText}>15. Soytarının intikamını hiçbir şey durduramaz. İntikam aldığı kişiyi koruyan bütün bodyguardlar bile o kişiyle ölür.</Text>
        <Text style={styles.ruleText}>
        16. Bodyguard her gece ölmeden önce koruma görevini yerine getirir.
        Yani aynı gün koruduğu kişiyi birisi öldürmeye geldiyse ve aynı gün kendisi de ölecekse,
        önce koruduğu kişiyi öldürmeye gelen kişiyle beraber ölürler.
        </Text>
        {/* Daha fazla kural ekleyebilirsiniz */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  header: {
    fontSize: 32,
    color: '#eaeaea',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  content: {
    paddingBottom: 40,
  },
  ruleText: {
    fontSize: 18,
    color: '#eaeaea',
    marginBottom: 12,
    lineHeight: 24,
  },
});

export default RulesScreen;
