import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import API from "../../../services/api";
import RecentLogs from "../components/RecentLogs";
import History from "../components/history";

export default function Dashboard() {
  const { user } = useLocalSearchParams();
  const parsedUser = user ? JSON.parse(user as string) : null;

  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [showHistory, setShowHistory] = useState(false);

  const currentYear = new Date().getFullYear();

  const isHistoryMode = showHistory;

  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const years = availableYears;

  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  useEffect(() => {
    if (parsedUser?.student_id) {
      fetchYears();
    }
  }, []);

  useEffect(() => {
    if (!showHistory) {
      const now = new Date();
      setMonth(now.getMonth() + 1);
      setYear(now.getFullYear());
    }
  }, [showHistory]);

  const fetchYears = async () => {
    try {
      const res = await API.get(
        `/attendance/student-years/${parsedUser.student_id}`,
      );

      setAvailableYears(res.data.years);
    } catch (err) {
      console.log("Year fetch error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>

            <Text style={styles.name}>{parsedUser?.fullname || "Guest"}</Text>

            <Text style={styles.sub}>
              {parsedUser
                ? `Grade ${parsedUser.grade} - ${parsedUser.section}`
                : "No Data"}
            </Text>
          </View>

          <Image
            source={require("../../../assets/images/studentPicture.jpg")}
            style={styles.avatar}
          />
        </View>

        <View style={styles.calendarContainer}>
          {/* YEAR */}
          <Pressable
            style={[styles.yearBox, !isHistoryMode && { opacity: 0.8 }]}
            disabled={!isHistoryMode}
            onPress={() => setShowYearPicker(true)}
          >
            <Text style={styles.yearText}>{year}</Text>
          </Pressable>

          {/* MONTH */}
          <Pressable
            style={[styles.monthBox, !isHistoryMode && { opacity: 0.8 }]}
            disabled={!isHistoryMode}
            onPress={() => setShowMonthPicker(true)}
          >
            <Text style={styles.monthText}>{months[month - 1]}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView>
        {!showHistory ? (
          <RecentLogs
            studentId={parsedUser?.student_id}
            month={month}
            year={year}
            onPressHistory={() => setShowHistory(true)}
          />
        ) : (
          <History
            onBack={() => setShowHistory(false)}
            studentId={parsedUser?.student_id}
            month={month}
            year={year}
          />
        )}
      </ScrollView>

      <Modal visible={showYearPicker} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Year</Text>

            {years.map((y) => (
              <Pressable
                key={y}
                onPress={() => {
                  setYear(y);
                  setShowYearPicker(false);
                }}
              >
                <Text style={styles.option}>{y}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      <Modal visible={showMonthPicker} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.monthGrid}>
            {months.map((m, index) => (
              <Pressable
                key={m}
                style={styles.monthItem}
                onPress={() => {
                  setMonth(index + 1);
                  setShowMonthPicker(false);
                }}
              >
                <Text style={styles.option}>{m}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  header: {
    backgroundColor: "#7B2CBF",
    padding: 20,
    height: 260,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  greeting: {
    color: "#fff",
    fontSize: 18,
  },

  name: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  sub: {
    color: "#ddd",
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 70,
  },

  calendarContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: -130,
    marginBottom: 55,
    gap: 10,
  },

  yearBox: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: 80,
  },

  yearText: {
    color: "#0e0e0e",
    fontWeight: "bold",
  },

  monthBox: {
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    elevation: 3,
  },

  monthText: {
    fontWeight: "bold",
    color: "#333",
  },

  navBtn: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    paddingHorizontal: 10,
    alignSelf: "center",
  },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    width: "70%",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },

  option: {
    padding: 12,
    textAlign: "center",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  monthItem: {
    width: "30%",
    paddingVertical: 12,
    marginVertical: 5,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    alignItems: "center",
  },
});
