package com.startupos.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner databaseInitializer(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT");
                System.out.println(">>> SUCCESSFULLY ALTERED Column users.avatar_url to TEXT");
            } catch (Exception e) {
                System.out.println(">>> DATABASE INITIALIZATION NOTE: " + e.getMessage());
            }
            
            try {
                System.out.println(">>> DATABASE DEBUG - USERS:");
                jdbcTemplate.queryForList("SELECT id, email, first_name, last_name, role FROM users")
                        .forEach(user -> System.out.println("USER: " + user));
                
                System.out.println(">>> DATABASE DEBUG - WORKSPACES:");
                jdbcTemplate.queryForList("SELECT id, name, user_email, active_plan FROM workspaces")
                        .forEach(ws -> System.out.println("WORKSPACE: " + ws));
            } catch (Exception e) {
                System.out.println(">>> DATABASE DEBUG ERROR: " + e.getMessage());
            }
        };
    }
}
