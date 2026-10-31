package com.hospital.auth.controller;

import com.hospital.auth.dto.EmployeeProfileResponse;
import com.hospital.auth.dto.UpdateEmployeeProfileRequest;
import com.hospital.auth.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping("/me")
    public EmployeeProfileResponse me() {
        return employeeService.getCurrentProfile();
    }

    @PutMapping("/me")
    public EmployeeProfileResponse updateMe(@Valid @RequestBody UpdateEmployeeProfileRequest request) {
        return employeeService.updateCurrentProfile(request);
    }
}
