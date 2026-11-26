import { StyleSheet, View } from 'react-native';
import CategoryItem from './CategoryItem';

export default function CategoryGrid({ categories }) {
  return (
    <View style={styles.categoryGrid}>
      {categories.map((category) => (
        <CategoryItem key={category.name} category={category} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
