package com.example.demo.service;

import com.example.demo.entity.AvailableTime;
import com.example.demo.repository.AvailableTimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailableTimeService {

    private final AvailableTimeRepository availableTimeRepository;

    @Transactional
    public AvailableTime saveTime(AvailableTime availableTime) {
        return availableTimeRepository.save(availableTime);
    }

    public List<AvailableTime> getAllTimes() {
        return availableTimeRepository.findAll();
    }
}