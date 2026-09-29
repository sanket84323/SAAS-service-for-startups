package com.startupos.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;

@Entity
@Table(name = "brand_kits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandKit {
    @Id
    private String id; // e.g. "bk_ecosphere"

    @Column(nullable = false, unique = true)
    private String workspaceId;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    private List<String> nameIdeas;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    private List<String> taglineIdeas;

    @Column(columnDefinition = "TEXT")
    private String mission;

    @Column(columnDefinition = "TEXT")
    private String vision;

    @Column(columnDefinition = "TEXT")
    private String brandStory;

    @Column(columnDefinition = "TEXT")
    private String personality;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    private List<String> paletteColors; // HSL palettes

    @Column(columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    private List<String> values;

    @Column(columnDefinition = "TEXT")
    private String voiceAndTone;

    // --- Jackson List<String> Converter ---
    
    private static final ObjectMapper mapper = new ObjectMapper();

    public static class StringListConverter implements AttributeConverter<List<String>, String> {
        @Override
        public String convertToDatabaseColumn(List<String> attr) {
            try { return attr == null ? null : mapper.writeValueAsString(attr); }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
        @Override
        public List<String> convertToEntityAttribute(String dbData) {
            try { 
                return dbData == null ? null : mapper.readValue(dbData, new TypeReference<List<String>>() {}); 
            }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
    }
}
