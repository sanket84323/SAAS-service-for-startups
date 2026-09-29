package com.startupos.backend.repository;

import com.startupos.backend.entity.BrandKit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BrandKitRepository extends JpaRepository<BrandKit, String> {
    Optional<BrandKit> findByWorkspaceId(String workspaceId);
}
