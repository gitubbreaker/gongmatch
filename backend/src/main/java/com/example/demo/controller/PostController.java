package com.example.demo.controller;

import com.example.demo.entity.Post;
import com.example.demo.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {
    
    private final PostRepository postRepository;

    @GetMapping
    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public Post createPost(@RequestBody Post post) {
        if (post.getAuthor() == null) post.setAuthor("익명");
        if (post.getCategory() == null) post.setCategory("팀원 구해요");
        if (post.getRegion() == null) post.setRegion("전체");
        return postRepository.save(post);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id, @RequestBody Post updatedPost) {
        return postRepository.findById(id).map(post -> {
            post.setTitle(updatedPost.getTitle());
            post.setContent(updatedPost.getContent());
            post.setCategory(updatedPost.getCategory());
            post.setRegion(updatedPost.getRegion());
            return ResponseEntity.ok(postRepository.save(post));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        if (!postRepository.existsById(id)) return ResponseEntity.notFound().build();
        postRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/like")
    public ResponseEntity<Post> toggleLike(@PathVariable Long id, @RequestParam boolean increment) {
        return postRepository.findById(id).map(post -> {
            post.setLikes(increment ? post.getLikes() + 1 : Math.max(0, post.getLikes() - 1));
            return ResponseEntity.ok(postRepository.save(post));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PatchMapping("/{id}/view")
    public ResponseEntity<Post> incrementView(@PathVariable Long id) {
        return postRepository.findById(id).map(post -> {
            post.setViews(post.getViews() + 1);
            return ResponseEntity.ok(postRepository.save(post));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
