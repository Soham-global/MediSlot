package com.hospital.hospital.controller;

import com.hospital.doctor.dto.DoctorResponse;
import com.hospital.doctor.service.DoctorService;
import com.hospital.hospital.dto.HospitalDetailResponse;
import com.hospital.hospital.dto.HospitalResponse;
import com.hospital.hospital.service.HospitalService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
public class HospitalController {

    private final HospitalService hospitalService;
    private final DoctorService doctorService;

    public HospitalController(HospitalService hospitalService, DoctorService doctorService) {
        this.hospitalService = hospitalService;
        this.doctorService = doctorService;
    }

    @GetMapping
    public List<HospitalResponse> listHospitals() {
        return hospitalService.listActiveHospitals();
    }

    @GetMapping("/{id}")
    public HospitalDetailResponse getHospital(@PathVariable Long id) {
        return hospitalService.getActiveHospital(id);
    }

    @GetMapping("/{id}/doctors")
    public List<DoctorResponse> getHospitalDoctors(
            @PathVariable Long id,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String name
    ) {
        return doctorService.getDoctorsForHospital(id, departmentId, name);
    }
}
