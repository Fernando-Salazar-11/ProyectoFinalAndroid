import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function CategoryGrid({
  getCategories,
  apiUrl,
  reloadKey,
  onSelectCategory,
}) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    let isActive = true;

    if (!apiUrl) {
      setCategories([]);
      setHasError(false);
      setIsLoading(false);
      return () => {
        isActive = false;
      };
    }

    async function loadCategories() {
      setIsLoading(true);
      setHasError(false);

      try {
        const result = await getCategories(apiUrl);
        if (!Array.isArray(result)) {
          throw new Error('getCategories debe devolver un arreglo.');
        }
        if (isActive) setCategories(result);
      } catch {
        if (isActive) setHasError(true);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadCategories();
    return () => {
      isActive = false;
    };
  }, [getCategories, apiUrl, reloadKey]);

  if (!apiUrl) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateTitle}>Ingresa la URL de la API</Text>
        <Text style={styles.stateText}>
          Usa la IP de tu computadora y el puerto donde está ejecutándose el servidor.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.stateCard}>
        <View style={styles.loadingMark} />
        <Text style={styles.stateTitle}>Preparando el catálogo</Text>
        <Text style={styles.stateText}>Cargando categorías...</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateTitle}>No se pudo cargar el catálogo</Text>
        <Text style={styles.stateText}>Inténtalo de nuevo en un momento.</Text>
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateTitle}>Aún no hay categorías</Text>
        <Text style={styles.stateText}>Vuelve pronto para descubrir novedades.</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionCopy}>
          <Text style={styles.sectionTitle}>Explora categorías</Text>
          <Text style={styles.sectionSubtitle}>Encuentra algo para ti</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalValue}>{categories.length}</Text>
          <Text style={styles.totalLabel}>opciones</Text>
        </View>
      </View>

      <View style={styles.categoryGrid}>
        {categories.map((category) => {
          const categoryKey = category.id ?? category.name;
          const imageVisible = expandedCategory === categoryKey;
          const hasImage = Boolean(category.image_url);
          const canSelect = typeof onSelectCategory === 'function';
          const isInteractive = canSelect || hasImage;

          const toggleImage = () => {
            if (!hasImage) return;
            setExpandedCategory(imageVisible ? null : categoryKey);
          };

          const handleCardPress = () => {
            if (canSelect) {
              onSelectCategory(category);
            } else {
              toggleImage();
            }
          };

          return (
            <Pressable
              key={categoryKey}
              disabled={!isInteractive}
              onPress={handleCardPress}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: category.color || '#E8F0FF' },
                pressed && isInteractive && styles.cardPressed,
              ]}
              accessibilityRole={isInteractive ? 'button' : undefined}
              accessibilityLabel={
                canSelect
                  ? `Ver productos de ${category.name}`
                  : hasImage
                    ? `${category.name}. Toca para ${imageVisible ? 'ocultar' : 'ver'} la imagen.`
                    : category.name
              }
            >
              <View style={styles.cardTop}>
                <View style={styles.initialBadge}>
                  <Text style={styles.initial}>
                    {category.name?.slice(0, 1).toUpperCase() || '?'}
                  </Text>
                </View>
                {hasImage ? (
                  <Pressable
                    hitSlop={8}
                    onPress={(e) => {
                      if (canSelect) e.stopPropagation();
                      toggleImage();
                    }}
                    style={({ pressed }) => [
                      styles.actionBadge,
                      pressed && styles.cardPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`${imageVisible ? 'Ocultar' : 'Ver'} imagen de ${category.name}`}
                  >
                    <Text style={styles.actionIcon}>{imageVisible ? '−' : '↗'}</Text>
                  </Pressable>
                ) : null}
              </View>

              <Text style={styles.name} numberOfLines={2}>
                {category.name}
              </Text>
              <Text style={styles.description} numberOfLines={2}>
                {category.count || category.description || 'Descubre la colección'}
              </Text>

              {imageVisible ? (
                <Image
                  source={{ uri: category.image_url }}
                  style={styles.image}
                  resizeMode="cover"
                  accessibilityLabel={`Imagen de ${category.name}`}
                />
              ) : null}

              <View style={styles.cardFooter}>
                <Text style={styles.cardHint}>
                  {canSelect
                    ? 'Toca para ver productos'
                    : hasImage
                      ? imageVisible
                        ? 'Ocultar imagen'
                        : 'Toca para ver imagen'
                      : 'Categoría destacada'}
                </Text>
                <Text style={styles.footerArrow}>{canSelect || hasImage ? '→' : '•'}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionCopy: {
    flex: 1,
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
  totalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EDE5',
    borderRadius: 15,
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginLeft: 12,
  },
  totalValue: {
    color: '#3C5742',
    fontSize: 12,
    fontWeight: '800',
    marginRight: 5,
  },
  totalLabel: {
    color: '#64735E',
    fontSize: 10,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E8EAE3',
    padding: 22,
    alignItems: 'center',
  },
  loadingMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCE8D9',
    marginBottom: 12,
  },
  stateTitle: {
    color: '#26352B',
    fontSize: 15,
    fontWeight: '700',
  },
  stateText: {
    color: '#81877E',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
  },
  card: {
    width: '48%',
    minHeight: 184,
    borderRadius: 23,
    padding: 15,
    marginBottom: 14,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(32, 40, 31, 0.06)',
    shadowColor: '#24372B',
    shadowOpacity: 0.06,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  initialBadge: {
    width: 39,
    height: 39,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: '#354432',
    fontSize: 16,
    fontWeight: '800',
  },
  actionBadge: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    color: '#465442',
    fontSize: 15,
    fontWeight: '700',
  },
  name: {
    color: '#20281F',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    marginBottom: 5,
  },
  description: {
    color: '#687267',
    fontSize: 11,
    lineHeight: 16,
    minHeight: 32,
  },
  image: {
    width: '100%',
    height: 108,
    borderRadius: 14,
    marginTop: 13,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(32, 40, 31, 0.12)',
    marginTop: 14,
    paddingTop: 10,
  },
  cardHint: {
    color: '#687563',
    fontSize: 10,
    fontWeight: '700',
  },
  footerArrow: {
    color: '#536B51',
    fontSize: 13,
    fontWeight: '700',
  },
});