package com.iot.gas.config;

import java.io.FileInputStream;
import java.io.IOException;

import org.springframework.context.annotation.Configuration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import jakarta.annotation.PostConstruct;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void init() throws IOException {
        FileInputStream serviceAccount =
                new FileInputStream("src/main/resources/iot-gas-6bce5-firebase-adminsdk-fbsvc-ccde7b4a00.json");

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .setDatabaseUrl("https://iot-gas-6bce5-default-rtdb.asia-southeast1.firebasedatabase.app/")
                .build();

        FirebaseApp.initializeApp(options);
    }
}
