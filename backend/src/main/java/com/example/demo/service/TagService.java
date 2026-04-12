package com.example.demo.service;

import com.example.demo.entity.Student;
import com.example.demo.entity.StudentTag;
import com.example.demo.entity.Tag;
import com.example.demo.entity.TagCategory;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.StudentTagRepository;
import com.example.demo.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final StudentTagRepository studentTagRepository;
    private final StudentRepository studentRepository;

    private static final int MAX_TAGS = 10;

    /**
     * 전체 태그 목록 조회 (인증 불필요)
     */
    @Transactional(readOnly = true)
    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    /**
     * 카테고리별 태그 목록 조회 (인증 불필요)
     */
    @Transactional(readOnly = true)
    public List<Tag> getTagsByCategory(String category) {
        TagCategory tagCategory = TagCategory.fromKorean(category);
        return tagRepository.findByCategory(tagCategory);
    }

    /**
     * 로그인한 사용자의 해시태그 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Tag> getMyTags(String loginId) {
        Student student = studentRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        List<StudentTag> studentTags = studentTagRepository.findByStudent(student);
        return studentTags.stream()
                .map(StudentTag::getTag)
                .collect(Collectors.toList());
    }

    /**
     * 로그인한 사용자의 해시태그 등록/수정 (전체 교체 방식)
     * - 기존 태그 매핑을 모두 삭제한 뒤 새로운 태그 목록으로 교체
     * - 최대 10개까지 등록 가능
     */
    @Transactional
    public List<Tag> updateMyTags(String loginId, List<TagRequest> tagRequests) {
        if (tagRequests.size() > MAX_TAGS) {
            throw new IllegalArgumentException("해시태그는 최대 " + MAX_TAGS + "개까지 등록할 수 있습니다.");
        }

        Student student = studentRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 기존 매핑 삭제
        studentTagRepository.deleteByStudent(student);

        // 새로운 태그 매핑 생성
        List<Tag> resultTags = tagRequests.stream().map(req -> {
            TagCategory tagCategory = TagCategory.fromKorean(req.getCategory());
            // 동일한 category+name 조합의 태그가 있으면 재사용, 없으면 새로 생성
            Tag tag = tagRepository.findByCategoryAndName(tagCategory, req.getName())
                    .orElseGet(() -> {
                        Tag newTag = new Tag();
                        newTag.setCategory(tagCategory);
                        newTag.setName(req.getName());
                        return tagRepository.save(newTag);
                    });

            StudentTag studentTag = new StudentTag();
            studentTag.setStudent(student);
            studentTag.setTag(tag);
            studentTagRepository.save(studentTag);

            return tag;
        }).collect(Collectors.toList());

        return resultTags;
    }

    /**
     * 태그 요청 DTO (inner class)
     */
    @lombok.Getter
    @lombok.Setter
    @lombok.NoArgsConstructor
    public static class TagRequest {
        private String category; // 분야, 기술스택, 지역, 관심활동
        private String name;     // Spring, 데이터분석 등
    }
}
