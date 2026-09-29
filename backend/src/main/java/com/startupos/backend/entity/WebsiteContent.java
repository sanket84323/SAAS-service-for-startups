package com.startupos.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "website_contents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WebsiteContent {
    @Id
    private String id; // e.g. "web_ecosphere"

    @Column(nullable = false, unique = true)
    private String workspaceId;
    
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    @Convert(converter = WebsiteSectionsConverter.class)
    private WebsiteSections sections;

    // --- Inner structures matching front-end JSON ---
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WebsiteSections {
        private Hero hero;
        private List<Feature> features;
        private List<PricingTier> pricing;
        private List<FaqItem> faq;
        private SeoMetadata seoMetadata;

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Hero {
            private String title;
            private String subtitle;
            private String cta;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Feature {
            private String title;
            private String description;
            private String icon;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class PricingTier {
            private String name;
            private String price;
            private List<String> features;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class FaqItem {
            private String question;
            private String answer;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class SeoMetadata {
            private String title;
            private String description;
            private String keywords;
        }
    }

    // --- Attribute Converter ---
    
    private static final ObjectMapper mapper = new ObjectMapper();

    public static class WebsiteSectionsConverter implements AttributeConverter<WebsiteSections, String> {
        @Override
        public String convertToDatabaseColumn(WebsiteSections attr) {
            try { return attr == null ? null : mapper.writeValueAsString(attr); }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
        @Override
        public WebsiteSections convertToEntityAttribute(String dbData) {
            try { return dbData == null ? null : mapper.readValue(dbData, WebsiteSections.class); }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
    }
}
