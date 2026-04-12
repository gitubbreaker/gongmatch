package com.example.demo.repository;

import com.example.demo.entity.Tag;
import com.example.demo.entity.TagCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findByCategoryAndName(TagCategory category, String name);
    List<Tag> findByCategory(TagCategory category);
}