package com.example.demo.service;

import com.example.demo.entity.Bookmark;
import com.example.demo.entity.Notification;
import com.example.demo.entity.Project;
import com.example.demo.entity.Student;
import com.example.demo.repository.BookmarkRepository;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeadlineNotificationService {

    private final BookmarkRepository bookmarkRepository;
    private final NotificationRepository notificationRepository;
    private final StudentRepository studentRepository;

    // 서버 시작 10초 후 최초 실행, 이후 1시간 주기로 실행
    @Scheduled(initialDelay = 10000, fixedDelay = 3600000)
    @Transactional
    public void checkDeadlinesAndNotify() {
        log.info("마감 임박 알림 스케줄러 실행 중...");
        List<Bookmark> bookmarks = bookmarkRepository.findAll();
        LocalDate now = LocalDate.now();

        for (Bookmark bookmark : bookmarks) {
            Project project = bookmark.getProject();
            Long userId = bookmark.getUserId();
            
            if (project == null || project.getEndDate() == null) continue;

            LocalDate endDate = project.getEndDate();
            long daysLeft = ChronoUnit.DAYS.between(now, endDate);

            // 0일 ~ 10일 사이로 남은 공모전만 대상
            if (daysLeft >= 0 && daysLeft <= 10) {
                String targetUrl = "/projects/" + project.getId();
                
                // 이미 해당 유저에게 이 프로젝트의 마감 임박 알림을 보냈는지 중복 확인
                boolean alreadySent = notificationRepository.existsByReceiverIdAndTypeAndTargetUrl(
                        userId, "마감 임박", targetUrl
                );

                if (!alreadySent) {
                    Optional<Student> studentOpt = studentRepository.findById(userId);
                    if (studentOpt.isPresent()) {
                        Notification notif = new Notification();
                        notif.setReceiver(studentOpt.get());
                        notif.setType("마감 임박");
                        notif.setIcon("⏰");
                        
                        // 제목이 너무 길면 자르기
                        String title = project.getTitle();
                        if (title.length() > 30) {
                            title = title.substring(0, 30) + "...";
                        }
                        notif.setTitle(title);
                        
                        String dDayText = (daysLeft == 0) ? "오늘 마감" : "D-" + daysLeft;
                        notif.setDesc1(dDayText + ", 마감일이 얼마 남지 않았어요!");
                        notif.setDesc2("찜해둔 공모전에 늦지 않게 지원해 보세요.");
                        notif.setTargetUrl(targetUrl);
                        
                        notificationRepository.save(notif);
                        log.info("마감 임박 알림 생성 완료 - User: {}, Project: {}", userId, title);
                    }
                }
            }
        }
        log.info("마감 임박 알림 스케줄러 실행 완료.");
    }
}
