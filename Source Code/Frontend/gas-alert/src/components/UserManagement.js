import { useEffect, useState } from "react";
import { getUsers, createUser, deleteUser, updateUser } from "../services/UserAPI";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");
    const [showToast, setShowToast] = useState(false);

    const showNotify = (msg, type = "success") => {
        setToastMessage(msg);
        setToastType(type);
        setShowToast(true);

        setTimeout(() => setShowToast(false), 2500); // tự ẩn
    };

    const [newUser, setNewUser] = useState({
        username: "",
        password: "",
        name: "",
        phone: "",
        role: "MEMBER"
    });

    const loadUsers = async () => {
        const res = await getUsers();
        const arr = Object.entries(res.users).map(([id, u]) => ({
            id,
            ...u
        }));
        setUsers(arr);
    };

    const addUser = async () => {
        const res = await createUser(newUser);

        if (res.error) {
            showNotify("❌ " + res.error, "error");
        } else {
            showNotify("✔ Thêm người dùng thành công!");
        }

        loadUsers();
    };

    const removeUser = async (id) => {
        await deleteUser(id);
        showNotify("✔ Đã xóa người dùng!");
        loadUsers();
    };

    const startEdit = (u) => {
        setEditMode(true);
        setEditId(u.id);
        setShowForm(true);

        setNewUser({
            username: u.username,
            password: u.password,
            name: u.name,
            phone: u.phone,
            role: u.role
        });
    };

    const saveEdit = async () => {
        await updateUser(editId, newUser);

        showNotify("✔ Lưu thay đổi thành công!");

        setEditMode(false);
        setEditId(null);
        setShowForm(false);

        setNewUser({
            username: "",
            password: "",
            name: "",
            phone: "",
            role: "MEMBER"
        });

        loadUsers();
    };

    useEffect(() => {
        loadUsers();
    }, []);

    return (
        <div style={{ padding: 20, fontFamily: "Arial" }}>

            {/* ✔ TOAST NOTIFICATION */}
            {showToast && (
                <div className={`toast-box ${toastType}`}>
                    {toastMessage}
                </div>
            )}

            <h3 style={{ marginBottom: 20 }}>Quản lý người dùng</h3>

            <button
                className="btn-primary"
                onClick={() => {
                    setShowForm(!showForm);
                    setEditMode(false);
                    setEditId(null);
                    setNewUser({
                        username: "",
                        password: "",
                        name: "",
                        phone: "",
                        role: "MEMBER"
                    });
                }}
            >
                {showForm ? "Đóng" : "Thêm người dùng"}
            </button>

            {showForm && (
                <div className="form-box">
                    <h4>{editMode ? "Sửa thông tin người dùng" : "Thêm người dùng mới"}</h4>

                    <label>Username</label>
                    <input
                        placeholder="Nhập username"
                        value={newUser.username}
                        onChange={(e) => {
                            if (!editMode) setNewUser({ ...newUser, username: e.target.value });
                        }}
                        readOnly={editMode}
                        style={{
                            cursor: editMode ? "not-allowed" : "text",
                            backgroundColor: editMode ? "#eee" : "white"
                        }}
                    />

                    <label>Password</label>
                    <input
                        placeholder="Nhập password"
                        type="text"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />

                    <label>Tên</label>
                    <input
                        placeholder="Nhập tên"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />

                    <label>Số điện thoại</label>
                    <input
                        placeholder="Nhập số điện thoại"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    />

                    <label>Vai trò</label>
                    <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    >
                        <option value="ADMIN">Admin</option>
                        <option value="HOUSEHOLDHEAD">Chủ hộ</option>
                        <option value="MEMBER">Thành viên</option>
                    </select>

                    {editMode ? (
                        <button className="btn-save" onClick={saveEdit}>Lưu thay đổi</button>
                    ) : (
                        <button
                            className="btn-save"
                            onClick={async () => {
                                await addUser();
                                setShowForm(false);
                                setNewUser({
                                    username: "",
                                    password: "",
                                    name: "",
                                    phone: "",
                                    role: "MEMBER"
                                });
                            }}
                        >
                            Thêm
                        </button>
                    )}
                </div>
            )}

            <table className="styled-table">
                <thead>
                <tr>
                    <th>STT</th>
                    <th>User</th>
                    <th>Password</th>
                    <th>Tên</th>
                    <th>Số điện thoại</th>
                    <th>Role</th>
                    <th>Thao tác</th>
                </tr>
                </thead>

                <tbody>
                {users.map((u, index) => (
                    <tr key={u.id}>
                        <td>{index + 1}</td>
                        <td>{u.username}</td>
                        <td>{u.password}</td>
                        <td>{u.name}</td>
                        <td>{u.phone}</td>
                        <td>{u.role}</td>
                        <td>
                            <button className="btn-edit" onClick={() => startEdit(u)}>Sửa</button>
                            <button className="btn-delete" onClick={() => removeUser(u.id)}>Xóa</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* CSS */}
            <style>{`
                /* ===== TOAST ===== */
                .toast-box {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    font-weight: bold;
                    color: white;
                    animation: fadeIn 0.3s ease;
                    z-index: 9999;
                }
                .toast-box.success { background: #28a745; }
                .toast-box.error { background: #dc3545; }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* BUTTONS + FORM + TABLE CSS giữ nguyên */
                .btn-primary {
                    padding: 10px 20px;
                    background: #007bff;
                    border: none;
                    color: white;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: 0.2s;
                    font-size: 14px;
                }
                .btn-primary:hover {
                    background: #0056d2;
                    transform: scale(1.03);
                }

                .form-box {
                    margin-top: 20px;
                    padding: 20px;
                    width: 350px;
                    border-radius: 10px;
                    background: white;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .form-box input, .form-box select {
                    padding: 8px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    width: 100%;
                    transition: 0.2s;
                }
                .form-box input:focus, .form-box select:focus {
                    border-color: #007bff;
                    box-shadow: 0 0 5px rgba(0,123,255,0.5);
                }

                .btn-save {
                    padding: 10px;
                    background: #28a745;
                    border: none;
                    color: white;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: 0.2s;
                    width: 100%;
                }
                .btn-save:hover {
                    background: #1e7e34;
                    transform: scale(1.03);
                }

                .styled-table {
                    margin-top: 25px;
                    width: 100%;
                    border-collapse: collapse;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }

                .styled-table th {
                    background: #007bff;
                    color: white;
                    padding: 12px;
                }

                .styled-table td {
                    padding: 10px;
                    border-bottom: 1px solid #ddd;
                }

                .styled-table tr:hover {
                    background: #f5f5f5;
                }

                .btn-edit {
                    padding: 5px 10px;
                    background: #ffc107;
                    border: none;
                    margin-right: 5px;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .btn-edit:hover {
                    background: #e0a800;
                    transform: scale(1.05);
                }

                .btn-delete {
                    padding: 5px 10px;
                    background: #dc3545;
                    border: none;
                    color: white;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .btn-delete:hover {
                    background: #bd2130;
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
}
