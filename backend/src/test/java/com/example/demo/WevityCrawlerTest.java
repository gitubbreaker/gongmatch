package com.example.demo;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.junit.jupiter.api.Test;
import java.io.IOException;

/**
 * 위비티(Wevity) 사이트 크롤링 테스트 클래스 (Source B)
 */
public class WevityCrawlerTest {

    @Test
    void testWevityCrawling() {
        // 위비티 IT/공모전 카테고리 URL
        String url = "https://www.wevity.com/?c=find&s=1&gbn=viewok&cidx=21";
        System.out.println(">>> 위비티 크롤링 테스트 시작 (URL: " + url + ")");

        try {
            // 1. Jsoup 접속 및 HTML 로드 (Timeout 5초)
            Document doc = Jsoup.connect(url)
                    .timeout(5000)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                    .get();

            // 2. 공모전 제목 및 링크 추출 
            // 위비티 리스트 구조: ul.list li 내부의 div.tit a 태그
            Elements elements = doc.select("ul.list li div.tit a");

            if (elements.isEmpty()) {
                System.out.println("[경고] 수집된 데이터가 없습니다. 셀렉터(.tit a)를 확인해 주세요.");
            }

            for (Element el : elements) {
                String title = el.text();
                String link = el.attr("abs:href"); // 절대 경로(absolute URL)로 추출

                System.out.println("-------------------------------------------");
                System.out.println("공모전 제목: " + title);
                System.out.println("상세 페이지: " + link);
            }

        } catch (IOException e) {
            System.err.println("[오류] 크롤링 중 예외 발생: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("[오류] 알 수 없는 오류 발생: " + e.getMessage());
        }
    }
}
