package com.example.demo;

import jakarta.annotation.PostConstruct;
import java.util.TimeZone;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

// UserDetailsServiceAutoConfiguration 제외: JWT 기반 인증을 쓰므로
// 스프링 기본 InMemoryUserDetailsManager(자동 비밀번호 생성)가 불필요
@EnableScheduling
@EnableAsync
@EnableTransactionManagement
@org.springframework.cache.annotation.EnableCaching
@SpringBootApplication(
        scanBasePackages = "com.example.demo",
        exclude = {UserDetailsServiceAutoConfiguration.class}
)
public class DemoApplication {

	@PostConstruct
	public void init() {
		// 전역 기본 시간대를 대한민국 표준시(KST, Asia/Seoul)로 고정
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
		System.out.println("⏰ [시스템 시간대 설정] 기본 TimeZone이 Asia/Seoul (KST)로 설정되었습니다: " + java.time.LocalDateTime.now());
	}

	public static void main(String[] args) {
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
		SpringApplication.run(DemoApplication.class, args);
	}

}
