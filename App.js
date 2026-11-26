import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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

// La persona que conecte la API puede usar apiUrl para consultar GET /categories.
// La función debe devolver un arreglo de categorías.
async function getCategories(apiUrl) {
  void apiUrl;
  return categories;
}

export default function App() {
  const [urlInput, setUrlInput] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const applyApiUrl = () => {
    const normalizedUrl = urlInput.trim().replace(/\/+$/, '');

    if (!/^https?:\/\/[^/\s?#]+$/i.test(normalizedUrl)) {
      setUrlError('Ingresa la URL base, por ejemplo http://192.168.1.20:8000.');
      return;
    }

    if (/localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(normalizedUrl)) {
      setUrlError('En el teléfono, usa la IPv4 de tu computadora, no localhost ni 0.0.0.0.');
      return;
    }

    setUrlError('');
    setUrlInput(normalizedUrl);
    setApiUrl(normalizedUrl);
    setReloadKey((key) => key + 1);
  };

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

        <View style={styles.connectionCard}>
          <View style={styles.connectionHeader}>
            <View style={styles.connectionIcon}>
              <Text style={styles.connectionIconText}>↗</Text>
            </View>
            <View style={styles.connectionTitleGroup}>
              <Text style={styles.connectionTitle}>URL de la API</Text>
              <Text style={styles.connectionSubtitle}>IP y puerto del servidor</Text>
            </View>
            <View style={styles.connectionStep}>
              <Text style={styles.connectionStepText}>URL</Text>
            </View>
          </View>

          <Text style={styles.connectionDescription}>
            Ingresa la URL base de la API que se ejecuta en tu computadora.
          </Text>

          <View style={styles.urlRow}>
            <TextInput
              value={urlInput}
              onChangeText={(value) => {
                setUrlInput(value);
                setUrlError('');
              }}
              onSubmitEditing={applyApiUrl}
              placeholder="http://192.168.1.20:8000"
              placeholderTextColor="#9AA096"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="done"
              style={styles.urlInput}
              accessibilityLabel="URL de la API"
            />
            <Pressable
              style={({ pressed }) => [
                styles.connectButton,
                pressed && styles.connectButtonPressed,
              ]}
              onPress={applyApiUrl}
              accessibilityRole="button"
            >
              <Text style={styles.connectButtonText}>Aplicar</Text>
            </Pressable>
          </View>

          {urlError ? <Text style={styles.urlError}>{urlError}</Text> : null}
          <Text style={styles.connectionHint}>
            Usa la IPv4 de la computadora, no localhost. Ambos dispositivos deben estar en la misma red Wi-Fi.
          </Text>
          {apiUrl ? (
            <Text style={styles.activeUrl} numberOfLines={1}>
              URL seleccionada: {apiUrl}
            </Text>
          ) : null}
        </View>

        <CategoryGrid
          getCategories={getCategories}
          apiUrl={apiUrl}
          reloadKey={reloadKey}
        />

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
  connectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#E8EAE3',
    padding: 17,
    marginBottom: 27,
    shadowColor: '#24372B',
    shadowOpacity: 0.045,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#E8EDE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionIconText: {
    color: '#49634A',
    fontSize: 17,
    fontWeight: '800',
  },
  connectionTitleGroup: {
    flex: 1,
    marginLeft: 10,
  },
  connectionTitle: {
    color: '#26352B',
    fontSize: 15,
    fontWeight: '800',
  },
  connectionSubtitle: {
    color: '#8A9087',
    fontSize: 11,
    marginTop: 3,
  },
  connectionStep: {
    backgroundColor: '#F2F4EF',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  connectionStepText: {
    color: '#64735E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  connectionDescription: {
    color: '#727A70',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 13,
    marginBottom: 12,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urlInput: {
    flex: 1,
    minWidth: 0,
    height: 46,
    backgroundColor: '#F7F8F5',
    borderWidth: 1,
    borderColor: '#E4E8E0',
    borderRadius: 13,
    paddingHorizontal: 12,
    color: '#29372D',
    fontSize: 12,
    marginRight: 8,
  },
  connectButton: {
    height: 46,
    borderRadius: 13,
    paddingHorizontal: 16,
    backgroundColor: '#294337',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButtonPressed: {
    opacity: 0.82,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  urlError: {
    color: '#A33D35',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },
  connectionHint: {
    color: '#92988F',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 9,
  },
  activeUrl: {
    color: '#4E6A50',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 7,
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
