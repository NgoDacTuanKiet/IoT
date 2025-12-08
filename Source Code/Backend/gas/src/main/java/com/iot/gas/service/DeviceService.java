//package com.iot.gas.service;
//
//import com.google.firebase.database.*;
//import com.iot.gas.model.DeviceControl;
//import org.springframework.stereotype.Service;
//
//@Service
//public class DeviceService {
//
//    private DatabaseReference ref = FirebaseDatabase.getInstance().getReference("gas/device");
//
//    public void updateDevice(DeviceControl control) {
//        ref.child("fan").setValueAsync(control.isFan());
//        ref.child("buzzer").setValueAsync(control.isBuzzer());
//    }
//}
