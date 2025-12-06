package com.iot.gas.controller;

import com.google.firebase.database.*;
import com.iot.gas.model.User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final DatabaseReference usersRef = FirebaseDatabase.getInstance().getReference("users");

    // ================================
    // 1) Lấy toàn bộ user
    // ================================
    @GetMapping
    public Map<String, Object> getAllUsers() throws InterruptedException {
        Map<String, Object> response = new HashMap<>();
        boolean[] done = {false};

        usersRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                Map<String, User> userList = new HashMap<>();

                for (DataSnapshot child : snapshot.getChildren()) {
                    User user = child.getValue(User.class);
                    userList.put(child.getKey(), user);
                }

                response.put("users", userList);
                done[0] = true;
            }

            @Override
            public void onCancelled(DatabaseError error) {
                response.put("error", error.getMessage());
                done[0] = true;
            }
        });

        while (!done[0]) Thread.sleep(5);
        return response;
    }

    // ================================
    // 2) Tạo user mới
    // ================================
    @PostMapping
    public Map<String, Object> createUser(@RequestBody User user) {
        String id = usersRef.push().getKey();

        Map<String, Object> response = new HashMap<>();
        if (id == null) {
            response.put("error", "Cannot generate ID");
            return response;
        }

        usersRef.child(id).setValueAsync(user);

        response.put("message", "User created");
        response.put("id", id);
        return response;
    }

    // ================================
    // 3) Cập nhật user
    // ================================
    @PutMapping("/{id}")
    public Map<String, Object> updateUser(@PathVariable String id, @RequestBody User user) {
        Map<String, Object> response = new HashMap<>();

        usersRef.child(id).setValueAsync(user);
        response.put("message", "User updated");

        return response;
    }

    // ================================
    // 4) Xóa user
    // ================================
    @DeleteMapping("/{id}")
    public Map<String, String> deleteUser(@PathVariable String id) {
        usersRef.child(id).removeValueAsync();

        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted");
        return response;
    }
}
