import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video, Audio } from 'expo-av'; // Usamos expo-av para video y audio
import globalStyles from '../screens/globalStyles';
import theme from '../screens/theme';

const LearningPathDetailScreen = ({ route, navigation }) => {
  const { path } = route.params;
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [sound, setSound] = useState(null); // Estado para manejar el objeto de sonido
  const [isPlaying, setIsPlaying] = useState(false); // Estado para rastrear la reproducción

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
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>{path.title}</Text>
      <Text style={styles.description}>{path.description}</Text>
      <Text style={globalStyles.subtitle}>Recursos</Text>
      {path.resources && Array.isArray(path.resources) && path.resources.length > 0 ? (
        path.resources.map((resource, index) => (
          <View key={index} style={styles.resourceContainer}>
            <Text style={styles.resourceTitle}>{resource.title}</Text>
            {resource.type === 'video' && (
              <Video
                ref={videoRef}
                source={{ uri: resource.url }}
                style={styles.video}
                useNativeControls
                resizeMode="contain"
                isLooping={false}
                shouldPlay={false}
              />
            )}
            {resource.type === 'audio' && (
              <TouchableOpacity
                style={styles.audioButton}
                onPress={() => handleAudioPress(resource.url)}
              >
                <Text style={styles.audioButtonText}>
                  {isPlaying ? 'Detener Audio' : 'Reproducir Audio'}
                </Text>
              </TouchableOpacity>
            )}
            {resource.type === 'pdf' && (
              <TouchableOpacity onPress={() => handleResourcePress(resource)}>
                <Text style={styles.resourceLink}>Abrir PDF</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No hay recursos disponibles</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  description: {
    fontSize: theme.fontSizes.label,
    color: theme.colors.secondaryText,
    marginBottom: theme.spacing.marginLarge,
  },
  resourceContainer: {
    marginBottom: theme.spacing.marginLarge,
    width: '100%',
  },
  resourceTitle: {
    fontSize: theme.fontSizes.subtitle,
    fontWeight: '500',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.marginMedium,
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  audioButton: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.padding,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: theme.spacing.marginSmall,
  },
  audioButtonText: {
    color: theme.colors.chartBackground,
    fontSize: theme.fontSizes.label,
    fontWeight: '500',
  },
  resourceLink: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.label,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginVertical: theme.spacing.marginMedium,
  },
});

export default LearningPathDetailScreen;