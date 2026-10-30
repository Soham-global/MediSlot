package com.hospital.symptom;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SymptomKeywordRepository extends JpaRepository<SymptomKeyword, Long> {

    List<SymptomKeyword> findByDepartmentId(Long departmentId);

    List<SymptomKeyword> findByEmergencyTrue();
}
