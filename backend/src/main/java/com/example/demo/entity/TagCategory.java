package com.example.demo.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

public enum TagCategory {
    ROLE, TECH, DOMAIN,
    // 레거시 DB 한글 데이터 및 별칭 호환용 상수
    분야, 기술스택, 관심활동, 지역;

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

    @Converter(autoApply = true)
    public static class TagCategoryConverter implements AttributeConverter<TagCategory, String> {
        @Override
        public String convertToDatabaseColumn(TagCategory attribute) {
            if (attribute == null) return null;
            switch (attribute) {
                case ROLE:
                case 관심활동: return "ROLE";
                case TECH:
                case 기술스택: return "TECH";
                case DOMAIN:
                case 분야:
                case 지역:
                default: return "DOMAIN";
            }
        }

        @Override
        public TagCategory convertToEntityAttribute(String dbData) {
            if (dbData == null) return null;
            try {
                TagCategory cat = TagCategory.valueOf(dbData);
                return normalize(cat);
            } catch (IllegalArgumentException e) {
                return TagCategory.fromKorean(dbData);
            }
        }

        private TagCategory normalize(TagCategory cat) {
            switch (cat) {
                case 관심활동: return ROLE;
                case 기술스택: return TECH;
                case 분야:
                case 지역: return DOMAIN;
                default: return cat;
            }
        }
    }
}
