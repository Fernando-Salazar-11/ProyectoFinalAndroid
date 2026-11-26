import { StyleSheet, Text, View } from 'react-native';

export default function CategoryItem({ category }) {
  return (
    <View style={[styles.card, { backgroundColor: category.color }]}>
      <Text style={styles.name}>{category.name}</Text>
      <Text style={styles.count}>{category.count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    minHeight: 128,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    justifyContent: 'center',
  },
  name: {
    color: '#20281F',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  count: {
    color: '#777C74',
    fontSize: 12,
  },
});
