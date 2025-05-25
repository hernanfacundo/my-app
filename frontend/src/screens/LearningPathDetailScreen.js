import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video, Audio } from 'expo-av'; // Usamos expo-av para video y audio
import globalStyles from '../screens/globalStyles';
import modernTheme from '../screens/modernTheme';

const LearningPathDetailScreen = ({ route, navigation }) => {
  const { path } = route.params;
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [sound, setSound] = useState(null); // Estado para manejar el objeto de sonido
  const [isPlaying, setIsPlaying] = useState(false); // Estado para rastrear la reproducción

  // Función para obtener icono según el tipo de recurso
  const getResourceIcon = (type) => {
    const icons = {
      video: '🎥',
      audio: '🎵',
      pdf: '📄',
      link: '🔗',
    };
    return icons[type] || '📋';
  };

  // Función para obtener color según el tipo de recurso
  const getResourceColor = (type) => {
    const colors = {
      video: modernTheme.colors.coral,
      audio: modernTheme.colors.turquoise,
      pdf: modernTheme.colors.pastelYellow,
      link: modernTheme.colors.lavender,
    };
    return colors[type] || modernTheme.colors.turquoise;
  };

  // Limpiar recursos al desmontar el componente
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.unloadAsync();
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Manejar la carga y reproducción del audio
  const handleAudioPress = async (url) => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          newSound.unloadAsync();
          setSound(null);
        }
      });
    } catch (error) {
      console.error('Error al reproducir el audio:', error);
    }
  };

  const handleResourcePress = (resource) => {
    Linking.openURL(resource.url).catch((err) =>
      console.error('Error al abrir URL:', err)
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header moderno */}
      <View style={styles.headerContainer}>
        <Text style={styles.mainTitle}>{path.title}</Text>
        <Text style={styles.description}>{path.description}</Text>
      </View>

      {/* Sección de recursos */}
      <View style={styles.resourcesSection}>
        <Text style={styles.sectionTitle}>📚 Recursos de Aprendizaje</Text>
        
        {path.resources && Array.isArray(path.resources) && path.resources.length > 0 ? (
          path.resources.map((resource, index) => (
            <View key={index} style={[
              styles.modernResourceCard,
              { borderLeftColor: getResourceColor(resource.type) }
            ]}>
              <View style={styles.resourceHeader}>
                <View style={[
                  styles.resourceIconContainer,
                  { backgroundColor: getResourceColor(resource.type) }
                ]}>
                  <Text style={styles.resourceIcon}>{getResourceIcon(resource.type)}</Text>
                </View>
                <View style={styles.resourceInfo}>
                  <Text style={styles.modernResourceTitle}>{resource.title}</Text>
                  <Text style={styles.resourceType}>
                    {resource.type === 'video' ? 'Video' : 
                     resource.type === 'audio' ? 'Audio' :
                     resource.type === 'pdf' ? 'Documento PDF' : 'Enlace'}
                  </Text>
                </View>
              </View>

              {/* Contenido específico por tipo */}
              {resource.type === 'video' && (
                <View style={styles.videoContainer}>
                  <Video
                    ref={videoRef}
                    source={{ uri: resource.url }}
                    style={styles.modernVideo}
                    useNativeControls
                    resizeMode="contain"
                    isLooping={false}
                    shouldPlay={false}
                  />
                </View>
              )}

              {resource.type === 'audio' && (
                <TouchableOpacity
                  style={[styles.modernAudioButton, { backgroundColor: getResourceColor(resource.type) }]}
                  onPress={() => handleAudioPress(resource.url)}
                >
                  <View style={styles.audioButtonContent}>
                    <Text style={styles.audioButtonIcon}>
                      {isPlaying ? '⏸️' : '▶️'}
                    </Text>
                    <Text style={styles.modernAudioButtonText}>
                      {isPlaying ? 'Pausar Audio' : 'Reproducir Audio'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {resource.type === 'pdf' && (
                <TouchableOpacity 
                  style={[styles.modernResourceButton, { backgroundColor: getResourceColor(resource.type) }]}
                  onPress={() => handleResourcePress(resource)}
                >
                  <View style={styles.resourceButtonContent}>
                    <Text style={styles.resourceButtonIcon}>📄</Text>
                    <Text style={styles.modernResourceButtonText}>Abrir Documento</Text>
                    <Text style={styles.resourceButtonArrow}>→</Text>
                  </View>
                </TouchableOpacity>
              )}

              {resource.type === 'link' && (
                <TouchableOpacity 
                  style={[styles.modernResourceButton, { backgroundColor: getResourceColor(resource.type) }]}
                  onPress={() => handleResourcePress(resource)}
                >
                  <View style={styles.resourceButtonContent}>
                    <Text style={styles.resourceButtonIcon}>🔗</Text>
                    <Text style={styles.modernResourceButtonText}>Abrir Enlace</Text>
                    <Text style={styles.resourceButtonArrow}>→</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>Sin recursos disponibles</Text>
            <Text style={styles.emptyText}>
              Los recursos para esta ruta estarán disponibles próximamente
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.primaryBackground,
  },
  contentContainer: {
    padding: modernTheme.spacing.paddingLarge,
  },
  headerContainer: {
    marginBottom: modernTheme.spacing.marginXLarge,
  },
  mainTitle: {
    fontSize: modernTheme.fontSizes.largeTitle,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginMedium,
    textAlign: 'center',
  },
  description: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: modernTheme.spacing.paddingMedium,
  },
  resourcesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginLarge,
    textAlign: 'center',
  },
  modernResourceCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.large,
    padding: modernTheme.spacing.paddingLarge,
    marginBottom: modernTheme.spacing.marginLarge,
    borderLeftWidth: 4,
    ...modernTheme.shadows.medium,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  resourceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: modernTheme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: modernTheme.spacing.marginMedium,
  },
  resourceIcon: {
    fontSize: 24,
  },
  resourceInfo: {
    flex: 1,
  },
  modernResourceTitle: {
    fontSize: modernTheme.fontSizes.subtitle,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginTiny,
  },
  resourceType: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  videoContainer: {
    borderRadius: modernTheme.borderRadius.medium,
    overflow: 'hidden',
    ...modernTheme.shadows.small,
  },
  modernVideo: {
    width: '100%',
    height: 200,
  },
  modernAudioButton: {
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    ...modernTheme.shadows.small,
  },
  audioButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioButtonIcon: {
    fontSize: 20,
    marginRight: modernTheme.spacing.marginSmall,
  },
  modernAudioButtonText: {
    color: modernTheme.colors.chartBackground,
    fontSize: modernTheme.fontSizes.body,
    fontWeight: '600',
  },
  modernResourceButton: {
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    ...modernTheme.shadows.small,
  },
  resourceButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resourceButtonIcon: {
    fontSize: 20,
  },
  modernResourceButtonText: {
    flex: 1,
    color: modernTheme.colors.chartBackground,
    fontSize: modernTheme.fontSizes.body,
    fontWeight: '600',
    marginLeft: modernTheme.spacing.marginMedium,
  },
  resourceButtonArrow: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: '700',
    color: modernTheme.colors.chartBackground,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: modernTheme.spacing.paddingXLarge,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: modernTheme.spacing.marginLarge,
  },
  emptyTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginMedium,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    paddingHorizontal: modernTheme.spacing.paddingLarge,
    lineHeight: 22,
  },
});

export default LearningPathDetailScreen;