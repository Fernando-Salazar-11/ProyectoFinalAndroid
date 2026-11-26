import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import CategoryGrid from './CategoryGrid';

/* 
ESTE MAPA SOLO ES TEMPORAL. ENCARGAGO DE CONCETAR CON LA API
FAVOR DE ELIMINAR ESTE MAPA Y OBTENER LAS CATEGORIAS DESDE LA API
*/
const categories = [
  { name: 'Tecnología', color: '#E8F0FF', count: '128 productos' },
  { name: 'Hogar', color: '#FCEBDD', count: '86 productos' },
  { name: 'Libros', color: '#F2EAFE', count: '214 productos' },
  { name: 'Moda', color: '#FCE8EC', count: '156 productos' },
  { name: 'Deportes', color: '#E4F3E9', count: '93 productos' },
  { name: 'Películas', color: '#FFF2D8', count: '64 productos' },
];

// La persona que conecte la API puede reemplazar este cuerpo por GET /categories.
// Debe devolver un arreglo de categorías.
async function getCategories() {
  return categories;
}

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.brandCopy}>
            <Text style={styles.brandName}>TIENDA</Text>
            <Text style={styles.brandCaption}>CATÁLOGO DIGITAL</Text>
          </View>
          <View style={styles.catalogBadge}>
            <View style={styles.catalogDot} />
            <Text style={styles.catalogBadgeText}>Catálogo</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroDecoration} />
          <Text style={styles.title}>Encuentra tus favoritos</Text>
        </View>

        <CategoryGrid getCategories={getCategories} />

        <Text style={styles.footer}>Una selección para cada momento</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 52,
    paddingBottom: 34,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#274236',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandInitial: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },
  brandCopy: {
    flex: 1,
    marginLeft: 11,
  },
  brandName: {
    color: '#26352B',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  brandCaption: {
    color: '#8B9289',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 4,
  },
  catalogBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#ECEDE7',
  },
  catalogDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#7A9A73',
    marginRight: 7,
  },
  catalogBadgeText: {
    color: '#596B56',
    fontSize: 11,
    fontWeight: '700',
  },
  hero: {
    backgroundColor: '#294337',
    borderRadius: 28,
    paddingHorizontal: 23,
    paddingTop: 23,
    paddingBottom: 20,
    marginBottom: 30,
    overflow: 'hidden',
  },
  heroDecoration: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    right: -48,
    top: -56,
    backgroundColor: '#3C5949',
    opacity: 0.8,
  },
  eyebrow: {
    color: '#BFD0BD',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.7,
    marginBottom: 13,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '800',
    maxWidth: 270,
  },
  subtitle: {
    color: '#D7E0D5',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
    maxWidth: 280,
  },
  heroTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 19,
  },
  heroTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  heroTagArrow: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    color: '#9A9F96',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
});
