package com.hospital.auth.service;

import com.hospital.auth.Employee;
import com.hospital.auth.EmployeeRepository;
import com.hospital.auth.dto.EmployeeLoginResponse;
import com.hospital.auth.dto.EmployeeProfileResponse;
import com.hospital.auth.dto.EmployeeSummaryResponse;
import com.hospital.auth.dto.LoginRequest;
import com.hospital.auth.dto.MessageResponse;
import com.hospital.auth.dto.UpdateEmployeeProfileRequest;
import com.hospital.auth.security.CurrentUser;
import com.hospital.auth.security.JwtService;
import com.hospital.auth.security.UserRole;
import com.hospital.common.ResourceNotFoundException;
import com.hospital.common.UnauthorizedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CurrentUser currentUser;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            CurrentUser currentUser
    ) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.currentUser = currentUser;
    }

    @Transactional(readOnly = true)
    public EmployeeLoginResponse login(LoginRequest request) {
        Employee employee = employeeRepository.findByEmployeeCode(request.employeeCode().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid employee code or password"));

        if (!passwordEncoder.matches(request.password(), employee.getPasswordHash())) {
            throw new UnauthorizedException("Invalid employee code or password");
        }

        String token = jwtService.generateToken(employee.getId(), UserRole.EMPLOYEE, null);

        return new EmployeeLoginResponse(
                token,
                "Bearer",
                jwtService.getExpiryMinutes(),
                toSummary(employee)
        );
    }

    public MessageResponse logout() {
        return new MessageResponse("Logged out successfully");
    }

    @Transactional(readOnly = true)
    public EmployeeProfileResponse getCurrentProfile() {
        return toProfile(findCurrentEmployee());
    }

    @Transactional
    public EmployeeProfileResponse updateCurrentProfile(UpdateEmployeeProfileRequest request) {
        Employee employee = findCurrentEmployee();
        employee.setName(request.name().trim());
        employee.setPhone(normalizeOptional(request.phone()));
        employee.setPlantLocation(normalizeOptional(request.plantLocation()));

        return toProfile(employeeRepository.save(employee));
    }

    private Employee findCurrentEmployee() {
        return employeeRepository.findById(currentUser.userId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
    }

    private EmployeeSummaryResponse toSummary(Employee employee) {
        return new EmployeeSummaryResponse(
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getName(),
                employee.getEmail()
        );
    }

    private EmployeeProfileResponse toProfile(Employee employee) {
        return new EmployeeProfileResponse(
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getName(),
                employee.getEmail(),
                employee.getPhone(),
                employee.getPlantLocation()
        );
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
