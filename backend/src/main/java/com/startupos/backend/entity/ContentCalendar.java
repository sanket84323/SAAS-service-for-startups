package com.startupos.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;

@Entity
@Table(name = "content_calendars")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentCalendar {
    @Id
    private String id; // e.g. "cal_ecosphere"

    @Column(nullable = false, unique = true)
    private String workspaceId;

    private String month;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = PostsConverter.class)
    private List<Post> posts;

    // --- Inner structures matching front-end JSON ---
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Post {
        private String id;
        private String date;
        private String platform;
        private String type;
        
        @Column(columnDefinition = "TEXT")
        private String content;
        private String status; // "scheduled", "published", "draft"
    }

    // --- Attribute Converter ---
    
    private static final ObjectMapper mapper = new ObjectMapper();

    public static class PostsConverter implements AttributeConverter<List<Post>, String> {
        @Override
        public String convertToDatabaseColumn(List<Post> attr) {
            try { return attr == null ? null : mapper.writeValueAsString(attr); }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
        @Override
        public List<Post> convertToEntityAttribute(String dbData) {
            try { 
                return dbData == null ? null : mapper.readValue(dbData, new TypeReference<List<Post>>() {}); 
            }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
    }
}
