import requests
from bs4 import BeautifulSoup
import re

url = "https://www.wevity.com/?c=find&s=1&gub=1&cidx=20&gp=1"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
}
res = requests.get(url, headers=headers)
soup = BeautifulSoup(res.text, "html.parser")

items = soup.select(".list-area > ul > li, ul.list > li")
for item in items:
    titleTag = item.select_one(".tit a, .tit span a, a")
    if not titleTag:
        continue
    title = titleTag.text.strip()
    href = titleTag.get("href")
    if "ix=" not in href:
        continue
        
    print(f"Title: {title}")
    
    # fetch detail
    detail_url = "https://www.wevity.com/" + href if href.startswith("?") else href
    try:
        detail_res = requests.get(detail_url, headers=headers, timeout=5)
        detail_soup = BeautifulSoup(detail_res.text, "html.parser")
        
        info_lis = detail_soup.select(".cd-info-list li")
        field = ""
        dateRange = ""
        for li in info_lis:
            if "분야" in li.select_one(".tit").text if li.select_one(".tit") else "":
                field = li.text.replace("분야", "").strip()
            if "접수기간" in li.select_one(".tit").text if li.select_one(".tit") else "":
                dateRange = li.text.replace("접수기간", "").strip()
                
        print(f"  Field: {field}")
        print(f"  DateRange: {dateRange}")
    except Exception as e:
        print(f"  Error fetching {detail_url}: {e}")
    print("---")
