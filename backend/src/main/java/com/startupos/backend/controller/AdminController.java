package com.startupos.backend.controller;

import com.startupos.backend.entity.*;
import com.startupos.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    // --- SaaS Billing Upgrade ---

    @PostMapping("/billing/upgrade")
    public ResponseEntity<?> upgradePlan(@RequestBody Map<String, String> request) {
        String workspaceId = request.get("workspaceId");
        String planName = request.get("planName"); // "PRO" or "ENTERPRISE"
        int limit = planName.equals("ENTERPRISE") ? 100000 : planName.equals("PRO") ? 10000 : 1000;

        Optional<Workspace> wsOpt = workspaceRepository.findById(workspaceId);
        if (wsOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Workspace not found"));
        }

        Workspace ws = wsOpt.get();
        ws.setActivePlan(planName);
        ws.setCreditsLimit(limit);
        workspaceRepository.save(ws);

        // Log upgrade
        ActivityLog log = ActivityLog.builder()
                .id("log_" + System.currentTimeMillis())
                .workspaceId(workspaceId)
                .userName("Founder")
                .userRole("FOUNDER")
                .action("Subscription Upgraded")
                .details("Upgraded workspace to " + planName + " tier. Extended usage limit to " + limit + " units.")
                .timestamp(LocalDateTime.now())
                .build();
        activityLogRepository.save(log);

        return ResponseEntity.ok(ws);
    }

    // --- Platform Admin Stats ---

    @DeleteMapping("/admin/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        Optional<User> uOpt = userRepository.findById(id);
        if (uOpt.isEmpty()) return ResponseEntity.notFound().build();
        userRepository.deleteById(id);
        
        ActivityLog log = ActivityLog.builder()
                .id("log_" + System.currentTimeMillis())
                .workspaceId("SYSTEM")
                .userName("System Admin")
                .userRole("ADMIN")
                .action("User Deleted")
                .details("Deleted user: " + uOpt.get().getEmail())
                .timestamp(LocalDateTime.now())
                .build();
        activityLogRepository.save(log);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @DeleteMapping("/admin/workspaces/{id}")
    public ResponseEntity<?> deleteWorkspace(@PathVariable String id) {
        Optional<Workspace> wOpt = workspaceRepository.findById(id);
        if (wOpt.isEmpty()) return ResponseEntity.notFound().build();
        workspaceRepository.deleteById(id);
        
        ActivityLog log = ActivityLog.builder()
                .id("log_" + System.currentTimeMillis())
                .workspaceId("SYSTEM")
                .userName("System Admin")
                .userRole("ADMIN")
                .action("Workspace Deleted")
                .details("Deleted workspace: " + wOpt.get().getName())
                .timestamp(LocalDateTime.now())
                .build();
        activityLogRepository.save(log);
        return ResponseEntity.ok(Map.of("message", "Workspace deleted successfully"));
    }

    @PutMapping("/admin/workspaces/{id}/plan")
    public ResponseEntity<?> overrideWorkspacePlan(@PathVariable String id, @RequestBody Map<String, String> body) {
        String newPlan = body.get("plan");
        Optional<Workspace> wOpt = workspaceRepository.findById(id);
        if (wOpt.isEmpty()) return ResponseEntity.notFound().build();
        Workspace w = wOpt.get();
        w.setActivePlan(newPlan);
        if ("ENTERPRISE".equals(newPlan)) w.setCreditsLimit(100000);
        else if ("PRO".equals(newPlan)) w.setCreditsLimit(10000);
        else w.setCreditsLimit(1000);
        workspaceRepository.save(w);
        
        ActivityLog log = ActivityLog.builder()
                .id("log_" + System.currentTimeMillis())
                .workspaceId("SYSTEM")
                .userName("System Admin")
                .userRole("ADMIN")
                .action("Plan Overridden")
                .details("Changed plan for workspace " + w.getName() + " to " + newPlan)
                .timestamp(LocalDateTime.now())
                .build();
        activityLogRepository.save(log);
        return ResponseEntity.ok(w);
    }

    @GetMapping("/admin/stats")
    public ResponseEntity<?> getSystemStats() {
        List<User> allUsers = userRepository.findAll();
        List<Workspace> allWorkspaces = workspaceRepository.findAll();
        
        long totalUsers = allUsers.size();
        long activeWorkspaces = allWorkspaces.size();

        // Calculate SaaS owner MRR based on active plans
        long totalRevenue = allWorkspaces.stream()
                .mapToLong(w -> {
                    if ("ENTERPRISE".equals(w.getActivePlan())) return 199;
                    if ("PRO".equals(w.getActivePlan())) return 49;
                    return 0;
                }).sum();

        // Calculate token usage
        long tokenUsage = allWorkspaces.stream()
                .mapToLong(w -> w.getCreditsUsed() != null ? w.getCreditsUsed() : 0)
                .sum();

        // Plan distribution
        Map<String, Integer> planDistribution = new HashMap<>();
        planDistribution.put("FREE", 0);
        planDistribution.put("PRO", 0);
        planDistribution.put("ENTERPRISE", 0);
        
        List<Map<String, Object>> workspacesList = new ArrayList<>();
        
        for (Workspace w : allWorkspaces) {
            String plan = w.getActivePlan() != null ? w.getActivePlan() : "FREE";
            planDistribution.put(plan, planDistribution.getOrDefault(plan, 0) + 1);
            
            Map<String, Object> wMap = new HashMap<>();
            wMap.put("id", w.getId());
            wMap.put("name", w.getName());
            wMap.put("industry", w.getIndustry());
            wMap.put("activePlan", plan);
            wMap.put("creditsUsed", w.getCreditsUsed() != null ? w.getCreditsUsed() : 0);
            wMap.put("creditsLimit", w.getCreditsLimit() != null ? w.getCreditsLimit() : 1000);
            wMap.put("userEmail", w.getUserEmail());
            wMap.put("createdAt", w.getCreatedAt().toLocalDate().toString());
            workspacesList.add(wMap);
        }

        // Fetch recent activities from PostgreSQL
        List<ActivityLog> logs = activityLogRepository.findFirst50ByOrderByTimestampDesc();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("activeWorkspaces", activeWorkspaces);
        stats.put("totalRevenue", totalRevenue);
        stats.put("tokenUsage", tokenUsage);
        stats.put("planDistribution", planDistribution);
        stats.put("workspacesList", workspacesList);
        stats.put("activityLogs", logs);

        // Recent signups lists
        List<Map<String, String>> recentSignups = new ArrayList<>();
        for (User u : allUsers) {
            recentSignups.add(Map.of(
                    "id", u.getId(),
                    "name", u.getFirstName() + " " + u.getLastName(),
                    "email", u.getEmail(),
                    "role", u.getRole() != null ? u.getRole() : "USER",
                    "joined", u.getJoinedAt().toLocalDate().toString()
            ));
        }
        stats.put("recentSignups", recentSignups);

        return ResponseEntity.ok(stats);
    }
}
