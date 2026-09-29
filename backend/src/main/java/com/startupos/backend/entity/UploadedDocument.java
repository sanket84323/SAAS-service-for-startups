package com.startupos.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "uploaded_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadedDocument {
    @Id
    private String id; // e.g. "doc_1"

    @Column(nullable = false)
    private String workspaceId;

    private String fileName;
    private String fileSize;
    private String fileType;
    private Integer chunkCount;
    private String status; // "PROCESSING", "COMPLETED", "FAILED"

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
