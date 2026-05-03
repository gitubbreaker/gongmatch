package com.example.demo.controller;

import com.example.demo.scheduler.PublicDataScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class TestController {

    private final PublicDataScheduler publicDataScheduler;
    private final com.example.demo.repository.StudentRepository studentRepository;

    @GetMapping("/api/test/fetch-public-data")
    public String fetchPublicData() {
        publicDataScheduler.fetchPublicData();
        return "공공데이터 강제 수집 및 DB 저장 완료!";
    }

    @GetMapping("/api/test/fix-duplicates")
    public String fixDuplicates() {
        java.util.List<com.example.demo.entity.Student> allStudents = studentRepository.findAll();
        java.util.Map<String, java.util.List<com.example.demo.entity.Student>> grouped = allStudents.stream()
            .collect(java.util.stream.Collectors.groupingBy(com.example.demo.entity.Student::getLoginId));
        
        StringBuilder sb = new StringBuilder();
        for (java.util.Map.Entry<String, java.util.List<com.example.demo.entity.Student>> entry : grouped.entrySet()) {
            java.util.List<com.example.demo.entity.Student> list = entry.getValue();
            if (list.size() > 1) {
                list.sort(java.util.Comparator.comparing(com.example.demo.entity.Student::getId));
                com.example.demo.entity.Student oldStudent = list.get(0);
                com.example.demo.entity.Student newStudent = list.get(list.size() - 1);
                
                oldStudent.setPassword(newStudent.getPassword());
                studentRepository.save(oldStudent);
                
                for (int i = 1; i < list.size(); i++) {
                    studentRepository.delete(list.get(i));
                }
                sb.append("Fixed duplicates for ").append(entry.getKey()).append(". ");
            }
        }
        return sb.length() > 0 ? sb.toString() : "No duplicates found.";
    }
}
