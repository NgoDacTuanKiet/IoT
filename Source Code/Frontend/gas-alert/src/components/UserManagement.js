import { useEffect, useState } from "react";
import { getUsers, createUser, deleteUser } from "../services/UserAPI";

export default function UserManagement() {
    const [users, setUsers] = useState({});
    const [newUser, setNewUser] = useState({ username: "", password: "", role: "member" });

    const loadUsers = async () => {
        const res = await getUsers();
        setUsers(res.users || {});
    };

    const addUser = async () => {
        await createUser(newUser);
        loadUsers();
    };

    const removeUser = async (id) => {
        await deleteUser(id);
        loadUsers();
    };

    return (
        <div>
            <h3>Quản lý người dùng</h3>

            {/* Add user */}
            <div style={{ marginBottom: 20 }}>
                <input
                    placeholder="Username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
                <input
                    placeholder="Password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />

                <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                    {/*<option value="ADMIN">admin</option>*/}
                    <option value="HOUSEHOLDHEAD">Chủ hộ</option>
                    <option value="MEMBER">Thành viên</option>
                </select>

                <button onClick={addUser}>Thêm</button>
            </div>

            {/* List users */}
            <table border="1" cellPadding="8">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Role</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {Object.entries(users).map(([id, u]) => (
                    <tr key={id}>
                        <td>{id}</td>
                        <td>{u.username}</td>
                        <td>{u.role}</td>
                        <td>
                            <button onClick={() => removeUser(id)}>Xóa</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
