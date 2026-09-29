package com.startupos.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    @Id
    private String id; // e.g. "msg_1"

    @Column(nullable = false)
    private String sessionId;

    private String sender; // "USER", "AI"

    @Column(columnDefinition = "TEXT")
    private String content;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    @Convert(converter = SourceDocumentsConverter.class)
    private List<SourceDocument> sourceDocuments;

    // --- Inner structures matching front-end JSON ---
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SourceDocument {
        private String id;
        private String name;
        private String matchedText;
    }

    // --- Attribute Converter ---
    
    private static final ObjectMapper mapper = new ObjectMapper();

    public static class SourceDocumentsConverter implements AttributeConverter<List<SourceDocument>, String> {
        @Override
        public String convertToDatabaseColumn(List<SourceDocument> attr) {
            try { return attr == null ? null : mapper.writeValueAsString(attr); }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
        @Override
        public List<SourceDocument> convertToEntityAttribute(String dbData) {
            try { 
                return dbData == null ? null : mapper.readValue(dbData, new TypeReference<List<SourceDocument>>() {}); 
            }
            catch (JsonProcessingException e) { throw new RuntimeException(e); }
        }
    }
}
