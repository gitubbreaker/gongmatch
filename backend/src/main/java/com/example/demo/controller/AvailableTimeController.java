package com.example.demo.controller;

import com.example.demo.entity.AvailableTime;
import com.example.demo.service.AvailableTimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/times")
@RequiredArgsConstructor
public class AvailableTimeController {

    private final AvailableTimeService availableTimeService;

    @PostMapping("/add")
    public AvailableTime addTime(@RequestBody AvailableTime availableTime) {
        return availableTimeService.saveTime(availableTime);
    }

    @GetMapping
    public List<AvailableTime> getTimes() {
        return availableTimeService.getAllTimes();
    }
}