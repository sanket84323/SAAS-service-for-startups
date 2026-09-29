package com.startupos.backend.repository;

import com.startupos.backend.entity.PitchDeck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PitchDeckRepository extends JpaRepository<PitchDeck, String> {
    Optional<PitchDeck> findByWorkspaceId(String workspaceId);
}
