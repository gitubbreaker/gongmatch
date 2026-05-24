package com.example.demo.controller;

import com.example.demo.entity.Comment;
import com.example.demo.entity.Post;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    @PostMapping
    public ResponseEntity<Comment> createComment(@PathVariable Long postId, @RequestBody Comment comment) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) return ResponseEntity.notFound().build();

        comment.setPost(post);
        if (comment.getAuthor() == null) comment.setAuthor("익명");
        return ResponseEntity.ok(commentRepository.save(comment));
    }

    @PostMapping("/{commentId}/replies")
    public ResponseEntity<Comment> createReply(@PathVariable Long postId, @PathVariable Long commentId, @RequestBody Comment reply) {
        Post post = postRepository.findById(postId).orElse(null);
        Comment parent = commentRepository.findById(commentId).orElse(null);
        if (post == null || parent == null) return ResponseEntity.notFound().build();

        reply.setPost(post);
        reply.setParent(parent);
        if (reply.getAuthor() == null) reply.setAuthor("익명");
        return ResponseEntity.ok(commentRepository.save(reply));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<Comment> updateComment(@PathVariable Long postId, @PathVariable Long commentId, @RequestBody Comment updatedComment) {
        return commentRepository.findById(commentId).map(comment -> {
            comment.setContent(updatedComment.getContent());
            return ResponseEntity.ok(commentRepository.save(comment));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long postId, @PathVariable Long commentId) {
        if (!commentRepository.existsById(commentId)) return ResponseEntity.notFound().build();
        commentRepository.deleteById(commentId);
        return ResponseEntity.ok().build();
    }
}
