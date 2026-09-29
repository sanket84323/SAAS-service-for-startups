package com.startupos.backend.repository;

import com.startupos.backend.entity.ContentCalendar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ContentCalendarRepository extends JpaRepository<ContentCalendar, String> {
    Optional<ContentCalendar> findByWorkspaceId(String workspaceId);
}
