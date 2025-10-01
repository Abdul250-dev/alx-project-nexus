import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Eye, EyeOff } from "react-native-feather";
import { useTheme } from "../../components/theme-provider";
import { useAuth } from "../../context/AuthContext";
import { ERROR_MESSAGES, ROUTES } from "../../utils/constants";
import { validateEmail, validateMinLength, validateRequired } from "../../utils/validators";

type LoginScreenProps = {
  onLoginSuccess: () => void;
};

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const router = useRouter();
  const { login } = useAuth();
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmailField = () => {
    if (!validateRequired(email)) {
      setEmailError("Email is required");
      return false;
    }
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = () => {
    if (!validateRequired(password)) {
      setPasswordError("Password is required");
      return false;
    }
    if (!validateMinLength(password, 6)) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleLogin = async () => {
    setLoginError("");

    const isEmailValid = validateEmailField();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) return;

    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        onLoginSuccess();
      } else {
        setLoginError(ERROR_MESSAGES.AUTH_ERROR);
        // Debugging for developer
        console.error("[LoginScreen] Login failed:", {
          email,
          error: ERROR_MESSAGES.AUTH_ERROR
        });
      }
    } catch (error) {
      setLoginError(ERROR_MESSAGES.GENERAL_ERROR);
      // Debugging for developer
      console.error("[LoginScreen] Login error:", {
        email,
        error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignUp = () => {
    router.push(ROUTES.AUTH.SIGNUP);
  };

  const navigateToExplore = () => {
    router.push(ROUTES.AUTH.EXPLORE);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.white }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={[styles.appName, { color: colors.navyBlue }]}>HealthPathCoach</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.welcomeText, { color: colors.navyBlue }]}>Welcome Back</Text>
          <Text style={[styles.subtitleText, { color: colors.gray }]}>Sign in to continue</Text>

          {loginError ? (
            <View style={[styles.errorContainer, { backgroundColor: colors.errorLight }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{loginError}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.navyBlue }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: emailError ? colors.error : colors.lightGray,
                  color: colors.black,
                },
              ]}
              placeholder="Enter your email"
              placeholderTextColor={colors.gray}
              value={email}
              onChangeText={setEmail}
              onBlur={validateEmailField}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {emailError ? (
              <Text style={[styles.fieldError, { color: colors.error }]}>{emailError}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.navyBlue }]}>Password</Text>
            <View
              style={[
                styles.passwordContainer,
                {
                  borderColor: passwordError ? colors.error : colors.lightGray,
                },
              ]}
            >
              <TextInput
                style={[styles.passwordInput, { color: colors.black }]}
                placeholder="Enter your password"
                placeholderTextColor={colors.gray}
                value={password}
                onChangeText={setPassword}
                onBlur={validatePassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff stroke={colors.gray} width={20} height={20} />
                ) : (
                  <Eye stroke={colors.gray} width={20} height={20} />
                )}
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={[styles.fieldError, { color: colors.error }]}>{passwordError}</Text>
            ) : null}
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: colors.teal }]}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.teal }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={[styles.loginButtonText, { color: colors.white }]}> {isLoading ? "Signing in..." : "Sign In"} </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.signupContainer}>
            <Text style={[styles.noAccountText, { color: colors.gray }]}> {`Don't have an account?`} </Text>
            <TouchableOpacity onPress={navigateToSignUp}>
              <Text style={[styles.signupText, { color: colors.teal }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.exploreButton, { borderColor: colors.teal }]} onPress={navigateToExplore}>
            <Text style={[styles.exploreButtonText, { color: colors.teal }]}>Explore Without Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: "contain",
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  formContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitleText: {
    fontSize: 16,
    marginBottom: 44,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderWidth: 1,
    borderRadius: 25,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 15,
  },
  fieldError: {
    fontSize: 12,
    marginTop: 4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    marginTop: 20,
    marginBottom: 30,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  noAccountText: {
    fontSize: 14,
  },
  signupText: {
    fontSize: 14,
    fontWeight: "600",
  },
  exploreButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
