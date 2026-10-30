package com.hospital.auth.controller;

import com.hospital.auth.dto.AdminLoginRequest;
import com.hospital.auth.dto.AdminLoginResponse;
import com.hospital.auth.dto.AdminProfileResponse;
import com.hospital.auth.dto.MessageResponse;
import com.hospital.auth.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private final AdminService adminService;

    public AdminAuthController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/login")
    public AdminLoginResponse login(@Valid @RequestBody AdminLoginRequest request) {
        return adminService.login(request);
    }

    @PostMapping("/logout")
    public MessageResponse logout() {
        return adminService.logout();
    }

    @GetMapping("/me")
    public AdminProfileResponse me() {
        return adminService.getCurrentAdmin();
    }
}
