import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import CategoryGrid from './CategoryGrid';

const categories = [
  { name: 'Tecnología', color: '#E8F0FF', count: '128 productos' },
  { name: 'Hogar', color: '#FCEBDD', count: '86 productos' },
  { name: 'Libros', color: '#F2EAFE', count: '214 productos' },
  { name: 'Moda', color: '#FCE8EC', count: '156 productos' },
  { name: 'Deportes', color: '#E4F3E9', count: '93 productos' },
  { name: 'Películas', color: '#FFF2D8', count: '64 productos' },
];

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Tienda</Text>
        <Text style={styles.title}>Categorías</Text>
      </View>

      <CategoryGrid categories={categories} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 22,
    paddingTop: 54,
  },
  header: {
    marginBottom: 22,
  },
  eyebrow: {
    color: '#64735E',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    color: '#20281F',
    fontSize: 27,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: '#777C74',
    fontSize: 14,
  },
});
