import React from "react";

function ToggleSwitch({ label, value, onToggle }) {
    return (
        <div style={{ marginBottom: 15, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: "bold" }}>{label}</span>
            <label style={{ position: "relative", display: "inline-block", width: 50, height: 24 }}>
                <input
                    type="checkbox"
                    checked={value === "ON"}
                    onChange={onToggle}
                    style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                    style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: value === "ON" ? "#4caf50" : "#ccc",
                        borderRadius: 24,
                        transition: "0.4s",
                    }}
                />
                <span
                    style={{
                        position: "absolute",
                        left: value === "ON" ? 26 : 2,
                        top: 2,
                        width: 20,
                        height: 20,
                        background: "white",
                        borderRadius: "50%",
                        transition: "0.4s",
                    }}
                />
            </label>
        </div>
    );
}

export default function Controls({
                                     fan,
                                     buzzer,
                                     servo,
                                     threshold,
                                     setThreshold,
                                     toggleFan,
                                     toggleBuzzer,
                                     toggleServo,
                                     updateThreshold
                                 }) {
    return (
        <div
            style={{
                width: 500,
                padding: 25,
                borderRadius: 15,
                background: "linear-gradient(135deg, #f8f9fa, #e0e5ec)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
        >
            <h3 style={{ marginBottom: 20 }}>Điều khiển thiết bị</h3>

            <ToggleSwitch label="Quạt" value={fan} onToggle={toggleFan} />
            <ToggleSwitch label="Còi" value={buzzer} onToggle={toggleBuzzer} />
            <ToggleSwitch label="Cửa" value={servo} onToggle={toggleServo} />

            <h4 style={{ marginTop: 25, marginBottom: 10 }}>Ngưỡng cảnh báo</h4>

            <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.valueAsNumber)}
                style={{
                    width: "100%",
                    padding: 10,
                    marginBottom: 15,
                    border: "1px solid #ccc",
                    borderRadius: 8,
                    fontSize: 16,
                    boxShadow: "inset 0 2px 5px rgba(0,0,0,0.05)"
                }}
            />

            <button
                onClick={updateThreshold}
                style={{
                    width: "100%",
                    padding: 12,
                    backgroundColor: "#007bff",
                    color: "white",
                    fontWeight: "bold",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "0.3s"
                }}
            >
                Cập nhật ngưỡng
            </button>
        </div>
    );
}
