package com.hospital.hospital;

import com.hospital.hospital.dto.DepartmentResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Optional<Department> findByNameIgnoreCase(String name);

    List<Department> findAllByOrderByNameAsc();

    @Query("""
            select new com.hospital.hospital.dto.DepartmentResponse(d.id, d.name, d.description)
            from Department d
            where exists (
                select 1
                from Doctor doc
                where doc.department = d
                  and doc.hospital.id = :hospitalId
                  and doc.active = true
            )
            order by d.name
            """)
    List<DepartmentResponse> findDepartmentsWithActiveDoctorsForHospital(@Param("hospitalId") Long hospitalId);
}
