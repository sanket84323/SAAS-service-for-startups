package com.startupos.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "marketing_strategies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketingStrategy {
    @Id
    private String id; // e.g. "mkt_ecosphere"

    @Column(nullable = false, unique = true)
    private String workspaceId;

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    private List<String> gtmLaunchPlan;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AcquisitionChannelsConverter.class)
    private List<AcquisitionChannel> acquisitionChannels;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = PersonasListConverter.class)
    private List<Persona> personas;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    private List<String> keyChannels;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    private List<String> messagingPillars;

    // --- Inner structures matching front-end JSON ---
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AcquisitionChannel {
        private String name;
        private String cost;
        private String roi;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Persona {
        private String name;
        private String demographics;
        private List<String> painPoints;
        private List<String> channels;
    }

    // --- Attribute Converters ---
    
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

    public static class AcquisitionChannelsConverter implements AttributeConverter<List<AcquisitionChannel>, String> {
        @Override
        public String convertToDatabaseColumn(List<AcquisitionChannel> attr) {
            try { return attr == null ? null : mapper.writeValueAsString(attr); }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
        @Override
        public List<AcquisitionChannel> convertToEntityAttribute(String dbData) {
            try { 
                return dbData == null ? null : mapper.readValue(dbData, new TypeReference<List<AcquisitionChannel>>() {}); 
            }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
    }

    public static class PersonasListConverter implements AttributeConverter<List<Persona>, String> {
        @Override
        public String convertToDatabaseColumn(List<Persona> attr) {
            try { return attr == null ? null : mapper.writeValueAsString(attr); }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
        @Override
        public List<Persona> convertToEntityAttribute(String dbData) {
            try { 
                return dbData == null ? null : mapper.readValue(dbData, new TypeReference<List<Persona>>() {}); 
            }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
    }
}
