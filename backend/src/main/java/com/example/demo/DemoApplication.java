package com.example.demo;

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
@SpringBootApplication(
        scanBasePackages = "com.example.demo",
        exclude = {UserDetailsServiceAutoConfiguration.class}
)
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

}
