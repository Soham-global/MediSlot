package com.hospital.hospital.service;

import com.hospital.common.ResourceNotFoundException;
import com.hospital.hospital.DepartmentRepository;
import com.hospital.hospital.Hospital;
import com.hospital.hospital.HospitalRepository;
import com.hospital.hospital.dto.DepartmentResponse;
import com.hospital.hospital.dto.HospitalDetailResponse;
import com.hospital.hospital.dto.HospitalResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HospitalService {

    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;

    public HospitalService(
            HospitalRepository hospitalRepository,
            DepartmentRepository departmentRepository
    ) {
        this.hospitalRepository = hospitalRepository;
        this.departmentRepository = departmentRepository;
    }

    @Transactional(readOnly = true)
    public List<HospitalResponse> listActiveHospitals() {
        return hospitalRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public HospitalDetailResponse getActiveHospital(Long id) {
        Hospital hospital = hospitalRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));

        List<DepartmentResponse> departments =
                departmentRepository.findDepartmentsWithActiveDoctorsForHospital(id);

        return new HospitalDetailResponse(
                hospital.getId(),
                hospital.getName(),
                hospital.getAddress(),
                hospital.getCity(),
                hospital.getPhone(),
                hospital.getEmail(),
                hospital.getOpeningTime(),
                hospital.getClosingTime(),
                departments
        );
    }

    private HospitalResponse toResponse(Hospital hospital) {
        return new HospitalResponse(
                hospital.getId(),
                hospital.getName(),
                hospital.getAddress(),
                hospital.getCity(),
                hospital.getPhone(),
                hospital.getEmail(),
                hospital.getOpeningTime(),
                hospital.getClosingTime()
        );
    }
}
