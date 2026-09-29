package com.startupos.backend.repository;

import com.startupos.backend.entity.BusinessPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BusinessPlanRepository extends JpaRepository<BusinessPlan, String> {
    Optional<BusinessPlan> findByWorkspaceId(String workspaceId);
}
