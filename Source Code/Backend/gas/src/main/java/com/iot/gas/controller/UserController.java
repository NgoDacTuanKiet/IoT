package com.iot.gas.controller;

import com.google.api.core.ApiFuture;
import com.google.firebase.database.*;
import com.iot.gas.model.User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final DatabaseReference usersRef = FirebaseDatabase.getInstance().getReference("users");

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

    @PostMapping
    public Map<String, Object> createUser(@RequestBody User user) throws InterruptedException {
        Map<String, Object> response = new HashMap<>();

        Query checkQuery = usersRef.orderByChild("username").equalTo(user.getUsername());

        final boolean[] exists = {false};
        CountDownLatch latch = new CountDownLatch(1);

        checkQuery.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                exists[0] = snapshot.exists();
                latch.countDown();
            }

            @Override
            public void onCancelled(DatabaseError error) {
                latch.countDown();
            }
        });

        latch.await();

        if (exists[0]) {
            response.put("error", "Username đã tồn tại");
            return response;
        }

        String id = usersRef.push().getKey();
        if (id == null) {
            response.put("error", "Cannot generate ID");
            return response;
        }

        usersRef.child(id).setValueAsync(user);

        response.put("message", "User created");
        response.put("id", id);
        return response;
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateUser(@PathVariable String id, @RequestBody User user) {
        Map<String, Object> response = new HashMap<>();

        usersRef.child(id).setValueAsync(user);
        response.put("message", "User updated");

        return response;
    }

    @DeleteMapping("/{id}")
    public Map<String, String> deleteUser(@PathVariable String id) {
        usersRef.child(id).removeValueAsync();

        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted");
        return response;
    }
}
