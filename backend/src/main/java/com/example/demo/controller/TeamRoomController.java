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
}
