#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <WebServer.h>
#include <LiquidCrystal.h>
#include <ESP32Servo.h>
// #include <Button.h>

// ------------------------ WiFi ------------------------
const char* ssid = "iPhone";
const char* password = "vannhucu";

// ------------------------ Firebase ------------------------
#define FIREBASE_HOST "iot-gas-6bce5-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "ys2pnoqLxJIzcuGSUnwhzjn2LAcKitjYaKVWNWp8"

FirebaseData fbdo;
FirebaseData stream;
FirebaseData streamThreshold;
FirebaseAuth auth;
FirebaseConfig config;

// ------------------------ LCD1602 ------------------------
#define LCD_RS  15
#define LCD_EN  13
#define LCD_D4  12
#define LCD_D5  14
#define LCD_D6  27
#define LCD_D7  26
LiquidCrystal My_LCD(LCD_RS, LCD_EN, LCD_D4, LCD_D5, LCD_D6, LCD_D7);

// ------------------------ Buzzer ------------------------
#define BUZZER  23
bool buzzerState = false;

// ------------------------ Relay ------------------------
#define RELAY1  22
#define RELAY2  21
bool fanState = false;

// ------------------------ MQ2 ------------------------
#define SENSOR_MQ2  35
int mq2Threshold = 5;

// ------------------------ Flame Sensor ------------------------
#define FLAME_SENSOR 34
bool fireDetected = false;


// ------------------------ Servo ------------------------`
Servo myservo1;
Servo myservo2;
#define SERVO1_PIN 25
#define SERVO2_PIN 32
bool windowState = false;

// ------------------------ Button ------------------------
// #define buttonPinMENU    5
// #define buttonPinDOWN    18
// #define buttonPinUP      19
// #define buttonPinONOFF   21
// Button buttonMENU(buttonPinMENU);
// Button buttonDOWN(buttonPinDOWN);
// Button buttonUP(buttonPinUP);
// Button buttonONOFF(buttonPinONOFF);

// ----------------------------------------------------------------------
// WiFi
// ----------------------------------------------------------------------
void ConnectWifi() {
    Serial.println("Dang ket noi WiFi...");
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(400);
        Serial.print(".");
    }
    Serial.println("\nDa ket noi WiFi!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
}

// Đọc MQ2 và đổi sang %
int readGasSensor() {
    int rawValue = analogRead(SENSOR_MQ2);
    return map(rawValue, 0, 4095, 0, 100);
}
// Đọc cảm biến lửa
bool readFireSensor() {
    int fireValue = digitalRead(FLAME_SENSOR);
    fireDetected = (fireValue == LOW);  // LOW = có lửa
    return fireDetected;
}

// Hiển thị LCD
void ShowGasOnLCD(int gasPercent, bool warning) {
    My_LCD.clear();
    My_LCD.setCursor(0, 0);
    My_LCD.print("Gas: ");
    My_LCD.print(gasPercent);
    My_LCD.print("%");

    My_LCD.setCursor(0, 1);
    if (warning)
        My_LCD.print("WARNING!");
    else
        My_LCD.print("Gas Normal    ");
}

// ----------------------------------------------------------------------
// Gửi Firebase
// ----------------------------------------------------------------------
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 5000;

void SendData(int gasPercent, bool warning, bool buzzerState, bool fanState) {
    unsigned long now = millis();
    if (now - lastSendTime < sendInterval) return;
    lastSendTime = now;

    Firebase.RTDB.setInt(&fbdo, "/gas/current/value", gasPercent);
    Firebase.RTDB.setBool(&fbdo, "/gas/current/warning", warning);

    Firebase.RTDB.setString(&fbdo, "/gas/device/buzzer", buzzerState ? "ON" : "OFF");
    Firebase.RTDB.setString(&fbdo, "/gas/device/fan", fanState ? "ON" : "OFF");
    Firebase.RTDB.setString(&fbdo, "/gas/device/servo", windowState ? "ON" : "OFF");

    String ts = String(now);
    Firebase.RTDB.setInt(&fbdo, "/gas/history/" + ts + "/value", gasPercent);
    Firebase.RTDB.setInt(&fbdo, "/gas/history/" + ts + "/timestamp", now);

    Serial.println("Đã gửi dữ liệu Firebase (ESP_Client)");
}

// ----------------------------------------------------------------------
// Điều khiển thiết bị
// ----------------------------------------------------------------------
void controlBuzzer(int gasPercent, bool warning, bool serverControl) {
    buzzerState = warning || serverControl;
    digitalWrite(BUZZER, buzzerState ? HIGH : LOW);
}

void controlRelayFan(int gasPercent, bool warning, bool serverControl) {
    fanState = warning || serverControl;
    digitalWrite(RELAY1, fanState ? HIGH : LOW);
}

void controlServo(int gasPercent, bool warning, bool serverControl) {
    bool openWindow = warning || serverControl;

    if (openWindow && windowState == 0) {
        myservo1.write(90);
        myservo2.write(90);
        windowState = 1;
        Serial.println("Servo: Mo cua so");
    }
    else if (!openWindow && windowState == 1) {
        myservo1.write(0);
        myservo2.write(0);
        windowState = 0;
        Serial.println("Servo: Dong cua so");
    }
}

// ----------------------------------------------------------------------
// STREAM từ Firebase
// ----------------------------------------------------------------------
String fanStateServer = "OFF";
String buzzerStateServer = "OFF";
String windowStateServer = "OFF";

void streamCallback(FirebaseStream data) {
    String path = data.dataPath();
    String value = data.stringData();

    if (path == "/fan") {
        fanStateServer = value;
    }
    if (path == "/buzzer") {
        buzzerStateServer = value;
    }
    if (path == "/servo") {
        windowStateServer = value;
    }

    Serial.print("[Stream] ");
    Serial.print(path);
    Serial.print(" = ");
    Serial.println(value);
}

void streamCallbackThreshold(FirebaseStream data) {
    String path = data.dataPath();

    if (path == "/threshold") {
        mq2Threshold = data.intData();
        Serial.print("Threshold = ");
        Serial.println(mq2Threshold);
    }
}


void streamTimeout(bool timeout) {
    if (timeout) Serial.println("Stream timeout, reconnecting...");
}

// ----------------------------------------------------------------------
// SETUP
// ----------------------------------------------------------------------
void setup() {
    Serial.begin(115200);

    pinMode(BUZZER, OUTPUT);
    pinMode(RELAY1, OUTPUT);
    pinMode(SENSOR_MQ2, INPUT);
    pinMode(FLAME_SENSOR, INPUT);


    My_LCD.begin(16, 2);

    myservo1.attach(SERVO1_PIN);
    myservo2.attach(SERVO2_PIN);

    // buttonMENU.begin();
    // buttonDOWN.begin();
    // buttonUP.begin();
    // buttonONOFF.begin();

    ConnectWifi();

    // Firebase config
    config.database_url = FIREBASE_HOST;
    config.signer.tokens.legacy_token = FIREBASE_AUTH;


    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);

    // Bắt đầu stream
    Firebase.RTDB.beginStream(&stream, "/gas/device");
    Firebase.RTDB.setStreamCallback(&stream, streamCallback, streamTimeout);

    Firebase.RTDB.beginStream(&streamThreshold, "/gas/status");
    Firebase.RTDB.setStreamCallback(&streamThreshold, streamCallbackThreshold, streamTimeout);
}

// ----------------------------------------------------------------------
// LOOP
// ----------------------------------------------------------------------
void loop() {
    int gasLevel = readGasSensor();
    bool fireWarning = readFireSensor();
    bool warning = gasLevel >= mq2Threshold;
    if(fireWarning) warning = true;

    bool serverBuzzer = (buzzerStateServer == "ON");
    bool serverFan = (fanStateServer == "ON");
    bool serverServo = (windowStateServer == "ON");

    controlBuzzer(gasLevel, warning, serverBuzzer);
    controlRelayFan(gasLevel, warning, serverFan);
    controlServo(gasLevel, warning, serverServo);

    ShowGasOnLCD(gasLevel, warning);

    SendData(gasLevel, warning, buzzerState, fanState);

    // buttonMENU.read();
    // buttonDOWN.read();
    // buttonUP.read();
    // buttonONOFF.read();
}
