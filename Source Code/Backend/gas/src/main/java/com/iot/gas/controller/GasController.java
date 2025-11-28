package com.iot.gas.controller;

import com.iot.gas.model.DeviceControl;
import com.iot.gas.model.GasCurrent;
import com.iot.gas.model.GasHistoryItem;
import com.iot.gas.service.DeviceService;
import com.iot.gas.service.GasService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gas")
@CrossOrigin
public class GasController {

    private final GasService gasService;
    private final DeviceService deviceService;

    public GasController(GasService gasService, DeviceService deviceService) {
        this.gasService = gasService;
        this.deviceService = deviceService;
    }

    @GetMapping("/current")
    public GasCurrent getCurrent() throws Exception {
        return gasService.getCurrent();
    }

    @GetMapping("/history")
    public List<GasHistoryItem> getHistory() throws Exception {
        return gasService.getHistory();
    }

    @PostMapping("/device")
    public String updateDevice(@RequestBody DeviceControl control) {
        deviceService.updateDevice(control);
        return "OK";
    }
}
