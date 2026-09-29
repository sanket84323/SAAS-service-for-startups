package com.startupos.backend.repository;

import com.startupos.backend.entity.StartupProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StartupProfileRepository extends JpaRepository<StartupProfile, String> {
    Optional<StartupProfile> findByWorkspaceId(String workspaceId);
}
