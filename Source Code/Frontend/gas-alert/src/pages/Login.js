import { useState } from "react";
import { login } from "../services/LoginAPI";

export default function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        const res = await login(username, password);

        if (res.role) {
            // Lưu dữ liệu đơn giản
            localStorage.setItem("username", res.username);
            localStorage.setItem("role", res.role);

            onLogin(res.role);
        } else {
            setError(res.error || "Lỗi không xác định");
        }
    };

    return (
        <div style={{ maxWidth: 300, margin: "50px auto" }}>
            <h2>Đăng nhập</h2>

            <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />

            <button
                onClick={handleLogin}
                style={{ width: "100%", padding: 10 }}
            >
                Đăng nhập
            </button>

            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}
