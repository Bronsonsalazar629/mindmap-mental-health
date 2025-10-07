import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { ThemeProvider, useTheme, Text, Button, Card } from './src/components/ui';

// Demo component to showcase the theme
function AppContent() {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.current.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <Card style={styles.welcomeCard}>
        <Text variant="h2" align="center" style={styles.title}>
          Welcome to SunPath AI
        </Text>

        <Text variant="body" align="center" color="brand.accent" style={styles.subtitle}>
          Navigate Your Path to Mental Wellness
        </Text>

        <View style={styles.paletteDemo}>
          <Text variant="h6" style={styles.paletteTitle}>
            Coastal Morning Theme
          </Text>

          <View style={styles.colorRow}>
            <View style={[styles.colorSwatch, { backgroundColor: theme.colors.brand.primary }]} />
            <Text variant="bodySmall">Bright Marigold</Text>
          </View>

          <View style={styles.colorRow}>
            <View style={[styles.colorSwatch, { backgroundColor: theme.colors.brand.secondary }]} />
            <Text variant="bodySmall">Light Teal</Text>
          </View>

          <View style={styles.colorRow}>
            <View style={[styles.colorSwatch, { backgroundColor: theme.colors.brand.accent }]} />
            <Text variant="bodySmall">Cool Slate Gray</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button variant="primary" size="lg" onPress={() => console.log('Primary pressed')}>
            Get Started
          </Button>

          <Button variant="outline" size="md" onPress={toggleTheme} style={styles.themeButton}>
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </View>
      </Card>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  welcomeCard: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
  },
  paletteDemo: {
    marginBottom: 32,
  },
  paletteTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  buttonContainer: {
    gap: 12,
  },
  themeButton: {
    marginTop: 8,
  },
});
