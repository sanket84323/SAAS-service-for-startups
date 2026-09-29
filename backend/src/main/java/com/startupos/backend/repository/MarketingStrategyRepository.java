package com.startupos.backend.repository;

import com.startupos.backend.entity.MarketingStrategy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MarketingStrategyRepository extends JpaRepository<MarketingStrategy, String> {
    Optional<MarketingStrategy> findByWorkspaceId(String workspaceId);
}
