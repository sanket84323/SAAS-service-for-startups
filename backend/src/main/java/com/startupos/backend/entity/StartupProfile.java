package com.startupos.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "startup_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StartupProfile {
    @Id
    private String id; // e.g., "prof_ecosphere"

    @Column(nullable = false, unique = true)
    private String workspaceId;

    private String name;
    private String industry;
    
    @Column(columnDefinition = "TEXT")
    private String targetAudience;
    
    @Column(columnDefinition = "TEXT")
    private String oneLiner;
    
    @Column(columnDefinition = "TEXT")
    private String problem;
    
    @Column(columnDefinition = "TEXT")
    private String solution;
    
    @Column(columnDefinition = "TEXT")
    private String competitors;
    
    @Column(columnDefinition = "TEXT")
    private String revenueModel;
}
