package com.hospital.doctor;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findByHospitalId(Long hospitalId);

    List<Doctor> findByDepartmentId(Long departmentId);

    List<Doctor> findByHospitalIdAndActiveTrue(Long hospitalId);

    List<Doctor> findByActiveTrue();
}
