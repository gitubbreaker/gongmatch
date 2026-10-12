package com.example.demo.controller;

import com.example.demo.dto.TeamRoomDto;
import com.example.demo.service.TeamRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team-rooms")
@RequiredArgsConstructor
public class TeamRoomController {

    private final TeamRoomService teamRoomService;

    @PostMapping
    public ResponseEntity<TeamRoomDto.Response> createRoom(
            Authentication authentication,
            @RequestBody TeamRoomDto.CreateRequest request) {
        String loginId = authentication.getName();
        TeamRoomDto.Response response = teamRoomService.createRoom(loginId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<TeamRoomDto.Response> getRoomDetails(@PathVariable Long roomId) {
        return ResponseEntity.ok(teamRoomService.getRoomDetails(roomId));
    }

    @GetMapping
    public ResponseEntity<List<TeamRoomDto.Response>> getAllRooms() {
        return ResponseEntity.ok(teamRoomService.getAllRooms());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TeamRoomDto.Response>> getRoomsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(teamRoomService.getRoomsByProject(projectId));
    }

    @PostMapping("/{roomId}/join")
    public ResponseEntity<Void> joinRoom(
            Authentication authentication,
            @PathVariable Long roomId,
            @RequestBody TeamRoomDto.JoinRequest request) {
        String loginId = authentication.getName();
        teamRoomService.joinRoom(loginId, roomId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{roomId}/leave")
    public ResponseEntity<Void> leaveRoom(
            Authentication authentication,
            @PathVariable Long roomId) {
        String loginId = authentication.getName();
        teamRoomService.leaveRoom(loginId, roomId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{roomId}/members/{studentId}")
    public ResponseEntity<Void> kickMember(
            Authentication authentication,
            @PathVariable Long roomId,
            @PathVariable Long studentId) {
        String loginId = authentication.getName();
        teamRoomService.kickMember(loginId, roomId, studentId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{roomId}")
    public ResponseEntity<TeamRoomDto.Response> updateRoom(
            Authentication authentication,
            @PathVariable Long roomId,
            @RequestBody TeamRoomDto.CreateRequest request) {
        String loginId = authentication.getName();
        TeamRoomDto.Response response = teamRoomService.updateRoom(loginId, roomId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoom(
            Authentication authentication,
            @PathVariable Long roomId) {
        String loginId = authentication.getName();
        teamRoomService.deleteRoom(loginId, roomId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{roomId}/project")
    public ResponseEntity<Void> detachProject(
            Authentication authentication,
            @PathVariable Long roomId) {
        String loginId = authentication.getName();
        teamRoomService.detachProject(loginId, roomId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{roomId}/project/{projectId}")
    public ResponseEntity<Void> updateProject(
            Authentication authentication,
            @PathVariable Long roomId,
            @PathVariable Long projectId) {
        String loginId = authentication.getName();
        teamRoomService.updateProject(loginId, roomId, projectId);
        return ResponseEntity.ok().build();
    }
}
