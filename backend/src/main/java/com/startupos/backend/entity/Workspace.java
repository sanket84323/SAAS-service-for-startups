package com.startupos.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workspaces")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Workspace {
    @Id
    private String id; // e.g. "wsp_ecosphere"

    private String name;
    private String industry;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String targetAudience;

    @Column(unique = false)
    private String userEmail; // owner's email - links workspace to user

    private String activePlan; // "FREE", "PRO", "ENTERPRISE"
    private Integer creditsUsed;
    private Integer creditsLimit;
    private Integer teamMembersCount;
    
    @Builder.Default
    private Boolean teamEditingAllowed = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
