import { AxiosError } from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import API from "../services/api";

export default function LoginScreen() {
  const router = useRouter();
  const apiUrl = Constants.expoConfig?.extra?.apiUrl;

  console.log("API URL:", apiUrl);

  const [loginError, setLoginError] = useState("");
  const [fullName, setFullName] = useState("");
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");

  const [errors, setErrors] = useState({
    fullName: false,
    grade: false,
    section: false,
  });

  const handleLogin = async () => {
    const newErrors = {
      fullName: !fullName,
      grade: !grade,
      section: !section,
    };

    setErrors(newErrors);

    if (newErrors.fullName || newErrors.grade || newErrors.section) {
      return;
    }

    if (isNaN(Number(grade))) {
      Alert.alert("Invalid Input", "Grade must be a number.");
      return;
    }

    try {
      const res = await API.post("/auth/login", {
        full_name: fullName.trim(),
        grade: parseInt(grade),
        section: section.trim().toUpperCase(),
      });

      console.log(res.data);

      if (res.data.user.role === "teacher") {
        router.replace({
          pathname: "../(teacher)/(tabs)",
          params: { user: JSON.stringify(res.data.user) },
        });
      } else {
        router.replace({
          pathname: "../(student)/(tabs)",
          params: { user: JSON.stringify(res.data.user) },
        });
      }
    } catch (err) {
      const error = err as AxiosError<any>;

      const message =
        error.response?.data?.error || "Invalid credentials. Please try again.";

      console.log("Login error:", message);

      setLoginError(message);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/loginLogo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>
        Welcome to <Text style={styles.highlight}>TapTrack</Text>
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Fullname"
          placeholderTextColor="#888"
          style={[styles.input, errors.fullName && styles.errorInput]}
          value={fullName}
          onChangeText={(text) => {
            setFullName(text.toUpperCase());
            setErrors({ ...errors, fullName: false });
          }}
        />

        {errors.fullName && <Text style={styles.errorText}>Required</Text>}

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <TextInput
              placeholder="Grade"
              placeholderTextColor="#888"
              style={[styles.input, errors.grade && styles.errorInput]}
              value={grade}
              onChangeText={(text) => {
                const numeric = text.replace(/[^0-9]/g, "");
                setGrade(numeric);
                setErrors({ ...errors, grade: false });
              }}
              keyboardType="numeric"
            />
            {errors.grade && <Text style={styles.errorText}>Required</Text>}
          </View>

          <View style={{ flex: 2 }}>
            <TextInput
              placeholder="Section"
              placeholderTextColor="#888"
              style={[styles.input, errors.section && styles.errorInput]}
              value={section}
              onChangeText={(text) => {
                setSection(text.toUpperCase());
                setErrors({ ...errors, section: false });
              }}
            />
            {errors.section && <Text style={styles.errorText}>Required</Text>}
          </View>
        </View>
      </View>

      {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <Text>API URL:</Text>
      <Text style={{ fontSize: 12 }}>{apiUrl}</Text>

      <Text style={styles.signup}>
        Don't have an account?{" "}
        <Text
          style={styles.highlight2}
          onPress={() => router.replace("../signup")}
        >
          SIGNUP HERE
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  logo: {
    width: 320,
    height: 320,
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    marginBottom: 40,
    color: "#333",
  },

  highlight: {
    color: "#7B2CBF",
    fontWeight: "bold",
  },

  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#e0e0e0",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 25,
    fontSize: 14,
  },

  button: {
    width: "100%",
    backgroundColor: "#7B2CBF",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  signup: {
    fontSize: 10,
    marginBottom: 40,
    color: "#333",
  },

  highlight2: {
    color: "#7B2CBF",
    fontWeight: "bold",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  errorInput: {
    borderWidth: 1,
    borderColor: "red",
  },

  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -20,
    marginBottom: 10,
    marginLeft: 10,
  },
});
