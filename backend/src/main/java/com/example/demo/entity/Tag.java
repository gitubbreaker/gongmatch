package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tags")
@Getter @Setter
@NoArgsConstructor
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tag_id")
    private Long tagId;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private TagCategory category; // ROLE, TECH, DOMAIN

    @Column(length = 50, nullable = false)
    private String name; // 프론트엔드, Spring Boot, AI 등

    public Tag(TagCategory category, String name) {
        this.category = category;
        this.name = name;
    }
}
