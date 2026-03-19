package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "students")
@Getter @Setter
@NoArgsConstructor
public class Student {
    @Id
    @Column(name = "student_id", length = 20)
    private String studentId; // 학번

    @Column(nullable = false, length = 50)
    private String name; // 이름

    @Column(length = 100)
    private String password; // 비밀번호

    @Column(columnDefinition = "TEXT")
    private String introduction; // 자기소개

    @Column(name = "interests")
    private String interests; // 관심사 해시태그
}