import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

/*
  PANTALLA SECUNDARIA: productos de una categoría.

 
    <ProductsScreen
      category={{ id, name, description }}   // la categoría que se tocó (de GET /categories)
      getProducts={getProducts}              // async (categoryId) => arreglo de GET /categories/{id}/products
      onBack={() => navigation.goBack()}     // cómo regresar a la pantalla principal
    />

  Cada producto debe tener: id, name, description, price, image_url.
*/

export default function ProductsScreen({ category, getProducts, onBack }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Se guarda en un ref para que, aunque getProducts llegue como función
  // nueva en cada render, no se vuelva a pedir la lista en un ciclo infinito.
  const getProductsRef = useRef(getProducts);
  getProductsRef.current = getProducts;

  const categoryId = category?.id;

  useEffect(() => {
    let isActive = true;

    async function loadProducts() {
      setIsLoading(true);
      setHasError(false);

      try {
        if (categoryId === undefined || categoryId === null) {
          throw new Error('ProductsScreen necesita category.id.');
        }
        const result = await getProductsRef.current(categoryId);
        if (!Array.isArray(result)) {
          throw new Error('getProducts debe devolver un arreglo.');
        }
        if (isActive) setProducts(result);
      } catch {
        if (isActive) setHasError(true);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadProducts();
    return () => {
      isActive = false;
    };
  }, [categoryId, reloadKey]);

  const showList = !isLoading && !hasError;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <FlatList
        data={showList ? products : []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ProductCard product={item} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Header
            category={category}
            onBack={onBack}
            total={showList ? products.length : null}
          />
        }
        ListEmptyComponent={
          <StateCard
            isLoading={isLoading}
            hasError={hasError}
            onRetry={() => setReloadKey((key) => key + 1)}
          />
        }
        ListFooterComponent={
          showList && products.length > 0 ? (
            <Text style={styles.footer}>Precios en pesos mexicanos (MXN)</Text>
          ) : null
        }
      />
    </View>
  );
}

function Header({ category, onBack, total }) {
  return (
    <View>
      <View style={styles.topBar}>
        <Pressable
          onPress={onBack}
          disabled={!onBack}
          hitSlop={10}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Regresar a categorías"
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Categorías</Text>
        </Pressable>
        <View style={styles.catalogBadge}>
          <View style={styles.catalogDot} />
          <Text style={styles.catalogBadgeText}>Catálogo</Text>
        </View>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroDecoration} />
        <View style={styles.heroDecorationSmall} />
        <Text style={styles.eyebrow}>CATEGORÍA</Text>
        <Text style={styles.title} numberOfLines={2}>
          {category?.name || 'Productos'}
        </Text>
        {category?.description ? (
          <Text style={styles.subtitle} numberOfLines={3}>
            {category.description}
          </Text>
        ) : null}
        {total !== null ? (
          <View style={styles.heroTag}>
            <Text style={styles.heroTagText}>
              {total} {total === 1 ? 'producto' : 'productos'}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Productos disponibles</Text>
        <Text style={styles.sectionSubtitle}>Selección de la categoría</Text>
      </View>
    </View>
  );
}

function ProductCard({ product }) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(product.image_url) && !imageFailed;

  return (
    <View style={styles.card}>
      {hasImage ? (
        <Image
          source={{ uri: product.image_url }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageFailed(true)}
          accessibilityLabel={`Imagen de ${product.name}`}
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.placeholderInitial}>
            {product.name?.slice(0, 1).toUpperCase() || '?'}
          </Text>
          <Text style={styles.placeholderText}>Imagen no disponible</Text>
        </View>
      )}

      <View style={styles.cardBody}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        {product.description ? (
          <Text style={styles.description} numberOfLines={3}>
            {product.description}
          </Text>
        ) : null}

        <View style={styles.cardFooter}>
          <View style={styles.pricePill}>
            <Text style={styles.priceText}>{formatPrice(product.price)}</Text>
          </View>
          <Text style={styles.currency}>MXN</Text>
        </View>
      </View>
    </View>
  );
}

function StateCard({ isLoading, hasError, onRetry }) {
  if (isLoading) {
    return (
      <View style={styles.stateCard}>
        <ActivityIndicator size="small" color="#294337" />
        <Text style={[styles.stateTitle, styles.stateTitleSpacing]}>
          Cargando productos
        </Text>
        <Text style={styles.stateText}>Un momento, por favor...</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateTitle}>No se pudieron cargar los productos</Text>
        <Text style={styles.stateText}>Revisa tu conexión e inténtalo de nuevo.</Text>
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          accessibilityRole="button"
        >
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.stateCard}>
      <Text style={styles.stateTitle}>Aún no hay productos</Text>
      <Text style={styles.stateText}>Esta categoría estará disponible pronto.</Text>
    </View>
  );
}

// 1299 -> "$1,299.00". Se hace a mano para no depender de Intl en Android.
function formatPrice(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';
  const [integer, decimals] = number.toFixed(2).split('.');
  return `$${integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${decimals}`;
}

/* ---------- Datos de prueba (borrar cuando ya esté conectada la API) ---------- */

const MOCK_PRODUCTS = [
  {
    id: 1,
    category_id: 1,
    name: 'Audífonos inalámbricos',
    description: 'Audífonos Bluetooth con estuche de carga.',
    price: 899.0,
    image_url: 'https://images.unsplash.com/photo-150tf1634-5f8c7c1f8f3b?w=800',
  },
  {
    id: 2,
    category_id: 1,
    name: 'Teclado mecánico',
    description: 'Teclado mecánico para trabajo y videojuegos.',
    price: 1299.0,
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
  },
  {
    id: 3,
    category_id: 1,
    name: 'Cámara digital',
    description: 'Cámara compacta para fotografía cotidiana.',
    price: 5499.0,
    image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
  },
];

export const MOCK_CATEGORY = {
  id: 1,
  name: 'Tecnología',
  description: 'Dispositivos y accesorios tecnológicos.',
};

export async function mockGetProducts(categoryId) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return MOCK_PRODUCTS.filter((product) => product.category_id === categoryId);
}

/* ---------- Estilos (misma paleta que App.js y CategoryGrid.js) ---------- */

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
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#ECEDE7',
  },
  backArrow: {
    color: '#294337',
    fontSize: 15,
    fontWeight: '800',
    marginRight: 7,
  },
  backText: {
    color: '#26352B',
    fontSize: 12,
    fontWeight: '700',
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
    paddingBottom: 22,
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
  heroDecorationSmall: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    right: 40,
    bottom: -38,
    backgroundColor: '#355141',
    opacity: 0.7,
  },
  eyebrow: {
    color: '#BFD0BD',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.7,
    marginBottom: 11,
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
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 18,
  },
  heroTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#25332A',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    color: '#838A80',
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(32, 40, 31, 0.06)',
    shadowColor: '#24372B',
    shadowOpacity: 0.06,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 190,
    backgroundColor: '#E8EDE5',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderInitial: {
    color: '#3C5742',
    fontSize: 34,
    fontWeight: '800',
  },
  placeholderText: {
    color: '#7D8A78',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  cardBody: {
    padding: 17,
  },
  name: {
    color: '#20281F',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },
  description: {
    color: '#687267',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(32, 40, 31, 0.12)',
    marginTop: 14,
    paddingTop: 12,
  },
  pricePill: {
    backgroundColor: '#294337',
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  currency: {
    color: '#8B9289',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  stateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E8EAE3',
    padding: 22,
    alignItems: 'center',
  },
  stateTitle: {
    color: '#26352B',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  stateTitleSpacing: {
    marginTop: 12,
  },
  stateText: {
    color: '#81877E',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
  },
  retryButton: {
    backgroundColor: '#294337',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 14,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    color: '#9A9F96',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
});
