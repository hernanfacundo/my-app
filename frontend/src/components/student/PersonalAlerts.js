import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Button, Icon } from 'react-native-elements';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

const PersonalAlerts = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      const response = await axios.get('/api/personal/analysis', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalysis(response.data.data);
    } catch (error) {
      console.error('Error al obtener análisis personal:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH':
        return '#FF4B4B';
      case 'MEDIUM':
        return '#FFA500';
      case 'LOW':
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Cargando tu análisis personal...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {analysis?.patterns.map((pattern, index) => (
        <Card key={index} containerStyle={styles.card}>
          <View style={styles.headerContainer}>
            <Icon
              name="alert-circle"
              type="feather"
              color={getSeverityColor(pattern.severity)}
              size={24}
            />
            <Text style={styles.title}>{pattern.description}</Text>
          </View>
          
          <Text style={styles.detail}>{pattern.detail}</Text>
          
          <View style={styles.suggestionsContainer}>
            {pattern.suggestions.map((suggestion, idx) => (
              <View key={idx} style={styles.suggestionItem}>
                <Icon name="chevron-right" type="feather" size={16} color="#666" />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        </Card>
      ))}

      {analysis?.recommendations.immediate.length > 0 && (
        <Card containerStyle={[styles.card, styles.immediateCard]}>
          <Text style={styles.immediateTitle}>Atención Inmediata</Text>
          {analysis.recommendations.immediate.map((rec, index) => (
            <View key={index} style={styles.immediateItem}>
              <Text style={styles.immediateMessage}>{rec.message}</Text>
              {rec.actions.map((action, idx) => (
                <TouchableOpacity key={idx} style={styles.actionButton}>
                  <Text style={styles.actionText}>{action}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </Card>
      )}

      {analysis?.recommendations.resources.length > 0 && (
        <Card containerStyle={styles.card}>
          <Text style={styles.resourcesTitle}>Recursos Recomendados</Text>
          {analysis.recommendations.resources.map((resource, index) => (
            <TouchableOpacity key={index} style={styles.resourceButton}>
              <Icon name={resource.type === 'meditation' ? 'heart' : 'book'} type="feather" size={20} color="#fff" />
              <Text style={styles.resourceText}>{resource.title}</Text>
            </TouchableOpacity>
          ))}
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  suggestionsContainer: {
    marginTop: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#444',
  },
  immediateCard: {
    backgroundColor: '#FFF4F4',
    borderColor: '#FF4B4B',
  },
  immediateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF4B4B',
    marginBottom: 15,
  },
  immediateItem: {
    marginBottom: 15,
  },
  immediateMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#FF4B4B',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  actionText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  resourcesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  resourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  resourceText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PersonalAlerts; 