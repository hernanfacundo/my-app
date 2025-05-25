const modernTheme = {
  colors: {
    // Paleta juvenil para adolescentes mexicanos
    primaryBackground: '#F7FAFC', // Blanco suave - fondo principal
    primaryText: '#3C3C3C', // Gris oscuro - texto principal
    secondaryText: '#707070', // Gris medio - texto secundario
    
    // Colores interactivos y de acción
    turquoise: '#5CD6C2', // Turquesa juvenil - botones principales
    coral: '#FF7F7F', // Coral vibrante - botones secundarios y énfasis
    pastelYellow: '#FFD966', // Amarillo pastel - detalles y alertas
    lavender: '#B39DDB', // Lavanda suave - acentos y contraste
    
    // Fondos y superficies
    chartBackground: '#FFFFFF', // Blanco puro - tarjetas y elementos elevados
    cardBackground: '#FFFFFF', // Fondo de tarjetas
    surfaceBackground: '#F7FAFC', // Superficie secundaria
    
    // Colores de estado y feedback
    success: '#5CD6C2', // Verde turquesa para éxito
    warning: '#FFD966', // Amarillo para advertencias
    error: '#FF7F7F', // Coral para errores
    info: '#B39DDB', // Lavanda para información
    
    // Compatibilidad con tema anterior (para transición gradual)
    accent: '#5CD6C2', // Mapeo del accent anterior al turquesa
    primary: '#5CD6C2', // Color primario
    secondary: '#FF7F7F', // Color secundario
  },
  
  fontSizes: {
    // Tamaños más juveniles y modernos
    largeTitle: 32, // Para títulos principales
    title: 24, // Títulos de sección
    subtitle: 18, // Subtítulos
    body: 16, // Texto principal
    label: 14, // Etiquetas y botones
    caption: 12, // Texto pequeño
    smallLabel: 10, // Texto muy pequeño
  },
  
  spacing: {
    // Espaciado más generoso y moderno
    paddingSmall: 8,
    padding: 16,
    paddingMedium: 20,
    paddingLarge: 24,
    paddingXLarge: 32,
    
    marginTiny: 4,
    marginSmall: 8,
    marginMedium: 16,
    marginLarge: 24,
    marginXLarge: 32,
    marginXXLarge: 40,
  },
  
  borderRadius: {
    // Bordes redondeados modernos
    small: 8,
    medium: 12,
    large: 16,
    xlarge: 20,
    round: 50, // Para elementos circulares
  },
  
  shadows: {
    // Sombras suaves y modernas
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Gradientes juveniles
  gradients: {
    turquoiseCoral: ['#5CD6C2', '#FF7F7F'],
    pastelDream: ['#B39DDB', '#FFD966'],
    softTurquoise: ['#5CD6C2', '#7DE3D0'],
    warmCoral: ['#FF7F7F', '#FFB3B3'],
  },
};

export default modernTheme; 