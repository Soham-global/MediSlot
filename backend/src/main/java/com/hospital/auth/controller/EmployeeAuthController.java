package com.hospital.auth.controller;

import com.hospital.auth.dto.EmployeeLoginResponse;
import com.hospital.auth.dto.EmployeeProfileResponse;
import com.hospital.auth.dto.LoginRequest;
import com.hospital.auth.dto.MessageResponse;
import com.hospital.auth.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class EmployeeAuthController {

    private final EmployeeService employeeService;

    public EmployeeAuthController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping("/login")
    public EmployeeLoginResponse login(@Valid @RequestBody LoginRequest request) {
        return employeeService.login(request);
    }

    @PostMapping("/logout")
    public MessageResponse logout() {
        return employeeService.logout();
    }

    @GetMapping("/me")
    public EmployeeProfileResponse me() {
        return employeeService.getCurrentProfile();
    }
}
