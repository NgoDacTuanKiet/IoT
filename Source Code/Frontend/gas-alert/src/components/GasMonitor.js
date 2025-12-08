import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, set } from "firebase/database";
import GasChart from "./GasChart";
import Controls from "./Controls";

export default function GasMonitor({ role }) {
    const [currentValue, setCurrentValue] = useState("-");
    const [history, setHistory] = useState([]);

    const [fan, setFan] = useState("OFF");
    const [buzzer, setBuzzer] = useState("OFF");
    const [servo, setServo] = useState("OFF");

    const [threshold, setThreshold] = useState(30);
    useEffect(() => {
        const thrRef = ref(db, "gas/status/threshold");
        const unsub = onValue(thrRef, (snap) => {
            if (snap.exists()) {
                setThreshold(snap.val());
            }
        });
        return unsub;
    }, []);

    useEffect(() => {
        const currentRef = ref(db, "gas/current/value");
        const unsub = onValue(currentRef, (snap) => {
            setCurrentValue(snap.val() ?? "-");
        });
        return unsub;
    }, []);

    useEffect(() => {
        const historyRef = ref(db, "gas/history");
        const unsub = onValue(historyRef, (snap) => {
            const data = snap.val();
            if (!data) return setHistory([]);

            const list = Object.values(data)
                .map((item) => {
                    const ts = item.timestamp * 1000; 

                    return {
                        time: new Date(ts).toLocaleTimeString("vi-VN", {
                            timeZone: "Asia/Ho_Chi_Minh",
                            hour12: false   
                        }),
                        value: item.value,
                        rawTime: ts,       
                    };
                })
                .sort((a, b) => a.rawTime - b.rawTime)
                .slice(-20);

            setHistory(list);
        });

        return unsub;
    }, []);
    useEffect(() => {
        const devRef = ref(db, "gas/device");
        const unsub = onValue(devRef, (snap) => {
            const d = snap.val();
            if (!d) return;
            setFan(d.fan);
            setBuzzer(d.buzzer);
            setServo(d.servo);
        });
        return unsub;
    }, []);

    const toggleFan = () => {
        const newVal = fan === "ON" ? "OFF" : "ON";
        set(ref(db, "gas/device/fan"), newVal);
    };

    const toggleBuzzer = () => {
        const newVal = buzzer === "ON" ? "OFF" : "ON";
        set(ref(db, "gas/device/buzzer"), newVal);
    };

    const toggleServo = () => {
        const newVal = servo === "ON" ? "OFF" : "ON";
        set(ref(db, "gas/device/servo"), newVal);
    };

    const updateThreshold = () => {
        set(ref(db, "gas/status/threshold"), Number(threshold));

    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Hệ thống cảnh báo khí gas IoT</h2>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 20,
                    alignItems: "flex-start",
                }}
            >
                <div
                    style={{
                        flex: 1,
                        padding: 20,
                        background: currentValue >= threshold ? "#ffcccc" : "#ccffcc",
                        borderRadius: 10
                    }}
                >
                    <h3>Nồng độ hiện tại</h3>
                    <p style={{ fontSize: 50, fontWeight: "bold", margin: 0 }}>
                        {currentValue}%
                    </p>

                    {currentValue >= threshold && (
                        <p style={{ color: "red", fontWeight: "bold" }}>⚠ CẢNH BÁO NGUY HIỂM!</p>
                    )}
                </div>

                <Controls
                    fan={fan}
                    buzzer={buzzer}
                    servo={servo}
                    threshold={threshold}
                    setThreshold={setThreshold}
                    toggleFan={toggleFan}
                    toggleBuzzer={toggleBuzzer}
                    toggleServo={toggleServo}
                    updateThreshold={updateThreshold}
                    role={role}
                />
            </div>

            {/* Đồ thị */}
            <GasChart history={history} />

            <h3>Lịch sử đo (20 bản ghi gần nhất)</h3>
            {history.length === 0 ? (
                <p>Đang chờ dữ liệu...</p>
            ) : (
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        borderRadius: 10,
                        overflow: "hidden",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        marginBottom: 20,
                        fontFamily: "Arial, sans-serif",
                    }}
                >
                    <thead>
                    <tr style={{ background: "#4CAF50", color: "white", textAlign: "left" }}>
                        <th style={{ padding: 12 }}>Thời gian</th>
                        <th style={{ padding: 12 }}>Nồng độ (%)</th>
                        <th style={{ padding: 12 }}>Trạng thái</th>
                    </tr>
                    </thead>
                    <tbody>
                    {history.map((item, i) => (
                        <tr
                            key={i}
                            style={{
                                background: item.value >= threshold ? "#ffe5e5" : i % 2 === 0 ? "#f9f9f9" : "#ffffff",
                                transition: "background 0.3s",
                                cursor: "default",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#ddd"}
                            onMouseLeave={(e) => e.currentTarget.style.background = item.value >= threshold ? "#ffe5e5" : i % 2 === 0 ? "#f9f9f9" : "#ffffff"}
                        >
                            <td style={{ padding: 10 }}>{item.time}</td>
                            <td style={{ padding: 10, fontWeight: "bold" }}>{item.value}%</td>
                            <td style={{ padding: 10, fontWeight: "bold", color: item.value >= threshold ? "red" : "green" }}>
                                {item.value >= threshold ? "Nguy hiểm" : "An toàn"}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
