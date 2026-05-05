import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
type HistoryProps = {
  onBack: () => void;
};

export default function History({ onBack }: HistoryProps) {
  const historyData = [
    {
      month: "May 2026",
      logs: [{ date: "May 1", timeIn: "8:24 am", timeOut: "4:00 pm" }],
    },
    {
      month: "April 2026",
      logs: [{ date: "Apr 28", timeIn: "8:20 am", timeOut: "4:00 pm" }],
    },
  ];

  return (
    <View style={styles.container}>
      {/* HEADER ROW */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Attendance History</Text>

        <Pressable style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      <ScrollView>
        {historyData.map((section, index) => (
          <View key={index} style={styles.monthContainer}>
            <Text style={styles.monthTitle}>{section.month}</Text>

            <View style={styles.logRow}>
              <Text>Day</Text>
              <Text style={{ color: "green" }}>Time In</Text>
              <Text style={{ color: "red" }}>Time Out</Text>
            </View>

            {section.logs.map((log, i) => (
              <View key={i} style={styles.logRow}>
                <Text>{log.date}</Text>
                <Text style={{ color: "green" }}>{log.timeIn}</Text>
                <Text style={{ color: "red" }}>{log.timeOut}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 55,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
  },

  backBtn: {
    backgroundColor: "#7B2CBF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
  },

  backText: {
    color: "#fff",
    fontWeight: "bold",
  },

  monthContainer: {
    marginBottom: 20,
    backgroundColor: "#F3F4F6",
    padding: 15,
    borderRadius: 15,
  },

  monthTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    color: "#7B2CBF",
  },

  logRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
});
