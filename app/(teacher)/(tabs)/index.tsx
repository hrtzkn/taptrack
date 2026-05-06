import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import API from "../../../services/api";
import RecentLogs from "../components/RecentLogs";
import History from "../components/history";

const MONTHS = [
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
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function Dashboard() {
  const { user } = useLocalSearchParams();
  const parsedUser = user ? JSON.parse(user as string) : null;

  const [showHistory, setShowHistory] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAddOptions, setShowAddOptions] = useState(false);

  const [logs, setLogs] = useState<any[]>([]);

  const today = new Date();

  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [day, setDay] = useState<number>(today.getDate());

  const [years, setYears] = useState<number[]>([]);

  const [showYearModal, setShowYearModal] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);

  const [fullname, setFullname] = useState("");
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [rfid, setRfid] = useState("");

  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error" | "";
    text: string;
  }>({ type: "", text: "" });

  const handleUploadExcel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      if (result.canceled) return;

      const file = result.assets[0];

      const formData = new FormData();

      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type:
          file.mimeType ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      } as any);

      const res = await API.post("/auth/upload-excel", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(res.data);
      Alert.alert("Success", "Excel uploaded.");
    } catch (err: any) {
      console.log(err);
      Alert.alert("Error", "Upload failed.");
    }
  };

  const handleSaveStudent = async () => {
    if (!fullname || !grade || !section || !rfid) {
      setFormMessage({
        type: "error",
        text: "Complete all fields.",
      });
      return;
    }

    try {
      const res = await API.post("/auth/add-student", {
        fullname: fullname.trim().toUpperCase(),
        grade: parseInt(grade),
        section: section.trim().toUpperCase(),
        rfid_uid: rfid.trim(),
      });

      setFormMessage({
        type: "success",
        text: res.data.message,
      });

      setFullname("");
      setGrade("");
      setSection("");
      setRfid("");

      setTimeout(() => {
        setShowModal(false);
        setFormMessage({ type: "", text: "" });
      }, 1200);
    } catch (err: any) {
      setFormMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to save.",
      });
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    if (!month || !year) return 31;

    return new Date(year, month, 0).getDate();
  };

  useEffect(() => {
    if (year && month && day) {
      const maxDays = getDaysInMonth(month, year);
      if (day > maxDays) {
        setDay(maxDays);
      }
    }
  }, [year, month]);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        console.log("FETCHING ALL YEARS (TEACHER VIEW)");

        const res = await API.get("/attendance/years");

        console.log("YEARS RESPONSE:", res.data);

        setYears(res.data.years || []);

        if (res.data.years.length > 0) {
          const currentYear = today.getFullYear();

          if (res.data.years.includes(currentYear)) {
            setYear(currentYear);
          } else {
            setYear(res.data.years[0]); // latest available in DB
          }
        }
      } catch (err) {
        console.log("FAILED FETCH YEARS:", err);
      }
    };

    fetchYears();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        if (!year || !month || !day) return;

        const res = await API.get(
          `/attendance/date?year=${year}&month=${month}&day=${day}&grade=${parsedUser.grade}&section=${parsedUser.section}`,
        );

        setLogs(res.data.attendance || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchLogs();
  }, [year, month, day]);

  const generateCalendarDays = () => {
    const totalDays = getDaysInMonth(month, year);

    const firstDay = new Date(year, month - 1, 1).getDay();
    // 0 = Sunday

    const blanks = Array.from({ length: firstDay }, () => null);

    const days = Array.from({ length: totalDays }, (_, i) => i + 1);

    return [...blanks, ...days];
  };

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Day,</Text>
            <Text style={styles.name}>{parsedUser?.fullname || "Guest"}</Text>
            <Text style={styles.sub}>
              {parsedUser
                ? `GRADE ${parsedUser.grade} - ${parsedUser.section} ADVISER`
                : "No Data"}
            </Text>
          </View>

          <Image
            source={require("../../../assets/images/teacherPicture.jpg")}
            style={styles.avatar}
          />
        </View>

        {/* DATE BOX */}
        <View style={styles.dateBox}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddOptions(true)}
          >
            <Text style={styles.addText}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowYearModal(true)}>
            <Text style={styles.dateText}>{year ?? "YEAR"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowMonthModal(true)}>
            <Text style={styles.dateText}>
              {month ? MONTHS[month - 1] : "MONTH"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowDayModal(true)}>
            <Text style={styles.dateText}>{day ?? "DAY"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView>
        {!showHistory ? (
          <RecentLogs
            onPressHistory={() => setShowHistory(true)}
            logs={logs}
            year={year}
            month={month}
            day={day}
          />
        ) : (
          <History onBack={() => setShowHistory(false)} />
        )}
      </ScrollView>

      <Modal visible={showAddOptions} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.optionBox}>
            <Text style={styles.modalTitle}>Add Student</Text>
            <TouchableOpacity
              style={styles.optionBtn}
              onPress={handleUploadExcel}
            >
              <Text style={styles.optionText}>Import Excel File</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionBtn}
              onPress={() => {
                setShowAddOptions(false);
                setShowModal(true);
              }}
            >
              <Text style={styles.optionText}>Add Manually</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowAddOptions(false)}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Student</Text>

            <TextInput
              placeholder="Fullname"
              style={styles.input}
              value={fullname}
              onChangeText={(text) => setFullname(text.toUpperCase())}
            />

            <TextInput
              placeholder="Grade"
              keyboardType="numeric"
              style={styles.input}
              value={grade}
              onChangeText={(text) => setGrade(text.replace(/[^0-9]/g, ""))}
            />

            <TextInput
              placeholder="Section"
              style={styles.input}
              value={section}
              onChangeText={(text) => setSection(text.toUpperCase())}
            />

            <TextInput
              placeholder="RFID UID"
              style={styles.input}
              value={rfid}
              onChangeText={setRfid}
            />

            {formMessage.text !== "" && (
              <Text
                style={{
                  color: formMessage.type === "error" ? "red" : "green",
                  textAlign: "center",
                  marginTop: 10,
                  fontWeight: "bold",
                }}
              >
                {formMessage.text}
              </Text>
            )}

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSaveStudent}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowModal(false)}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showYearModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Year</Text>

            {years.map((y) => (
              <TouchableOpacity
                key={y}
                onPress={() => {
                  setYear(y);
                  setShowYearModal(false);
                }}
                style={styles.modalItem}
              >
                <Text>{y}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal visible={showMonthModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Month</Text>

            <View style={styles.grid3}>
              {MONTHS.map((m, i) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => {
                    setMonth(i + 1);
                    setShowMonthModal(false);
                  }}
                  style={styles.gridItem}
                >
                  <Text style={styles.gridText}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showDayModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Day</Text>

            {/* WEEK HEADER */}
            <View style={styles.grid7}>
              {WEEKDAYS.map((w) => (
                <View key={w} style={styles.weekItem}>
                  <Text style={styles.weekText}>{w}</Text>
                </View>
              ))}
            </View>

            {/* DAYS */}
            <View style={styles.grid7}>
              {generateCalendarDays().map((d, index) => (
                <TouchableOpacity
                  key={index}
                  disabled={d === null}
                  onPress={() => {
                    if (d) {
                      setDay(d);
                      setShowDayModal(false);
                    }
                  }}
                  style={[
                    styles.dayItem,
                    d === day && { backgroundColor: "#7B2CBF" },
                    d === null && { backgroundColor: "transparent" },
                  ]}
                >
                  <Text
                    style={[
                      styles.gridText,
                      d === day && { color: "#fff", fontWeight: "bold" },
                    ]}
                  >
                    {d || ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
    height: 280,
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

  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginTop: -90,
  },

  card: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 15,
    width: 95, // fixed size instead of % (more stable)
    alignItems: "center",
    elevation: 4,
  },

  cardNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  cardLabel: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
    letterSpacing: 1,
  },

  addButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  addText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "88%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  saveBtn: {
    backgroundColor: "#7B2CBF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  cancelBtn: {
    padding: 14,
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
  },

  dateBox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: -140,
    elevation: 5,
  },

  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7B2CBF",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    margin: 6,
  },

  modalItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },

  grid3: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  gridItem: {
    width: "30%", // 3 columns
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#f3f3f3",
    borderRadius: 10,
    alignItems: "center",
  },

  gridText: {
    fontWeight: "bold",
    color: "#333",
  },

  optionBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
  },

  optionBtn: {
    backgroundColor: "#7B2CBF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },

  optionText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  weekItem: {
    width: "14.2%",
    alignItems: "center",
    marginBottom: 8,
  },

  weekText: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#666",
  },

  grid7: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  dayItem: {
    width: "14.2%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 8,
  },
});
