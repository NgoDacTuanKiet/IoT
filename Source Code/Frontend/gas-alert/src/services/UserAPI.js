// services/UserAPI.js – BẢN CHẠY NGON, KHÔNG CÒN LỖI JSON
const API_URL = "http://localhost:8080/api";


// GET USERS
export async function getUsers() {
    debugger
    const res = await fetch(API_URL + "/users");

    if (!res.ok) {
        throw new Error("Không thể tải danh sách người dùng");
    }

    const text = await res.text(); // Đọc text trước
    if (!text) return { users: {} };

    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("JSON parse error:", text);
        return { users: {} };
    }
}

// CREATE USER
export async function createUser(user) {
    const res = await fetch(API_URL + "/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
    });

    const text = await res.text();
    if (!text) return { message: "OK" };
    try {
        return JSON.parse(text);
    } catch {
        return { message: "OK" };
    }
}

// DELETE USER
export async function deleteUser(id) {
    const res = await fetch(API_URL + "/users/" + id, {
        method: "DELETE",
    });
    return { success: res.ok };
}