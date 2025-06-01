import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView, ActivityIndicator, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from 'expo-av';
import { Audio } from 'expo-audio';
import globalStyles from '../screens/globalStyles';
import modernTheme from '../screens/modernTheme';

const LearningPathDetailScreen = ({ route, navigation }) => {
  const { path } = route.params;
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoStatus, setVideoStatus] = useState({});
  const [audioLoading, setAudioLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState({});
  const [screenLoading, setScreenLoading] = useState(true);
  const videoRefs = useRef({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Simulamos la carga inicial de la pantalla
  useEffect(() => {
    const loadScreen = async () => {
      // Simular tiempo de carga de recursos
      setTimeout(() => {
        setScreenLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 800);
    };
    loadScreen();
  }, []);

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
      if (sound) {
        sound.unloadAsync();
      }
      // Limpiar videos
      Object.values(videoRefs.current).forEach(videoRef => {
        if (videoRef) {
          videoRef.unloadAsync();
        }
      });
    };
  }, [sound]);

  // Manejar la carga y reproducción del audio
  const handleAudioPress = async (url) => {
    try {
      setAudioLoading(true);
      
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
        setAudioLoading(false);
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);
      setAudioLoading(false);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          newSound.unloadAsync();
          setSound(null);
        }
      });
    } catch (error) {
      console.error('Error al reproducir el audio:', error);
      setAudioLoading(false);
    }
  };

  const handleResourcePress = async (resource, index) => {
    setLinkLoading(prev => ({ ...prev, [index]: true }));
    
    try {
      await Linking.openURL(resource.url);
    } catch (err) {
      console.error('Error al abrir URL:', err);
    } finally {
      // Simular tiempo mínimo de loading para mejor UX
      setTimeout(() => {
        setLinkLoading(prev => ({ ...prev, [index]: false }));
      }, 1000);
    }
  };

  // Manejar estado del video
  const handleVideoStatusUpdate = (status, index) => {
    console.log(`Video ${index} status:`, status);
    setVideoStatus(prev => ({
      ...prev,
      [index]: status
    }));
  };

  // Controlar reproducción de video
  const handleVideoPress = async (index) => {
    const videoRef = videoRefs.current[index];
    const status = videoStatus[index];
    
    console.log(`Controlando video ${index}:`, { videoRef: !!videoRef, status });
    
    if (videoRef) {
      try {
        if (status?.isPlaying) {
          console.log('Pausando video');
          await videoRef.pauseAsync();
        } else {
          console.log('Reproduciendo video');
          await videoRef.playAsync();
        }
      } catch (error) {
        console.error('Error controlando video:', error);
      }
    }
  };

  // Componente de Loading Spinner
  const LoadingSpinner = ({ size = 'small', color = modernTheme.colors.turquoise }) => (
    <ActivityIndicator size={size} color={color} />
  );

  // Componente de Skeleton Loader
  const SkeletonLoader = ({ width, height, style }) => {
    const skeletonOpacity = useRef(new Animated.Value(0.3)).current;
    
    useEffect(() => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(skeletonOpacity, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }, []);

    return (
      <Animated.View
        style={[
          {
            width,
            height,
            backgroundColor: modernTheme.colors.secondaryText,
            borderRadius: modernTheme.borderRadius.medium,
            opacity: skeletonOpacity,
          },
          style,
        ]}
      />
    );
  };

  // Pantalla de loading principal
  if (screenLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <LoadingSpinner size="large" color={modernTheme.colors.turquoise} />
          <Text style={styles.loadingTitle}>🎓 Cargando Recursos</Text>
          <Text style={styles.loadingText}>Preparando tu contenido educativo...</Text>
          
          {/* Skeleton placeholders */}
          <View style={styles.skeletonContainer}>
            <SkeletonLoader width="80%" height={30} style={{ marginBottom: 10 }} />
            <SkeletonLoader width="60%" height={20} style={{ marginBottom: 20 }} />
            
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.skeletonCard}>
                <View style={styles.skeletonCardHeader}>
                  <SkeletonLoader width={50} height={50} style={{ borderRadius: 12 }} />
                  <View style={styles.skeletonCardText}>
                    <SkeletonLoader width="70%" height={18} style={{ marginBottom: 8 }} />
                    <SkeletonLoader width="40%" height={14} />
                  </View>
                </View>
                <SkeletonLoader width="100%" height={60} style={{ marginTop: 15 }} />
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
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
                    <View style={styles.videoWrapper}>
                      <Video
                        style={styles.modernVideo}
                        source={{ uri: resource.url }}
                        useNativeControls={false}
                        resizeMode="contain"
                        onPlaybackStatusUpdate={(status) => handleVideoStatusUpdate(status, index)}
                        ref={(el) => (videoRefs.current[index] = el)}
                      />
                      
                      {/* Loading overlay para video */}
                      {!videoStatus[index]?.isLoaded && (
                        <View style={styles.videoLoadingOverlay}>
                          <LoadingSpinner size="large" color="white" />
                          <Text style={styles.videoLoadingText}>Cargando video...</Text>
                        </View>
                      )}
                      
                      {/* Overlay de controles personalizado */}
                      {videoStatus[index]?.isLoaded && (
                        <View style={styles.videoOverlay}>
                          <TouchableOpacity
                            style={styles.playPauseButton}
                            onPress={() => handleVideoPress(index)}
                          >
                            <Text style={styles.playPauseIcon}>
                              {videoStatus[index]?.isPlaying ? '⏸️' : '▶️'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* Indicador de estado */}
                      <View style={styles.videoStatusBar}>
                        <View style={styles.statusInfo}>
                          <View style={[
                            styles.statusDot,
                            { backgroundColor: videoStatus[index]?.isLoaded ? 
                              (videoStatus[index]?.isPlaying ? modernTheme.colors.turquoise : modernTheme.colors.pastelYellow) : 
                              modernTheme.colors.secondaryText 
                            }
                          ]} />
                          <Text style={styles.statusText}>
                            {!videoStatus[index]?.isLoaded ? 'Cargando...' :
                             videoStatus[index]?.isPlaying ? 'Reproduciendo' : 'Pausado'}
                          </Text>
                        </View>
                        
                        {videoStatus[index]?.isLoaded && (
                          <Text style={styles.durationText}>
                            {Math.floor((videoStatus[index]?.positionMillis || 0) / 1000)}s / 
                            {Math.floor((videoStatus[index]?.durationMillis || 0) / 1000)}s
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Controles inferiores modernos */}
                    <View style={styles.videoControls}>
                      <TouchableOpacity
                        style={[
                          styles.modernControlButton,
                          { 
                            backgroundColor: videoStatus[index]?.isPlaying ? 
                              modernTheme.colors.coral : modernTheme.colors.turquoise,
                            flex: 1,
                            opacity: videoStatus[index]?.isLoaded ? 1 : 0.5
                          }
                        ]}
                        onPress={() => handleVideoPress(index)}
                        disabled={!videoStatus[index]?.isLoaded}
                      >
                        {!videoStatus[index]?.isLoaded ? (
                          <LoadingSpinner size="small" color="white" />
                        ) : (
                          <>
                            <Text style={styles.controlButtonIcon}>
                              {videoStatus[index]?.isPlaying ? '⏸️' : '▶️'}
                            </Text>
                            <Text style={styles.controlButtonText}>
                              {videoStatus[index]?.isPlaying ? 'Pausar' : 'Reproducir'}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.modernControlButton, 
                          styles.secondaryButton,
                          { opacity: videoStatus[index]?.isLoaded ? 1 : 0.5 }
                        ]}
                        disabled={!videoStatus[index]?.isLoaded}
                        onPress={() => {
                          const videoRef = videoRefs.current[index];
                          if (videoRef) {
                            videoRef.setPositionAsync(0);
                          }
                        }}
                      >
                        <Text style={styles.controlButtonIcon}>🔄</Text>
                        <Text style={[styles.controlButtonText, styles.secondaryButtonText]}>
                          Reiniciar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {resource.type === 'audio' && (
                  <TouchableOpacity
                    style={[
                      styles.modernAudioButton, 
                      { backgroundColor: getResourceColor(resource.type) },
                      audioLoading && styles.buttonLoading
                    ]}
                    onPress={() => handleAudioPress(resource.url)}
                    disabled={audioLoading}
                  >
                    <View style={styles.audioButtonContent}>
                      {audioLoading ? (
                        <>
                          <LoadingSpinner size="small" color={modernTheme.colors.chartBackground} />
                          <Text style={styles.modernAudioButtonText}>Cargando audio...</Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.audioButtonIcon}>
                            {isPlaying ? '⏸️' : '▶️'}
                          </Text>
                          <Text style={styles.modernAudioButtonText}>
                            {isPlaying ? 'Pausar Audio' : 'Reproducir Audio'}
                          </Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                )}

                {resource.type === 'pdf' && (
                  <TouchableOpacity 
                    style={[
                      styles.modernResourceButton, 
                      { backgroundColor: getResourceColor(resource.type) },
                      linkLoading[index] && styles.buttonLoading
                    ]}
                    onPress={() => handleResourcePress(resource, index)}
                    disabled={linkLoading[index]}
                  >
                    <View style={styles.resourceButtonContent}>
                      {linkLoading[index] ? (
                        <>
                          <LoadingSpinner size="small" color={modernTheme.colors.chartBackground} />
                          <Text style={styles.modernResourceButtonText}>Abriendo documento...</Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.resourceButtonIcon}>📄</Text>
                          <Text style={styles.modernResourceButtonText}>Abrir Documento</Text>
                          <Text style={styles.resourceButtonArrow}>→</Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                )}

                {resource.type === 'link' && (
                  <TouchableOpacity 
                    style={[
                      styles.modernResourceButton, 
                      { backgroundColor: getResourceColor(resource.type) },
                      linkLoading[index] && styles.buttonLoading
                    ]}
                    onPress={() => handleResourcePress(resource, index)}
                    disabled={linkLoading[index]}
                  >
                    <View style={styles.resourceButtonContent}>
                      {linkLoading[index] ? (
                        <>
                          <LoadingSpinner size="small" color={modernTheme.colors.chartBackground} />
                          <Text style={styles.modernResourceButtonText}>Abriendo enlace...</Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.resourceButtonIcon}>🔗</Text>
                          <Text style={styles.modernResourceButtonText}>Abrir Enlace</Text>
                          <Text style={styles.resourceButtonArrow}>→</Text>
                        </>
                      )}
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.primaryBackground,
  },
  scrollContainer: {
    flex: 1,
  },
  // Estilos de loading
  loadingContainer: {
    flex: 1,
    backgroundColor: modernTheme.colors.primaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    padding: modernTheme.spacing.paddingLarge,
  },
  loadingContent: {
    alignItems: 'center',
    width: '100%',
  },
  loadingTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
    marginTop: modernTheme.spacing.marginLarge,
    marginBottom: modernTheme.spacing.marginSmall,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    marginBottom: modernTheme.spacing.marginXLarge,
  },
  skeletonContainer: {
    width: '100%',
    marginTop: modernTheme.spacing.marginLarge,
  },
  skeletonCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.large,
    padding: modernTheme.spacing.paddingLarge,
    marginBottom: modernTheme.spacing.marginLarge,
    ...modernTheme.shadows.medium,
  },
  skeletonCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonCardText: {
    flex: 1,
    marginLeft: modernTheme.spacing.marginMedium,
  },
  videoLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: modernTheme.borderRadius.medium,
  },
  videoLoadingText: {
    color: 'white',
    fontSize: modernTheme.fontSizes.body,
    fontWeight: '600',
    marginTop: modernTheme.spacing.marginMedium,
  },
  buttonLoading: {
    opacity: 0.7,
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
    height: 220,
    borderRadius: modernTheme.borderRadius.medium,
    backgroundColor: '#000',
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
  videoWrapper: {
    position: 'relative',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: modernTheme.spacing.paddingMedium,
    borderRadius: modernTheme.borderRadius.medium,
  },
  playPauseIcon: {
    fontSize: 24,
    color: 'white',
  },
  videoStatusBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: modernTheme.spacing.paddingMedium,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: modernTheme.spacing.marginMedium,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: modernTheme.spacing.marginSmall,
  },
  statusText: {
    color: 'white',
    fontSize: modernTheme.fontSizes.caption,
    fontWeight: '600',
  },
  durationText: {
    color: 'white',
    fontSize: modernTheme.fontSizes.caption,
    fontWeight: '600',
  },
  videoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: modernTheme.spacing.marginMedium,
    gap: modernTheme.spacing.marginMedium,
  },
  modernControlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: modernTheme.spacing.paddingMedium,
    borderRadius: modernTheme.borderRadius.medium,
    minHeight: 50,
    ...modernTheme.shadows.small,
  },
  controlButtonIcon: {
    fontSize: 20,
    marginRight: modernTheme.spacing.marginSmall,
  },
  controlButtonText: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: '700',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderWidth: 2,
    borderColor: modernTheme.colors.turquoise,
  },
  secondaryButtonText: {
    color: modernTheme.colors.turquoise,
    fontWeight: '700',
  },
});

export default LearningPathDetailScreen;