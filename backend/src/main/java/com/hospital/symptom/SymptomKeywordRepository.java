package com.hospital.symptom;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SymptomKeywordRepository extends JpaRepository<SymptomKeyword, Long> {

    List<SymptomKeyword> findByDepartmentId(Long departmentId);

    List<SymptomKeyword> findByEmergencyTrue();

    @Query("""
            select k
            from SymptomKeyword k
            join fetch k.department
            order by k.keyword asc
            """)
    List<SymptomKeyword> findAllWithDepartment();
}
