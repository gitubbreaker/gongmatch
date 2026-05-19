package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private Student reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_id", nullable = false)
    private Student reviewee;

    private String projectName;

    private int timeScore;
    private int commScore;
    private int skillScore;
    private int mannerScore;

    @Column(columnDefinition = "TEXT")
    private String goodTags;

    @Column(columnDefinition = "TEXT")
    private String badTags;

    private String rematch; // "yes", "not_sure", "no"

    @Column(columnDefinition = "TEXT")
    private String reviewText;

    private String visibility; // "public", "private"

    @CreationTimestamp
    private LocalDateTime createdAt;
}
