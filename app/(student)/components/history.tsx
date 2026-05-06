import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import API from "../../../services/api";

type HistoryProps = {
  onBack: () => void;
  studentId: number;
  month: number;
  year: number;
};

type FilterType = "all" | "present" | "late" | "absent";

export default function History({
  onBack,
  studentId,
  month,
  year,
}: HistoryProps) {
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

  const monthNames = [
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

  const fetchHistory = async () => {
    try {
      const res = await API.get(`/attendance/student-history/${studentId}`, {
        params: { month, year },
      });

      const data = res.data.attendance;

      const today = new Date();
      const selectedDate = new Date(year, month - 1);

      const isCurrentMonth =
        today.getFullYear() === year && today.getMonth() + 1 === month;

      const isFutureMonth = selectedDate > today;

      if (isFutureMonth) {
        setHistoryData([]);
        return;
      }

      const map = new Map<number, any>();

      data.forEach((item: any) => {
        const d = new Date(item.attendance_date || item.date);
        map.set(d.getDate(), item);
      });

      const maxDay = isCurrentMonth
        ? today.getDate()
        : new Date(year, month, 0).getDate();

      const fullList: any[] = [];

      for (let day = 1; day <= maxDay; day++) {
        const currentDate = new Date(year, month - 1, day);
        const record = map.get(day);

        const isWeekend =
          currentDate.getDay() === 0 || currentDate.getDay() === 6;

        let status: "present" | "late" | "absent" | "weekend" = "absent";

        if (isWeekend) {
          status = "weekend";
        } else if (record?.timein) {
          status = getStatus(record.timein);
        } else {
          status = "absent";
        }

        fullList.push({
          date: currentDate,
          displayDate: `${monthNames[month - 1]} ${day}`,
          timein: record?.timein,
          timeout: record?.timeout,
          status,
        });
      }

      setHistoryData(fullList);
    } catch (err) {
      console.log("History fetch error:", err);
    }
  };

  useEffect(() => {
    if (studentId) fetchHistory();
  }, [studentId, month, year]);

  // FILTER DATA
  const filteredData = historyData.filter((item) => {
    if (selectedFilter === "all") return true;
    return item.status === selectedFilter;
  });

  // COUNTS
  const presentCount = historyData.filter((l) => l.status === "present").length;

  const lateCount = historyData.filter((l) => l.status === "late").length;

  const absentCount = historyData.filter((l) => l.status === "absent").length;

  const totalCount = historyData.length;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Attendance History</Text>

        <Pressable style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <Pressable
          style={[styles.statBox, styles.present]}
          onPress={() => setSelectedFilter("present")}
        >
          <Text style={styles.statLabel}>Present</Text>
          <Text style={styles.statValue}>{presentCount}</Text>
        </Pressable>

        <Pressable
          style={[styles.statBox, styles.late]}
          onPress={() => setSelectedFilter("late")}
        >
          <Text style={styles.statLabel}>Late</Text>
          <Text style={styles.statValue}>{lateCount}</Text>
        </Pressable>

        <Pressable
          style={[styles.statBox, styles.absent]}
          onPress={() => setSelectedFilter("absent")}
        >
          <Text style={styles.statLabel}>Absent</Text>
          <Text style={styles.statValue}>{absentCount}</Text>
        </Pressable>

        <Pressable
          style={[styles.statBox, styles.total]}
          onPress={() => setSelectedFilter("all")}
        >
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{totalCount}</Text>
        </Pressable>
      </View>

      <ScrollView>
        <View style={styles.logBox}>
          {/* HEADER */}
          <View style={styles.headerRow}>
            <Text style={styles.headerText}>DATE</Text>
            <Text style={styles.headerText}>TIME IN</Text>
            <Text style={styles.headerText}>TIME OUT</Text>
          </View>

          {/* BODY */}
          <ScrollView style={styles.bodyScroll}>
            {filteredData.length === 0 ? (
              <Text style={{ marginTop: 10 }}>No records found</Text>
            ) : (
              filteredData.map((log, i) => (
                <View key={i} style={styles.rowCard}>
                  {/* DATE + DOT */}
                  <View style={styles.dateCell}>
                    <View
                      style={[
                        styles.statusDot,
                        log.status === "present"
                          ? { backgroundColor: "#22C55E" }
                          : log.status === "late"
                            ? { backgroundColor: "#FACC15" }
                            : log.status === "absent"
                              ? { backgroundColor: "#EF4444" }
                              : {
                                  backgroundColor: "#dad7d7",
                                  borderWidth: 1,
                                  borderColor: "#D1D5DB",
                                },
                      ]}
                    />
                    <Text style={{ marginLeft: 8 }}>{log.displayDate}</Text>
                  </View>

                  <Text style={[styles.col, { color: "green" }]}>
                    {log.timein || "--"}
                  </Text>

                  <Text style={[styles.col, { color: "red" }]}>
                    {log.timeout || "--"}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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

  title: {
    fontSize: 20,
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

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
  },

  present: {
    backgroundColor: "#B1FFA2",
    padding: 12,
    borderRadius: 10,
  },

  late: {
    backgroundColor: "#FFF2D2",
    padding: 12,
    borderRadius: 10,
  },

  absent: {
    backgroundColor: "#FFDBDB",
    padding: 12,
    borderRadius: 10,
  },

  total: {
    backgroundColor: "#E5E7EB",
    padding: 12,
    borderRadius: 10,
  },

  logBox: {
    marginTop: 10,
  },

  headerRow: {
    flexDirection: "row",
    backgroundColor: "#7B2CBF",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },

  headerText: {
    flex: 1,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
  },

  rowCard: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
  },

  col: {
    flex: 1,
    fontSize: 14,
    textAlign: "center",
  },

  dateCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  bodyScroll: {
    maxHeight: 400,
    marginTop: 5,
    marginBottom: 10,
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
});
