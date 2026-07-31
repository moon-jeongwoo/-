"""
"바로 시작" 버튼을 눌렀을 때 쓸, 미리 준비해둔 후보 목록.

이미지 URL은 전부 위키미디어 커먼즈(Wikimedia Commons)에서 실제로 존재하는 주소를
하나하나 확인해서 넣은 것 -- 지어낸 링크가 아님. 위키미디어는 핫링크 제한이 없어서
이 앱에서 <img src="...">로 바로 걸어써도 안전하게 계속 열림.
"""

FEMALE_IDOLS = [
    # NewJeans
    {"name": "민지", "image_url": "https://upload.wikimedia.org/wikipedia/commons/3/30/Minji_Olens_2024_FW_1.jpg"},
    {"name": "하니", "image_url": "https://upload.wikimedia.org/wikipedia/commons/7/75/Hanni_241022.png"},
    {"name": "다니엘", "image_url": "https://upload.wikimedia.org/wikipedia/commons/8/8b/240910_NewJeans_Danielle.jpg"},
    {"name": "해린", "image_url": "https://upload.wikimedia.org/wikipedia/commons/a/a7/Haerin_Seoul_Fashion_Week_3.jpg"},
    {"name": "혜인", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Hyein_of_NewJeans%2C_July_26%2C_2024.png/960px-Hyein_of_NewJeans%2C_July_26%2C_2024.png"},
    # IVE
    {"name": "장원영", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Jang_Won-young_at_the_Bulgari_Eclettica_event_in_Seoul%2C_May_12%2C_2026_%281%29.png/960px-Jang_Won-young_at_the_Bulgari_Eclettica_event_in_Seoul%2C_May_12%2C_2026_%281%29.png"},
    {"name": "안유진", "image_url": "https://upload.wikimedia.org/wikipedia/commons/f/f0/IVE_Yujin_2026_GDA.jpg"},
    {"name": "가을", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Gaeul_of_Ive_at_Senka_Pop-up_Event%2C_May_19%2C_2026_%281%29.png/960px-Gaeul_of_Ive_at_Senka_Pop-up_Event%2C_May_19%2C_2026_%281%29.png"},
    {"name": "레이", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Ive%27s_Rei_%40_OPENING_PROJECTxSATUR_PhotoCall%2C_12_June_2025_01.png/960px-Ive%27s_Rei_%40_OPENING_PROJECTxSATUR_PhotoCall%2C_12_June_2025_01.png"},
    {"name": "리즈", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Liz_of_Ive%2C_July_19%2C_2026_%281%29.png/960px-Liz_of_Ive%2C_July_19%2C_2026_%281%29.png"},
    # LE SSERAFIM
    {"name": "사쿠라", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/20260110_Le_Sserafim%27s_Sakura_Miyawaki_01.png/960px-20260110_Le_Sserafim%27s_Sakura_Miyawaki_01.png"},
    {"name": "김채원", "image_url": "https://upload.wikimedia.org/wikipedia/commons/6/62/240329_Kim_Chae-won_%281%29.jpg"},
    {"name": "허윤진", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Huh_Yunjin_of_Le_Sserafim%2C_January_10%2C_2025.png/960px-Huh_Yunjin_of_Le_Sserafim%2C_January_10%2C_2025.png"},
    {"name": "카즈하", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Kazuha_of_Le_Sserafim%2C_April_5%2C_2024_%282%29.png/960px-Kazuha_of_Le_Sserafim%2C_April_5%2C_2024_%282%29.png"},
    # aespa
    {"name": "카리나", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Karina_at_Gimpo_Airport_on_April_22%2C_2026_03.png/960px-Karina_at_Gimpo_Airport_on_April_22%2C_2026_03.png"},
    {"name": "지젤", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Giselle_at_Incheon_Airport_on_March_4%2C_2026.jpg/960px-Giselle_at_Incheon_Airport_on_March_4%2C_2026.jpg"},
    {"name": "윈터", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Winter_at_Incheon_Airport_on_July_10%2C_2026.png/960px-Winter_at_Incheon_Airport_on_July_10%2C_2026.png"},
    {"name": "닝닝", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Ningning_at_Mise-en-Scene_event_on_19022026_%282%29.png/960px-Ningning_at_Mise-en-Scene_event_on_19022026_%282%29.png"},
    # (여자)아이들
    {"name": "미연", "image_url": "https://upload.wikimedia.org/wikipedia/commons/3/35/Miyeon_at_Incheon_Airport_on_25022026_%288%29.png"},
    {"name": "소연", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/%284K%29_%28%EC%97%AC%EC%9E%90%29%EC%95%84%EC%9D%B4%EB%93%A4_%EC%86%8C%EC%97%B0%EC%9D%98_%EB%B0%98%EC%A7%9D%EC%9D%B4%EB%8A%94_%EC%88%9C%EA%B0%84...%EC%A3%BC%EC%96%BC%EB%A6%AC_%EC%97%AC%EC%8B%A0_%EA%B0%95%EB%A6%BC_I_SOYEON_PhotoCall_03_%28cropped%29.png/960px-%284K%29_%28%EC%97%AC%EC%9E%90%29%EC%95%84%EC%9D%B4%EB%93%A4_%EC%86%8C%EC%97%B0%EC%9D%98_%EB%B0%98%EC%A7%9D%EC%9D%B4%EB%8A%94_%EC%88%9C%EA%B0%84...%EC%A3%BC%EC%96%BC%EB%A6%AC_%EC%97%AC%EC%8B%A0_%EA%B0%95%EB%A6%BC_I_SOYEON_PhotoCall_03_%28cropped%29.png"},
    {"name": "슈화", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/%28G%29I-DLE%27s_Shuhua_on_June_2023_01_%28cropped%29.jpg/960px-%28G%29I-DLE%27s_Shuhua_on_June_2023_01_%28cropped%29.jpg"},
    {"name": "민니", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Minnie_at_Owndays_popup_in_Plaza_Singapura_01_-_RSKY_-_20260611.jpg/960px-Minnie_at_Owndays_popup_in_Plaza_Singapura_01_-_RSKY_-_20260611.jpg"},
    {"name": "우기", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/20230630_Song_Yu-qi.jpg/960px-20230630_Song_Yu-qi.jpg"},
    # ITZY
    {"name": "예지", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/030226_Yeji_Incheon_Airport_departure_04.png/960px-030226_Yeji_Incheon_Airport_departure_04.png"},
    {"name": "리아", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/251110_Choi_Jisu_%28Lia%29_from_ITZY.png/960px-251110_Choi_Jisu_%28Lia%29_from_ITZY.png"},
    {"name": "류진", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/071226_Ryujin_at_Nars_photocall.png/960px-071226_Ryujin_at_Nars_photocall.png"},
    {"name": "채령", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/251110_Lee_Chaeryeong_from_ITZY.png/960px-251110_Lee_Chaeryeong_from_ITZY.png"},
    {"name": "유나", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Yuna_at_Incheon_Airport_on_September_22%2C_2025.jpg/960px-Yuna_at_Incheon_Airport_on_September_22%2C_2025.jpg"},
    # BLACKPINK
    {"name": "지수", "image_url": "https://upload.wikimedia.org/wikipedia/commons/2/2e/Jisoo_at_Boyfriend_on_Demand_press_conference_on_26022026_%2812%29.png"},
    {"name": "제니", "image_url": "https://upload.wikimedia.org/wikipedia/commons/7/7a/20260526_Jennie_Kim_04.jpg"},
    {"name": "로제", "image_url": "https://upload.wikimedia.org/wikipedia/commons/b/b3/Blackpink_Rosé_Rimowa_1.jpg"},
    {"name": "리사", "image_url": "https://upload.wikimedia.org/wikipedia/commons/a/ae/20240314_Lisa_Manoban_07.jpg"},
]

CATEGORIES = {
    "female_idols": {
        "title": "여자 아이돌 이상형 월드컵",
        "pool": FEMALE_IDOLS,
    },
}
