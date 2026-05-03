package com.example.demo.service;

import com.example.demo.controller.AvailableTimeController.TimeSlotRequest;
import com.example.demo.entity.AvailableTime;
import com.example.demo.entity.Student;
import com.example.demo.repository.AvailableTimeRepository;
import com.example.demo.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvailableTimeService {

    private final AvailableTimeRepository availableTimeRepository;
    private final StudentRepository studentRepository;

    /**
     * 로그인한 사용자의 가용 시간 조회
     */
    @Transactional(readOnly = true)
    public List<AvailableTime> getMyTimes(String loginId) {
        Student student = studentRepository.findFirstByLoginIdOrderByIdDesc(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        return availableTimeRepository.findByStudent(student);
    }

    /**
     * 로그인한 사용자의 가용 시간 등록/수정 (전체 교체 방식)
     * - 기존 가용 시간을 모두 삭제한 뒤 새로운 시간표로 교체
     */
    @Transactional
    public List<AvailableTime> updateMyTimes(String loginId, List<TimeSlotRequest> timeSlots) {
        Student student = studentRepository.findFirstByLoginIdOrderByIdDesc(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 기존 가용 시간 삭제
        availableTimeRepository.deleteByStudent(student);

        // 새로운 가용 시간 저장
        List<AvailableTime> newTimes = timeSlots.stream().map(slot -> {
            AvailableTime time = new AvailableTime();
            time.setStudent(student);
            time.setDayOfWeek(slot.getDayOfWeek());
            time.setStartTime(slot.getStartTime());
            time.setEndTime(slot.getEndTime());
            return availableTimeRepository.save(time);
        }).collect(Collectors.toList());

        return newTimes;
    }
}
