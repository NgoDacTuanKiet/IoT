#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <LiquidCrystal.h>
#include <Servo.h>
#include <Button.h>
#include <HTTPClient.h>
#include <WebSocketsClient.h>

// ------------------------ WiFi ------------------------
const char* ssid = "YourSSID";
const char* password = "YourPASS";
WebSocketsClient webSocket;

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
#define BUZZER_ON 1
#define BUZZER_OFF 0

// ------------------------ Relay ------------------------
#define RELAY1  22
#define RELAY2  21
bool relay1State = false;
bool relay2State = false;
bool autoManual = true; // AUTO = true, MANUAL = false

// ------------------------ MQ2 & Fire Sensor ------------------------
#define SENSOR_MQ2  35
#define SENSOR_FIRE 34
#define SENSOR_FIRE_ON  0
#define SENSOR_FIRE_OFF 1
int mq2Threshold = 4000;

// ------------------------ Servo ------------------------
Servo myservo1;
Servo myservo2;
#define SERVO1_PIN 25
#define SERVO2_PIN 32
int windowState = 0;

// ------------------------ Nút nhấn ------------------------
#define buttonPinMENU    5
#define buttonPinDOWN    18
#define buttonPinUP      19
#define buttonPinONOFF   21
Button buttonMENU(buttonPinMENU);
Button buttonDOWN(buttonPinDOWN);
Button buttonUP(buttonPinUP);
Button buttonONOFF(buttonPinONOFF);

// ------------------------ Khai báo hàm ------------------------
void ConnectWifi();
int readGasSensor();
int readFireSensor();
void ShowGasOnOLED(int gasValue, int fireValue);
void getData(String jsonStr);
void onEventCallback(String event);
void controlBuzzer(bool state);
void controlRelayFan(bool relay1, bool relay2);
void SendData(int gasValue, int fireValue, bool buzzerState, bool fanState);
void handleButtons();
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length);

// ------------------------ Setup ------------------------
void setup() {
    Serial.begin(115200);

    pinMode(BUZZER, OUTPUT);
    pinMode(RELAY1, OUTPUT);
    pinMode(RELAY2, OUTPUT);
    pinMode(SENSOR_MQ2, INPUT);
    pinMode(SENSOR_FIRE, INPUT);

    // LCD
    My_LCD.begin(16, 2);
    My_LCD.print("Init System...");

    // Servo
    myservo1.attach(SERVO1_PIN);
    myservo2.attach(SERVO2_PIN);

    // Nút nhấn
    buttonMENU.begin();
    buttonDOWN.begin();
    buttonUP.begin();
    buttonONOFF.begin();

    ConnectWifi();

    // WebSocket setup
    webSocket.begin("yourserver.com", 81, "/ws"); // server và port WebSocket
    webSocket.onEvent(webSocketEvent);
}

// ------------------------ Loop ------------------------
void loop() {
    int gasValue = readGasSensor();
    int fireValue = readFireSensor();

    ShowGasOnOLED(gasValue, fireValue);

    // Kiểm tra ngưỡng
    if (gasValue >= mq2Threshold || fireValue == SENSOR_FIRE_ON) {
        controlBuzzer(true);
        controlRelayFan(true, true);
    } else {
        if (autoManual) { // chỉ tắt khi chế độ AUTO
            controlBuzzer(false);
            controlRelayFan(false, false);
        }
    }

    SendData(gasValue, fireValue, relay1State, relay2State);

    handleButtons(); // xử lý nút nhấn

    webSocket.loop(); // xử lý WebSocket

    delay(1000);
}

// ------------------------ Hàm WiFi ------------------------
void ConnectWifi() {
    Serial.print("Connecting to WiFi...");
    WiFi.begin(ssid, password);
    int retry = 0;
    while (WiFi.status() != WL_CONNECTED && retry < 20) {
        delay(500);
        Serial.print(".");
        retry++;
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("Connected to WiFi!");
    } else {
        Serial.println("Failed to connect WiFi");
    }
}

// ------------------------ Đọc cảm biến ------------------------
int readGasSensor() {
    return analogRead(SENSOR_MQ2);
}

int readFireSensor() {
    return digitalRead(SENSOR_FIRE);
}

// ------------------------ Hiển thị LCD ------------------------
void ShowGasOnOLED(int gasValue, int fireValue) {
    My_LCD.clear();
    My_LCD.setCursor(0, 0);
    My_LCD.print("Gas:");
    My_LCD.print(gasValue);
    My_LCD.setCursor(0, 1);
    if (gasValue >= mq2Threshold || fireValue == SENSOR_FIRE_ON) {
        My_LCD.print("ALERT!");
    } else {
        My_LCD.print("SAFE");
    }
}

// ------------------------ Xử lý dữ liệu từ server ------------------------
void getData(String jsonStr) {
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, jsonStr);
    if (!error) {
        const char* type = doc["type"];
        const char* message = doc["message"];
        Serial.print("Type: "); Serial.println(type);
        Serial.print("Message: "); Serial.println(message);
    }
}

// ------------------------ Xử lý sự kiện WebSocket ------------------------
void onEventCallback(String event) {
    if (event == "BUZZER_ON") controlBuzzer(true);
    else if (event == "BUZZER_OFF") controlBuzzer(false);
    else if (event == "FAN_ON") controlRelayFan(true, true);
    else if (event == "FAN_OFF") controlRelayFan(false, false);
    else if (event == "AUTO_MODE") autoManual = true;
    else if (event == "MANUAL_MODE") autoManual = false;
}

// ------------------------ Hàm WebSocket ------------------------
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_TEXT:
            String msg = String((char*)payload);
            onEventCallback(msg);
            break;
        default:
            break;
    }
}

// ------------------------ Điều khiển buzzer & relay ------------------------
void controlBuzzer(bool state) {
    digitalWrite(BUZZER, state ? BUZZER_ON : BUZZER_OFF);
}

void controlRelayFan(bool relay1, bool relay2) {
    relay1State = relay1;
    relay2State = relay2;
    digitalWrite(RELAY1, relay1 ? HIGH : LOW);
    digitalWrite(RELAY2, relay2 ? HIGH : LOW);
}

// ------------------------ Gửi dữ liệu HTTP ------------------------
void SendData(int gasValue, int fireValue, bool buzzerState, bool fanState) {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin("http://yourserver.com/data");
        http.addHeader("Content-Type", "application/json");
        String payload;
        payload += "{";
        payload += "\"gas\":" + String(gasValue) + ",";
        payload += "\"fire\":" + String(fireValue) + ",";
        payload += "\"buzzer\":" + String(buzzerState ? 1 : 0) + ",";
        payload += "\"fan\":" + String(fanState ? 1 : 0);
        payload += "}";
        int code = http.POST(payload);
        Serial.print("HTTP Response code: "); Serial.println(code);
        http.end();
    }
}

// ------------------------ Xử lý nút nhấn ------------------------
void handleButtons() {
    buttonMENU.read();
    buttonDOWN.read();
    buttonUP.read();
    buttonONOFF.read();

    if (buttonONOFF.wasPressed()) {
        autoManual = !autoManual; // đổi chế độ AUTO/MANUAL
        Serial.print("Mode changed to: "); Serial.println(autoManual ? "AUTO" : "MANUAL");
    }
    // Thêm xử lý các nút khác nếu cần
}
```

---

