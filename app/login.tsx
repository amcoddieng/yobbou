import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { authService, LoginCredentials } from '../services/auth';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    telephone: '',
    mot_de_passe: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false,
  });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    // Validation - email OU téléphone obligatoire
    if (!credentials.email && !credentials.telephone) {
      setErrors('Email ou téléphone obligatoire');
      shakeError();
      return;
    }

    if (!credentials.mot_de_passe) {
      setErrors('Mot de passe obligatoire');
      shakeError();
      return;
    }

    // Animation du bouton
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsLoading(true);
    setErrors('');

    try {
      // Utiliser l'API réelle
      const response = await authService.login(credentials);

      if (response.success) {
        Alert.alert(
          ' Connexion réussie', 
          `Bienvenue ${response.user?.prenom || 'Boutiquier'} !`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/'),
            },
          ]
        );
      } else {
        setErrors(response.message || 'Erreur de connexion');
        shakeError();
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors('Erreur de connexion. Veuillez réessayer.');
      shakeError();
    } finally {
      setIsLoading(false);
    }
  };

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const updateCredentials = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    setErrors('');
  };

  const handleRegister = () => {
    Alert.alert(
      ' Inscription', 
      'La fonctionnalité d\'inscription sera bientôt disponible !\n\nPour l\'instant, contactez notre équipe pour créer votre compte.',
      [
        {
          text: 'Compris !',
          style: 'default',
        },
      ]
    );
  };

  const handleFocus = (field: 'email' | 'password') => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: 'email' | 'password') => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logo}>Y</Text>
              </View>
              <Text style={styles.logoText}>obbou</Text>
            </View>
            <Text style={styles.subtitle}>Espace Boutiquier</Text>
            <Text style={styles.description}>
              Gérez votre boutique en toute simplicité
            </Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.form,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}> Email ou Téléphone</Text>
              <View style={[
                styles.inputContainer,
                isFocused.email && styles.inputFocused,
                errors && styles.inputErrorContainer
              ]}>
                <TextInput
                  style={[
                    styles.input, 
                    errors && styles.inputError
                  ]}
                  placeholder="Ex: marie@exemple.com"
                  placeholderTextColor="#999"
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
                  selectionColor="#0044C1"
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                />
                <View style={styles.inputIcon}>
                  <Text style={styles.icon}>👤</Text>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}> Mot de passe</Text>
              <View style={[
                styles.inputContainer,
                isFocused.password && styles.inputFocused,
                errors && styles.inputErrorContainer
              ]}>
                <TextInput
                  style={[
                    styles.input, 
                    styles.passwordInput, 
                    errors && styles.inputError
                  ]}
                  placeholder="••••••••"
                  placeholderTextColor="#999"
                  value={credentials.mot_de_passe}
                  onChangeText={(value) => updateCredentials('mot_de_passe', value)}
                  secureTextEntry={!showPassword}
                  selectionColor="#0044C1"
                  onFocus={() => handleFocus('password')}
                  onBlur={() => handleBlur('password')}
                />
                <TouchableOpacity 
                  style={styles.inputIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.icon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {errors ? (
              <Animated.View 
                style={[
                  styles.errorContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateX: slideAnim }],
                  }
                ]}
              >
                <Text style={styles.errorText}>⚠️ {errors}</Text>
              </Animated.View>
            ) : null}

            <Animated.View>
              <TouchableOpacity
                style={[
                  styles.loginButton, 
                  isLoading && styles.buttonDisabled,
                  { transform: [{ scale: buttonScale }] }
                ]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>●</Text>
                    <Text style={styles.loadingText}>●</Text>
                    <Text style={styles.loadingText}>●</Text>
                  </View>
                ) : (
                  <Text style={styles.loginButtonText}>Se connecter</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>
                Pas encore de compte ? 
                <Text style={styles.registerButtonTextBold}> S'inscrire</Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}> Compte de démonstration</Text>
              <View style={styles.credentialsRow}>
                <Text style={styles.credentialsLabel}>Email:</Text>
                <Text style={styles.credentialsValue}>marie.bernard@example.com</Text>
              </View>
              <View style={styles.credentialsRow}>
                <Text style={styles.credentialsLabel}>Téléphone:</Text>
                <Text style={styles.credentialsValue}>0345678901</Text>
              </View>
              <View style={styles.credentialsRow}>
                <Text style={styles.credentialsLabel}>Mot de passe:</Text>
                <Text style={styles.credentialsValue}>password789</Text>
              </View>
              <Text style={styles.apiInfo}> API: {process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0044C1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#0044C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#0044C1',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFocused: {
    borderColor: '#0044C1',
    backgroundColor: '#F0F7FF',
  },
  inputErrorContainer: {
    borderColor: '#FF4444',
    backgroundColor: '#FFF5F5',
  },
  input: {
    flex: 1,
    height: 55,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#333333',
  },
  passwordInput: {
    paddingRight: 50,
  },
  inputError: {
    borderColor: '#FF4444',
    backgroundColor: '#FFF5F5',
  },
  inputIcon: {
    position: 'absolute',
    right: 15,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FF4444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#0044C1',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#0044C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  registerButton: {
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: {
    color: '#666666',
    fontSize: 14,
  },
  registerButtonTextBold: {
    color: '#0044C1',
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 3,
  },
  infoContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0044C1',
    marginBottom: 10,
  },
  credentialsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  credentialsLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
    flex: 1,
  },
  credentialsValue: {
    fontSize: 12,
    color: '#0044C1',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  apiInfo: {
    fontSize: 10,
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
