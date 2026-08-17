package com.ems.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    // ADMIN, MANAGER, or EMPLOYEE. Defaults to EMPLOYEE if omitted.
    private String role;
}
