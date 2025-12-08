import { useState } from "react";
import Login from "./pages/Login";
import GasMonitor from "./components/GasMonitor";
import UserManagement from "./components/UserManagement";

function App() {
    const [role, setRole] = useState(localStorage.getItem("role"));
    const [page, setPage] = useState("monitor"); // monitor | users

    if (!role) {
        return <Login onLogin={setRole} />;
    }

    const logout = () => {
        localStorage.removeItem("role");
        setRole(null);
    };

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2></h2>
                <button
                    onClick={logout}
                    style={{
                        padding: "8px 15px",
                        background: "#e04857",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                >
                    Đăng xuất
                </button>
            </div>

            <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
                <button
                    onClick={() => setPage("monitor")}
                    style={{
                        padding: "10px 15px",
                        background: page === "monitor" ? "#007bff" : "#cccccc",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer"
                    }}
                >
                    Giám sát khí gas
                </button>

                {role === "ADMIN" && (
                    <button
                        onClick={() => setPage("users")}
                        style={{
                            padding: "10px 15px",
                            background: page === "users" ? "#007bff" : "#cccccc",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer"
                        }}
                    >
                        Quản lý người dùng
                    </button>
                )}
            </div>

            {/* PAGE CONTENT */}
            {page === "monitor" && <GasMonitor role={role} />}
            {page === "users" && role === "ADMIN" && <UserManagement />}
        </div>
    );
}

export default App;
