package com.hospital.doctor.admin.controller;

import com.hospital.doctor.admin.dto.AdminDoctorDeleteResponse;
import com.hospital.doctor.admin.dto.AdminDoctorDetailResponse;
import com.hospital.doctor.admin.dto.AdminDoctorResponse;
import com.hospital.doctor.admin.dto.AdminDoctorStatusResponse;
import com.hospital.doctor.admin.dto.CreateAdminDoctorRequest;
import com.hospital.doctor.admin.dto.UpdateAdminDoctorRequest;
import com.hospital.doctor.admin.dto.UpdateDoctorStatusRequest;
import com.hospital.doctor.admin.service.DoctorAdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/doctors")
public class DoctorAdminController {

    private final DoctorAdminService doctorAdminService;

    public DoctorAdminController(DoctorAdminService doctorAdminService) {
        this.doctorAdminService = doctorAdminService;
    }

    @GetMapping
    public List<AdminDoctorResponse> listDoctors(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean isActive
    ) {
        return doctorAdminService.getDoctors(departmentId, name, isActive);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminDoctorResponse createDoctor(@Valid @RequestBody CreateAdminDoctorRequest request) {
        return doctorAdminService.createDoctor(request);
    }

    @GetMapping("/{id}")
    public AdminDoctorDetailResponse getDoctor(@PathVariable Long id) {
        return doctorAdminService.getDoctor(id);
    }

    @PutMapping("/{id}")
    public AdminDoctorResponse updateDoctor(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAdminDoctorRequest request
    ) {
        return doctorAdminService.updateDoctor(id, request);
    }

    @PutMapping("/{id}/status")
    public AdminDoctorStatusResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDoctorStatusRequest request
    ) {
        return doctorAdminService.updateStatus(id, request);
    }

    @DeleteMapping("/{id}")
    public AdminDoctorDeleteResponse deleteDoctor(@PathVariable Long id) {
        return doctorAdminService.deleteDoctor(id);
    }
}
