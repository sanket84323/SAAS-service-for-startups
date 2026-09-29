package com.startupos.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "idea_validation_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdeaValidationReport {
    @Id
    private String id; // e.g. "val_ecosphere"

    @Column(nullable = false, unique = true)
    private String workspaceId;


    private Integer score;
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    @Convert(converter = MarketOpportunityConverter.class)
    private MarketOpportunity marketOpportunity;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = CompetitorAnalysisConverter.class)
    private CompetitorAnalysis competitorAnalysis;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = SwotAnalysisConverter.class)
    private SwotAnalysis swotAnalysis;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = MonetizationStrategiesConverter.class)
    private MonetizationStrategies monetizationStrategies;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = RisksAndChallengesConverter.class)
    private RisksAndChallenges risksAndChallenges;

    // --- Inner structures matching front-end JSON ---
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarketOpportunity {
        private String size;
        private String cagr;
        private String growthPotential;
        private String summary;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompetitorAnalysis {
        private List<String> directCompetitors;
        private List<String> indirectCompetitors;
        private String marketGap;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SwotAnalysis {
        private List<String> strengths;
        private List<String> weaknesses;
        private List<String> opportunities;
        private List<String> threats;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonetizationStrategies {
        private List<Channel> channels;
        private String pricingRecommendation;

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Channel {
            private String name;
            private String type;
            private String difficulty;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RisksAndChallenges {
        private List<String> technical;
        private List<String> business;
        private List<String> financial;
        private List<String> regulatory;
    }

    // --- Attribute Converters ---
    
    private static final ObjectMapper mapper = new ObjectMapper();

    public static class MarketOpportunityConverter implements AttributeConverter<MarketOpportunity, String> {
        @Override
        public String convertToDatabaseColumn(MarketOpportunity attr) {
            try { return attr == null ? null : mapper.writeValueAsString(attr); }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
        @Override
        public MarketOpportunity convertToEntityAttribute(String dbData) {
            try { return dbData == null ? null : mapper.readValue(dbData, MarketOpportunity.class); }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
    }

    public static class CompetitorAnalysisConverter implements AttributeConverter<CompetitorAnalysis, String> {
        @Override
        public String convertToDatabaseColumn(CompetitorAnalysis attr) {
            try { return attr == null ? null : mapper.writeValueAsString(attr); }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
        @Override
        public CompetitorAnalysis convertToEntityAttribute(String dbData) {
            try { return dbData == null ? null : mapper.readValue(dbData, CompetitorAnalysis.class); }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
    }

    public static class SwotAnalysisConverter implements AttributeConverter<SwotAnalysis, String> {
        @Override
        public String convertToDatabaseColumn(SwotAnalysis attr) {
            try { return attr == null ? null : mapper.writeValueAsString(attr); }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
        @Override
        public SwotAnalysis convertToEntityAttribute(String dbData) {
            try { return dbData == null ? null : mapper.readValue(dbData, SwotAnalysis.class); }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
    }

    public static class MonetizationStrategiesConverter implements AttributeConverter<MonetizationStrategies, String> {
        @Override
        public String convertToDatabaseColumn(MonetizationStrategies attr) {
            try { return attr == null ? null : mapper.writeValueAsString(attr); }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
        @Override
        public MonetizationStrategies convertToEntityAttribute(String dbData) {
            try { return dbData == null ? null : mapper.readValue(dbData, MonetizationStrategies.class); }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
    }

    public static class RisksAndChallengesConverter implements AttributeConverter<RisksAndChallenges, String> {
        @Override
        public String convertToDatabaseColumn(RisksAndChallenges attr) {
            try { return attr == null ? null : mapper.writeValueAsString(attr); }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
        @Override
        public RisksAndChallenges convertToEntityAttribute(String dbData) {
            try { return dbData == null ? null : mapper.readValue(dbData, RisksAndChallenges.class); }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
    }
}
