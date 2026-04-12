package com.example.demo.entity;

public enum TagCategory {
    ROLE, TECH, DOMAIN;

    public static TagCategory fromKorean(String korean) {
        if (korean == null) return DOMAIN;
        switch (korean) {
            case "기술 스택": return TECH;
            case "관심 활동": return ROLE;
            case "분야":
            case "지역":
            default: return DOMAIN;
        }
    }
}
