const API_URL = "http://localhost:8080/api";

export async function login(username, password) {
    const res = await fetch(API_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Đăng nhập thất bại");
    }

    return await res.json();
}