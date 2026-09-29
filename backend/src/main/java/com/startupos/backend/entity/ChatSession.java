package com.startupos.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSession {
    @Id
    private String id; // e.g. "sess_1"

    @Column(nullable = false)
    private String workspaceId;

    private String title;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
