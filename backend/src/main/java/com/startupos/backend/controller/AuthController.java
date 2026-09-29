package com.startupos.backend.controller;

import com.startupos.backend.config.JwtUtil;
import com.startupos.backend.entity.User;
import com.startupos.backend.entity.Workspace;
import com.startupos.backend.repository.UserRepository;
import com.startupos.backend.repository.WorkspaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String firstName = request.get("firstName");
        String lastName = request.get("lastName");
        String role = request.getOrDefault("role", "FOUNDER");
        String workspaceName = request.getOrDefault("workspaceName", firstName + "'s Space");
        String industry = request.getOrDefault("industry", "Technology");
        String avatarUrl = request.get("avatarUrl");

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "User with this email already exists"));
        }

        // Generate workspace ID beforehand to link user
        String workspaceId = "wsp_" + System.currentTimeMillis();

        // Create User
        String userId = "usr_" + System.currentTimeMillis();
        User user = User.builder()
                .id(userId)
                .email(email)
                .password(passwordEncoder.encode(password))
                .firstName(firstName)
                .lastName(lastName)
                .role(role)
                .workspaceId(workspaceId)
                .joinedAt(LocalDateTime.now())
                .avatarUrl(avatarUrl != null && !avatarUrl.isEmpty() ? avatarUrl : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80")
                .build();
        userRepository.save(user);

        // Create Workspace linked to the registering user
        Workspace workspace = Workspace.builder()
                .id(workspaceId)
                .name(workspaceName)
                .industry(industry)
                .description("AI-powered workspace for " + workspaceName)
                .targetAudience("SMBs & general consumers")
                .userEmail(email)  // ← link workspace to this user
                .activePlan("FREE")
                .creditsUsed(0)
                .creditsLimit(1000)
                .teamMembersCount(1)
                .createdAt(LocalDateTime.now())
                .build();
        workspaceRepository.save(workspace);

        // Generate JWT
        String token = jwtUtil.generateToken(email, role);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);
        response.put("workspace", workspace);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
        }

        User user = userOpt.get();
        String token = jwtUtil.generateToken(email, user.getRole());

        // Fetch the workspace that belongs to this specific user (using workspaceId first, then owner's email)
        Optional<Workspace> workspaceOpt = Optional.empty();
        if (user.getWorkspaceId() != null) {
            workspaceOpt = workspaceRepository.findById(user.getWorkspaceId());
        }
        if (workspaceOpt.isEmpty()) {
            workspaceOpt = workspaceRepository.findByUserEmail(email);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);
        workspaceOpt.ifPresent(workspace -> response.put("workspace", workspace));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentUser() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        // Fetch the workspace that belongs to this specific user (using workspaceId first, then owner's email)
        Optional<Workspace> workspaceOpt = Optional.empty();
        if (user.getWorkspaceId() != null) {
            workspaceOpt = workspaceRepository.findById(user.getWorkspaceId());
        }
        if (workspaceOpt.isEmpty()) {
            workspaceOpt = workspaceRepository.findByUserEmail(email);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("user", user);
        workspaceOpt.ifPresent(workspace -> response.put("workspace", workspace));
        return ResponseEntity.ok(response);
    }
}
