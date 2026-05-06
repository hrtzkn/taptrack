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

export default function SignupScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");

  const [message, setMessage] = useState<{
    type: "success" | "error" | "";
    text: string;
  }>({ type: "", text: "" });

  const [errors, setErrors] = useState({
    fullName: false,
    grade: false,
    section: false,
  });

  const handleSignup = async () => {
    const newErrors = {
      fullName: !fullName,
      grade: !grade,
      section: !section,
    };

    setErrors(newErrors);

    if (newErrors.fullName || newErrors.grade || newErrors.section) {
      return;
    }

    const numericGrade = parseInt(grade);

    if (isNaN(numericGrade)) {
      Alert.alert("Invalid Input", "Grade must be a number.");
      return;
    }

    try {
      const res = await API.post("/auth/signup", {
        full_name: fullName.trim(),
        grade: numericGrade,
        section: section.trim().toUpperCase(),
      });

      setMessage({
        type: "success",
        text: "Account created successfully!",
      });

      // optional delay before redirect
      setTimeout(() => {
        router.replace("../login");
      }, 2200);
    } catch (err: any) {
      console.log("Signup error:", err.response?.data);

      if (err.response?.status === 409) {
        setMessage({
          type: "error",
          text: "Account already exists for this Grade and Section.",
        });
      } else {
        setMessage({
          type: "error",
          text:
            err.response?.data?.error ||
            "Something went wrong. Please try again.",
        });
      }
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

      {message.text !== "" && (
        <Text
          style={{
            color: message.type === "error" ? "red" : "green",
            textAlign: "center",
            marginBottom: 30,
            fontWeight: "bold",
          }}
        >
          {message.text}
        </Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Signup</Text>
      </TouchableOpacity>

      <Text style={styles.signup}>
        You have an account?{" "}
        <Text
          style={styles.highlight2}
          onPress={() => router.replace("../login")}
        >
          LOGIN HERE
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

  gradeInput: {
    width: 130,
    marginRight: 20,
  },

  sectionInput: {
    flex: 1,
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
