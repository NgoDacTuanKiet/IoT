package com.iot.gas.model;

public class DeviceStatus {
    private boolean fan;
    private boolean buzzer;

    public DeviceStatus() {}

    public boolean isFan() { return fan; }
    public boolean isBuzzer() { return buzzer; }

    public void setFan(boolean fan) { this.fan = fan; }
    public void setBuzzer(boolean buzzer) { this.buzzer = buzzer; }
}
