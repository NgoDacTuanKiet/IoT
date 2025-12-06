package com.iot.gas.controller;

import com.google.firebase.database.*;
import com.iot.gas.model.User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) throws Exception {

        String username = body.get("username");
        String password = body.get("password");

        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("users");

        Map<String, Object> response = new HashMap<>();
        boolean[] done = {false};

        ref.orderByChild("username").equalTo(username)
                .addListenerForSingleValueEvent(new ValueEventListener() {

                    @Override
                    public void onDataChange(DataSnapshot snapshot) {
                        if (!snapshot.exists()) {
                            response.put("error", "User không tồn tại");
                            done[0] = true;
                            return;
                        }

                        for (DataSnapshot child : snapshot.getChildren()) {
                            try {
                                User user = child.getValue(User.class);

                                if (user == null) {
                                    response.put("error", "Lỗi dữ liệu user null");
                                    done[0] = true;
                                    return;
                                }

                                if (!password.equals(user.getPassword())) {
                                    response.put("error", "Sai mật khẩu");
                                    done[0] = true;
                                    return;
                                }

                                // Thành công → trả về role để FE tự phân quyền
                                response.put("message", "Đăng nhập thành công");
                                response.put("username", user.getUsername());
                                response.put("role", user.getRole());

                            } catch (Exception e) {
                                response.put("error", "Lỗi xử lý dữ liệu: " + e.getMessage());
                            }
                        }

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
}
