package com.example.demo.config;

import com.example.demo.entity.Tag;
import com.example.demo.entity.TagCategory;
import com.example.demo.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataInit implements CommandLineRunner {

    private final TagRepository tagRepository;

    @Override
    public void run(String... args) {
        if (tagRepository.count() == 0) {
            // ROLE
            saveTags(TagCategory.ROLE, "프론트엔드", "백엔드", "디자이너", "PM", "데이터 엔지니어", "iOS", "안드로이드");

            // TECH
            saveTags(TagCategory.TECH, "Spring Boot", "React", "Next.js", "Java", "Python", "Figma", "AWS", "Docker", "Go", "TypeScript");

            // DOMAIN
            saveTags(TagCategory.DOMAIN, "핀테크", "AI", "블록체인", "공공서비스", "이커머스", "에듀테크", "엔터테인먼트", "헬스케어");
        }
    }

    private void saveTags(TagCategory category, String... names) {
        List<Tag> tags = Arrays.stream(names)
                .map(name -> new Tag(category, name))
                .toList();
        tagRepository.saveAll(tags);
    }
}
