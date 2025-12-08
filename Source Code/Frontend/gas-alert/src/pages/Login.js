import { useState } from "react";
import { login } from "../services/LoginAPI";

export default function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        const res = await login(username, password);

        if (res.role) {
            localStorage.setItem("username", res.username);
            localStorage.setItem("role", res.role);

            onLogin(res.role);
        } else {
            setError(res.error || "Lỗi không xác định");
        }
    };

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                fontFamily: "sans-serif"
            }}
        >
            <div
                style={{
                    width: 350,
                    padding: 30,
                    background: "white",
                    borderRadius: 15,
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                    animation: "fadeIn 0.5s ease"
                }}
            >
                <h2 style={{ textAlign: "center", marginBottom: 20, color: "#333" }}>
                    Đăng nhập
                </h2>

                <label style={{ fontSize: 14 }}>Username</label>
                <input
                    placeholder="Nhập username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                        width: "100%",
                        padding: 10,
                        marginBottom: 15,
                        borderRadius: 8,
                        border: "1px solid #ccc",
                        outline: "none",
                        transition: "0.3s",
                    }}
                    onFocus={(e) => (e.target.style.border = "1px solid #4facfe")}
                    onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
                />

                <label style={{ fontSize: 14 }}>Password</label>
                <input
                    type="password"
                    placeholder="Nhập password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        width: "100%",
                        padding: 10,
                        marginBottom: 20,
                        borderRadius: 8,
                        border: "1px solid #ccc",
                        outline: "none",
                        transition: "0.3s"
                    }}
                    onFocus={(e) => (e.target.style.border = "1px solid #4facfe")}
                    onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
                />

                <button
                    onClick={handleLogin}
                    style={{
                        width: "100%",
                        padding: 12,
                        background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontSize: 16,
                        fontWeight: "bold",
                        transition: "0.2s"
                    }}
                    onMouseOver={(e) => (e.target.style.opacity = "0.9")}
                    onMouseOut={(e) => (e.target.style.opacity = "1")}
                >
                    Đăng nhập
                </button>

                {error && (
                    <p style={{ color: "red", marginTop: 15, textAlign: "center" }}>
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}
