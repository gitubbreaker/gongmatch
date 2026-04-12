package com.example.demo.entity;

public enum TagCategory {
    ROLE, TECH, DOMAIN;

    public static TagCategory fromKorean(String category) {
        if (category == null) return DOMAIN;
        String upper = category.toUpperCase().replace(" ", "");
        switch (upper) {
            case "기술스택":
            case "TECH": return TECH;
            case "관심활동":
            case "ROLE": return ROLE;
            case "분야":
            case "지역":
            case "DOMAIN":
            default: return DOMAIN;
        }
    }
}
