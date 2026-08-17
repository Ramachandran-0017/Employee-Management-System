package com.ems.config;

import com.ems.entity.Department;
import com.ems.entity.Role;
import com.ems.entity.User;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds a default admin account and a couple of departments on first boot,
 * so the API is usable immediately without manual setup.
 * Default login: username "admin", password "admin123" — change this in production.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
        }

        if (departmentRepository.count() == 0) {
            departmentRepository.save(Department.builder()
                    .name("Engineering")
                    .description("Builds and maintains product software")
                    .build());
            departmentRepository.save(Department.builder()
                    .name("Human Resources")
                    .description("Manages hiring, benefits, and employee relations")
                    .build());
            departmentRepository.save(Department.builder()
                    .name("Sales")
                    .description("Drives revenue and manages client relationships")
                    .build());
        }
    }
}
