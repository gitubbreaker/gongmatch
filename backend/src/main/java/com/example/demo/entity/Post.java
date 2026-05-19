package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;

    private String author;
    
    private String category;
    private String region;
    
    @Column(length = 1000)
    private String chatLink;
    
    @Builder.Default
    private int views = 0;
    
    @Builder.Default
    private int likes = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
