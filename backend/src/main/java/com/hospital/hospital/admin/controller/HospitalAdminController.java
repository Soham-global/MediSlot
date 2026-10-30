package com.hospital.hospital.admin.controller;

import com.hospital.hospital.admin.dto.AdminDashboardResponse;
import com.hospital.hospital.admin.dto.AdminDepartmentResponse;
import com.hospital.hospital.admin.dto.AdminHospitalResponse;
import com.hospital.hospital.admin.dto.UpdateAdminHospitalRequest;
import com.hospital.hospital.admin.service.HospitalAdminService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class HospitalAdminController {

    private final HospitalAdminService hospitalAdminService;

    public HospitalAdminController(HospitalAdminService hospitalAdminService) {
        this.hospitalAdminService = hospitalAdminService;
    }

    @GetMapping("/dashboard")
    public AdminDashboardResponse getDashboard() {
        return hospitalAdminService.getDashboard();
    }

    @GetMapping("/hospital")
    public AdminHospitalResponse getHospital() {
        return hospitalAdminService.getHospital();
    }

    @PutMapping("/hospital")
    public AdminHospitalResponse updateHospital(@Valid @RequestBody UpdateAdminHospitalRequest request) {
        return hospitalAdminService.updateHospital(request);
    }

    @GetMapping("/departments")
    public List<AdminDepartmentResponse> getDepartments() {
        return hospitalAdminService.getDepartments();
    }
}
