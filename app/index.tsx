import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { authService } from '../services/auth';
import AuthGuard from './auth-guard';

export default function HomeScreen() {
  const router = useRouter();

  const handleRelaunchLanding = () => {
    router.replace('/landing');
  };

  const handleLogout = async () => {
    await authService.logout();
    router.replace('/login');
  };

  return (
    <AuthGuard>
      <View style={styles.container}>
        <Text style={styles.title}>Bienvenue sur Yobbou</Text>
        <Text style={styles.subtitle}>L'innovation à votre portée</Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleRelaunchLanding}
        >
          <Text style={styles.buttonText}>Relancer l'animation</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0044C1',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#0044C1',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#FF4444',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
