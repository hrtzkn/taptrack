import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import API from "../../../backend/src/services/api";

type RecentLogsProps = {
  onPressHistory: () => void;
  studentId: number;
  month: number;
  year: number;
};

type AttendanceItem = {
  attendance_date: string;
  timein?: string;
  timeout?: string;
};

type LogItem = {
  date: Date;
  timein?: string;
  timeout?: string;
  status: "present" | "late" | "absent";
};

type FilterType = "all" | "present" | "late" | "absent";

export default function RecentLogs({
  onPressHistory,
  studentId,
  month,
  year,
}: RecentLogsProps) {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

  useEffect(() => {
    if (studentId) fetchAttendance();
  }, [studentId, month, year]);

  const fetchAttendance = async () => {
    try {
      const res = await API.get(`/attendance/student/${studentId}`);
      const data: AttendanceItem[] = res.data.attendance;

      const filtered = data.filter((item) => {
        const d = new Date(item.attendance_date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      });

      const map = new Map<number, AttendanceItem>();

      filtered.forEach((item) => {
        const d = new Date(item.attendance_date);
        map.set(d.getDate(), item);
      });

      const today = new Date();
      const isCurrentMonth =
        today.getMonth() + 1 === month && today.getFullYear() === year;

      const maxDay = isCurrentMonth
        ? today.getDate()
        : new Date(year, month, 0).getDate();

      const fullMonthData: LogItem[] = [];

      for (let day = maxDay; day >= 1; day--) {
        const currentDate = new Date(year, month - 1, day);
        const weekday = currentDate.getDay();
        const record = map.get(day);

        if (weekday === 0 || weekday === 6) continue;

        let status: "present" | "late" | "absent" = "absent";

        if (record?.timein) {
          status = getStatus(record.timein);
        }

        fullMonthData.push({
          date: currentDate,
          timein: record?.timein,
          timeout: record?.timeout,
          status,
        });
      }

      setLogs(fullMonthData);
    } catch (err) {
      console.log("Attendance error:", err);
    }
  };

  const getStatus = (timein?: string): "present" | "late" | "absent" => {
    if (!timein) return "absent";

    const [time, modifier] = timein.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier?.toLowerCase() === "pm" && hours !== 12) hours += 12;
    if (modifier?.toLowerCase() === "am" && hours === 12) hours = 0;

    const totalMinutes = hours * 60 + minutes;
    const cutoff = 7 * 60 + 45;

    return totalMinutes <= cutoff ? "present" : "late";
  };

  const logsToShow = logs.filter((item) => {
    if (selectedFilter === "all") return true;
    return item.status === selectedFilter;
  });

  const formatDate = (date: Date) => {
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
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  const presentCount = logs.filter((l) => l.status === "present").length;
  const lateCount = logs.filter((l) => l.status === "late").length;
  const absentCount = logs.filter((l) => l.status === "absent").length;
  const totalCount = logs.length;

  return (
    <View style={styles.section}>
      {/* HEADER */}
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>
          Attendance - {selectedFilter.toUpperCase()}
        </Text>

        <Pressable style={styles.historyBtn} onPress={onPressHistory}>
          <Text style={styles.historyText}>History</Text>
        </Pressable>
      </View>

      {/* STATS GRID */}
      <View style={styles.statsRow}>
        <Pressable
          style={[styles.statBox, styles.presentBox]}
          onPress={() => setSelectedFilter("present")}
        >
          <Text style={styles.statLabel}>Present</Text>
          <Text style={styles.statValue}>{presentCount}</Text>
        </Pressable>

        <Pressable
          style={[styles.statBox, styles.lateBox]}
          onPress={() => setSelectedFilter("late")}
        >
          <Text style={styles.statLabel}>Late</Text>
          <Text style={styles.statValue}>{lateCount}</Text>
        </Pressable>

        <Pressable
          style={[styles.statBox, styles.absentBox]}
          onPress={() => setSelectedFilter("absent")}
        >
          <Text style={styles.statLabel}>Absent</Text>
          <Text style={styles.statValue}>{absentCount}</Text>
        </Pressable>

        <Pressable
          style={[styles.statBox, styles.totalBox]}
          onPress={() => setSelectedFilter("all")}
        >
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{totalCount}</Text>
        </Pressable>
      </View>

      {/* TABLE */}
      <View style={styles.logBox}>
        <View style={[styles.logRow, { backgroundColor: "#7B2CBF" }]}>
          <Text style={[styles.col, styles.headerText]}>DATE</Text>
          <Text style={[styles.col, styles.headerText]}>TIME IN</Text>
          <Text style={[styles.col, styles.headerText]}>TIME OUT</Text>
        </View>

        <ScrollView style={styles.bodyScroll}>
          {logsToShow.map((item, index) => (
            <View key={index} style={styles.logRow}>
              <View style={styles.dateCell}>
                <View
                  style={[
                    styles.statusDot,
                    item.status === "present"
                      ? { backgroundColor: "#22C55E" }
                      : item.status === "late"
                        ? { backgroundColor: "#FACC15" }
                        : { backgroundColor: "#EF4444" },
                  ]}
                />

                <Text style={{ marginLeft: 10 }}>{formatDate(item.date)}</Text>
              </View>

              <Text style={[styles.col, { color: "green" }]}>
                {item.timein || "--"}
              </Text>

              <Text style={[styles.col, { color: "red" }]}>
                {item.timeout || "--"}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  historyBtn: {
    backgroundColor: "#7B2CBF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 50,
  },

  historyText: {
    color: "#fff",
    fontWeight: "bold",
  },

  logBox: {
    backgroundColor: "#fff",
    marginVertical: 15,
    borderRadius: 15,
  },

  logRow: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },

  col: {
    flex: 1,
    textAlign: "center",
  },

  headerText: {
    color: "#fff",
    fontWeight: "bold",
  },

  dateCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 16,
  },

  bodyScroll: {
    maxHeight: 400,
    marginTop: 5,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
  },

  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    marginHorizontal: 2,
    borderRadius: 12,
  },

  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },

  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
  },

  presentBox: {
    backgroundColor: "#B1FFA2",
  },

  lateBox: {
    backgroundColor: "#FFF2D2",
  },

  absentBox: {
    backgroundColor: "#FFDBDB",
  },

  totalBox: {
    backgroundColor: "#E5E7EB",
  },

  activeFilter: {
    borderBottomWidth: 3,
    borderBottomColor: "#7B2CBF",
  },
});
