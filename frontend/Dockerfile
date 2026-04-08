# 프론트엔드용 설정입니다.
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
# 빌드 캐시 강제 무력화 (매번 최신 코드를 명확히 복사하기 위함)
RUN echo "Cache bust for PrivateRoute: 2026-04-08 v1"
COPY . .
EXPOSE 3000
CMD ["npm", "start"]