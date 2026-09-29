package com.startupos.backend.repository;

import com.startupos.backend.entity.IdeaValidationReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface IdeaValidationReportRepository extends JpaRepository<IdeaValidationReport, String> {
    Optional<IdeaValidationReport> findByWorkspaceId(String workspaceId);
}
