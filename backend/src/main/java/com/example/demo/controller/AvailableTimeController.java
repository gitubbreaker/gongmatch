package com.example.demo.controller;

import com.example.demo.entity.AvailableTime;
import com.example.demo.service.AvailableTimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AvailableTimeController {

    private final AvailableTimeService availableTimeService;

    @PostMapping("/available-time")
    public AvailableTime addTime(@RequestBody AvailableTime availableTime) {
        return availableTimeService.saveTime(availableTime);
    }
}