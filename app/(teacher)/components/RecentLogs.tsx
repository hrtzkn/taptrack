import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const router = useRouter();

type RecentLogsProps = {
  onPressHistory: () => void;
  logs: any[];
  year: number;
  month: number;
  day: number;
};

export default function RecentLogs({
  onPressHistory,
  logs,
  year,
  month,
  day,
}: RecentLogsProps) {
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  const isWeekend = () => {
    const selectedDate = new Date(year, month - 1, day);
    const weekDay = selectedDate.getDay();
    return weekDay === 0 || weekDay === 6;
  };

  const getStatusColor = (timein: string) => {
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    /* FUTURE DAY */
    if (selectedDate > today) return "#D1D5DB";

    /* WEEKEND */
    if (isWeekend() && !timein) return "#D1D5DB";

    /* ABSENT */
    if (!timein) return "#EF4444";

    const clean = timein.toLowerCase().trim();

    const parts = clean.split(" ");
    const time = parts[0];
    const meridian = parts[1];

    let [hour, minute] = time.split(":").map(Number);

    if (meridian === "pm" && hour !== 12) hour += 12;
    if (meridian === "am" && hour === 12) hour = 0;

    const totalMinutes = hour * 60 + minute;
    const cutoff = 7 * 60 + 45;

    return totalMinutes <= cutoff ? "#22C55E" : "#EAB308";
  };

  /* COUNTS */
  const presentCount = logs.filter(
    (item) => getStatusColor(item.timein) === "#22C55E",
  ).length;

  const lateCount = logs.filter(
    (item) => getStatusColor(item.timein) === "#EAB308",
  ).length;

  const absentCount = logs.filter(
    (item) => getStatusColor(item.timein) === "#EF4444",
  ).length;

  const totalCount = logs.length;

  /* FILTER */
  const filteredLogs = logs.filter((item) => {
    const color = getStatusColor(item.timein);

    if (selectedFilter === "PRESENT") return color === "#22C55E";
    if (selectedFilter === "LATE") return color === "#EAB308";
    if (selectedFilter === "ABSENT") return color === "#EF4444";

    return true;
  });

  return (
    <View style={styles.section}>
      {/* HEADER */}
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>Attendance - {selectedFilter}</Text>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <Pressable
          style={styles.present}
          onPress={() => setSelectedFilter("PRESENT")}
        >
          <Text>Present</Text>
          <Text style={styles.count}>{presentCount}</Text>
        </Pressable>

        <Pressable
          style={styles.late}
          onPress={() => setSelectedFilter("LATE")}
        >
          <Text>Late</Text>
          <Text style={styles.count}>{lateCount}</Text>
        </Pressable>

        <Pressable
          style={styles.absent}
          onPress={() => setSelectedFilter("ABSENT")}
        >
          <Text>Absent</Text>
          <Text style={styles.count}>{absentCount}</Text>
        </Pressable>

        <Pressable
          style={styles.total}
          onPress={() => setSelectedFilter("ALL")}
        >
          <Text>Total</Text>
          <Text style={styles.count}>{totalCount}</Text>
        </Pressable>
      </View>

      {/* TABLE */}
      <View style={styles.logBox}>
        <View style={[styles.logRow, styles.headerRow]}>
          <Text style={styles.nameColHeader}>FULLNAME</Text>
          <Text style={styles.timeInHeader}>TIME IN</Text>
          <Text style={styles.timeOutHeader}>TIME OUT</Text>
        </View>

        {filteredLogs.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 12 }}>
            No records found
          </Text>
        ) : (
          filteredLogs.map((item, index) => {
            const color = getStatusColor(item.timein);

            return (
              <View key={index} style={styles.logRow}>
                <View style={styles.nameWrap}>
                  <View
                    style={[styles.statusDot, { backgroundColor: color }]}
                  />

                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.fullnameText}
                  >
                    {item.fullname}
                  </Text>
                </View>

                <Text style={styles.timeInText}>{item.timein || "--"}</Text>

                <Text style={styles.timeOutText}>{item.timeout || "--"}</Text>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  titleRow: {
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  count: {
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 4,
  },

  present: {
    backgroundColor: "#B1FFA2",
    padding: 10,
    borderRadius: 10,
    width: "23%",
    alignItems: "center",
  },

  late: {
    backgroundColor: "#FFF2D2",
    padding: 10,
    borderRadius: 10,
    width: "23%",
    alignItems: "center",
  },

  absent: {
    backgroundColor: "#FFDBDB",
    padding: 10,
    borderRadius: 10,
    width: "23%",
    alignItems: "center",
  },

  total: {
    backgroundColor: "#E5E7EB",
    padding: 10,
    borderRadius: 10,
    width: "23%",
    alignItems: "center",
  },

  logBox: {
    backgroundColor: "#fff",
    borderRadius: 15,
  },

  logRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 30,
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  headerRow: {
    backgroundColor: "#E5E7EB",
  },

  nameWrap: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    gap: 8,
  },

  nameColHeader: {
    width: "50%",
    fontWeight: "bold",
    fontSize: 12,
  },

  fullnameText: {
    flex: 1,
    fontSize: 13,
  },

  timeInHeader: {
    width: "25%",
    textAlign: "center",
    color: "green",
    fontWeight: "bold",
    fontSize: 12,
  },

  timeInText: {
    width: "25%",
    textAlign: "center",
    color: "green",
    fontSize: 13,
  },

  timeOutHeader: {
    width: "25%",
    textAlign: "center",
    color: "red",
    fontWeight: "bold",
    fontSize: 12,
  },

  timeOutText: {
    width: "25%",
    textAlign: "center",
    color: "red",
    fontSize: 13,
  },

  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
