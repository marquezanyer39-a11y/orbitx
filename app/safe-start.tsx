import { router } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function SafeStartScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>QVEX SAFE START</Text>
      <Text style={styles.subtitle}>La app abrió correctamente.</Text>
      <Pressable style={styles.button} onPress={() => router.push('/')}>
        <Text style={styles.buttonText}>Ir a inicio QVEX</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1220', // QVEX Panel Dark
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: '#00E5FF', // QVEX Primary
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    color: '#F8FBFF',
    fontSize: 18,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  buttonText: {
    color: '#0D1220',
    fontSize: 16,
    fontWeight: '600',
  },
});
