package com.hospital.auth.service;

import com.hospital.auth.Admin;
import com.hospital.auth.AdminRepository;
import com.hospital.auth.dto.AdminLoginRequest;
import com.hospital.auth.dto.AdminLoginResponse;
import com.hospital.auth.dto.AdminProfileResponse;
import com.hospital.auth.dto.HospitalSummaryResponse;
import com.hospital.auth.dto.MessageResponse;
import com.hospital.auth.security.CurrentUser;
import com.hospital.auth.security.JwtService;
import com.hospital.auth.security.UserRole;
import com.hospital.common.ResourceNotFoundException;
import com.hospital.common.UnauthorizedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CurrentUser currentUser;

    public AdminService(
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            CurrentUser currentUser
    ) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.currentUser = currentUser;
    }

    @Transactional(readOnly = true)
    public AdminLoginResponse login(AdminLoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), admin.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!admin.isActive()) {
            throw new UnauthorizedException("Admin account is inactive");
        }

        Long hospitalId = admin.getHospital().getId();
        String token = jwtService.generateToken(admin.getId(), UserRole.HOSPITAL_ADMIN, hospitalId);

        return new AdminLoginResponse(
                token,
                "Bearer",
                jwtService.getExpiryMinutes(),
                toProfile(admin)
        );
    }

    public MessageResponse logout() {
        return new MessageResponse("Logged out successfully");
    }

    @Transactional(readOnly = true)
    public AdminProfileResponse getCurrentAdmin() {
        Admin admin = adminRepository.findById(currentUser.userId())
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        Long tokenHospitalId = currentUser.hospitalId();
        if (tokenHospitalId == null || !tokenHospitalId.equals(admin.getHospital().getId())) {
            throw new UnauthorizedException("Invalid admin token");
        }

        return toProfile(admin);
    }

    private AdminProfileResponse toProfile(Admin admin) {
        return new AdminProfileResponse(
                admin.getId(),
                admin.getName(),
                admin.getEmail(),
                admin.getRole().name(),
                new HospitalSummaryResponse(admin.getHospital().getId(), admin.getHospital().getName())
        );
    }
}
