package com.startupos.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    private String id; // Use String id matching front-end client-side mock id e.g. "usr_founder"

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password; // Bcrypt hashed password

    private String firstName;
    private String lastName;
    private String role; // "FOUNDER", "TEAM_MEMBER", "ADMIN"
    private String workspaceId; // Direct link to active workspace
    @Column(columnDefinition = "TEXT")
    private String avatarUrl;
    
    @Builder.Default
    private LocalDateTime joinedAt = LocalDateTime.now();
}
