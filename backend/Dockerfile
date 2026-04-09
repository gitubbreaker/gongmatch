# ===== Stage 1: Gradle 빌드 (도커 안에서 직접 빌드) =====
FROM eclipse-temurin:17-jdk AS builder

WORKDIR /build

# Gradle Wrapper 및 빌드 설정 파일 먼저 복사 (캐시 효율)
COPY gradlew ./
COPY gradle/ gradle/
COPY build.gradle settings.gradle ./

# gradlew 실행 권한 부여 + Windows줄바꿈(CRLF) → Unix줄바꿈(LF) 변환
RUN chmod +x gradlew && sed -i 's/\r$//' gradlew

# 의존성만 먼저 다운로드
RUN ./gradlew dependencies --no-daemon || true

# 소스 코드 전체 복사
COPY src/ src/

# fat jar 빌드
RUN ./gradlew bootJar --no-daemon -x test

# ===== Stage 2: 실행 전용 경량 이미지 =====
FROM eclipse-temurin:17-jre

WORKDIR /app

# 빌드된 boot jar만 복사
COPY --from=builder /build/build/libs/*.jar app.jar

# Spring Boot 로그 레벨: 운영 환경에 맞게 조정
ENV LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY=INFO

ENTRYPOINT ["java", "-jar", "app.jar"]