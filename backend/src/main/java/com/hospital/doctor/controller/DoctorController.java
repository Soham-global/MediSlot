package com.hospital.doctor.controller;

import com.hospital.doctor.dto.DoctorDetailResponse;
import com.hospital.doctor.dto.DoctorResponse;
import com.hospital.doctor.service.DoctorService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping
    public List<DoctorResponse> listDoctors(
            @RequestParam(required = false) Long hospitalId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return doctorService.getDoctors(hospitalId, departmentId, name, date);
    }

    @GetMapping("/{id}")
    public DoctorDetailResponse getDoctor(@PathVariable Long id) {
        return doctorService.getDoctor(id);
    }
}
