package com.startupos.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "pitch_decks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PitchDeck {
    @Id
    private String id; // e.g. "pd_ecosphere"

    @Column(nullable = false, unique = true)
    private String workspaceId;

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    @Convert(converter = SlidesConverter.class)
    private List<Slide> slides;

    private String theme; // e.g., "gradient-fusion", "midnight-tech", etc.

    // --- Inner structures matching front-end JSON ---
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Slide {
        private String id;
        private Integer slideNumber;
        private String title;
        
        @Column(columnDefinition = "TEXT")
        private String content;
        private List<String> points;
        private String layout; // e.g., "traditional", "split", "grid", "cover"

        public Slide(String id, Integer slideNumber, String title, String content, List<String> points) {
            this(id, slideNumber, title, content, points, "traditional");
        }
    }

    // --- Attribute Converter ---
    
    private static final ObjectMapper mapper = new ObjectMapper()
            .configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public static class SlidesConverter implements AttributeConverter<List<Slide>, String> {
        @Override
        public String convertToDatabaseColumn(List<Slide> attr) {
            try { return attr == null ? null : mapper.writeValueAsString(attr); }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
        @Override
        public List<Slide> convertToEntityAttribute(String dbData) {
            try { 
                return dbData == null ? null : mapper.readValue(dbData, new TypeReference<List<Slide>>() {}); 
            }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
    }
}
