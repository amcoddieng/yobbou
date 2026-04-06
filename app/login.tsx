import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { authService, LoginCredentials } from '../services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    telephone: '',
    mot_de_passe: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string>('');

  const handleLogin = async () => {
    // Validation - email OU téléphone obligatoire
    if (!credentials.email && !credentials.telephone) {
      setErrors('Email ou téléphone obligatoire');
      return;
    }

    if (!credentials.mot_de_passe) {
      setErrors('Mot de passe obligatoire');
      return;
    }

    setIsLoading(true);
    setErrors('');

    try {
      // Utiliser l'API réelle
      const response = await authService.login(credentials);

      if (response.success) {
        Alert.alert('Succès', response.message, [
          {
            text: 'OK',
            onPress: () => router.replace('/'),
          },
        ]);
      } else {
        setErrors(response.message || 'Erreur de connexion');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCredentials = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    setErrors('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Yobbou</Text>
          <Text style={styles.subtitle}>Connexion Boutiquier</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email ou Téléphone</Text>
            <TextInput
              style={[styles.input, errors && styles.inputError]}
              placeholder="Email ou téléphone"
              value={credentials.email || credentials.telephone}
              onChangeText={(value) => {
                // Déterminer si c'est un email ou un téléphone
                if (value.includes('@')) {
                  updateCredentials('email', value);
                  updateCredentials('telephone', '');
                } else {
                  updateCredentials('telephone', value);
                  updateCredentials('email', '');
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={[styles.input, errors && styles.inputError]}
              placeholder="••••••••"
              value={credentials.mot_de_passe}
              onChangeText={(value) => updateCredentials('mot_de_passe', value)}
              secureTextEntry
            />
          </View>

          {errors ? <Text style={styles.errorText}>{errors}</Text> : null}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Text>
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>Credentials API officiels:</Text>
            <Text style={styles.infoSmall}>Email: marie.bernard@example.com</Text>
            <Text style={styles.infoSmall}>Mot de passe: password789</Text>
            <Text style={styles.infoSmall}>OU</Text>
            <Text style={styles.infoSmall}>Téléphone: 0345678901</Text>
            <Text style={styles.infoSmall}>Mot de passe: password789</Text>
            <Text style={styles.infoSmall}>API: http://10.26.158.157:3000</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: '300',
    color: '#0044C1',
    letterSpacing: 3,
    textTransform: 'lowercase',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '400',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  inputError: {
    borderColor: '#FF4444',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0044C1',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 5,
  },
  infoSmall: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 2,
  },
});
