package com.startupos.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "business_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessPlan {
    @Id
    private String id; // e.g. "bp_ecosphere"

    @Column(nullable = false)
    private String workspaceId;

    private Integer version;
    
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    @Convert(converter = SectionListConverter.class)
    private List<Section> sections;

    // --- Inner structures matching front-end JSON ---
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Section {
        private String id;
        private String title;
        private String key;
        
        @Column(columnDefinition = "TEXT")
        private String content;
    }

    // --- Attribute Converter ---
    
    private static final ObjectMapper mapper = new ObjectMapper();

    public static class SectionListConverter implements AttributeConverter<List<Section>, String> {
        @Override
        public String convertToDatabaseColumn(List<Section> attr) {
            try { return attr == null ? null : mapper.writeValueAsString(attr); }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
        @Override
        public List<Section> convertToEntityAttribute(String dbData) {
            try { 
                return dbData == null ? null : mapper.readValue(dbData, new TypeReference<List<Section>>() {}); 
            }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
    }
}
