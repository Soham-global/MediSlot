package com.hospital.doctor;

import com.hospital.slot.SlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findByHospitalId(Long hospitalId);

    List<Doctor> findByDepartmentId(Long departmentId);

    List<Doctor> findByHospitalIdAndActiveTrue(Long hospitalId);

    List<Doctor> findByActiveTrue();

    @Query("""
            select d
            from Doctor d
            join fetch d.hospital
            join fetch d.department
            where d.id = :id
              and d.active = true
              and d.hospital.active = true
            """)
    Optional<Doctor> findActiveByIdWithDetails(@Param("id") Long id);

    @Query("""
            select d
            from Doctor d
            join fetch d.department
            join fetch d.hospital
            where d.active = true
              and d.hospital.active = true
              and (:hospitalId is null or d.hospital.id = :hospitalId)
              and (:departmentId is null or d.department.id = :departmentId)
              and (:namePattern is null or lower(d.name) like :namePattern)
              and (:date is null or exists (
                  select 1
                  from Slot s
                  where s.doctor = d
                    and s.slotDate = :date
                    and s.status = :slotStatus
                    and s.startTime >= :earliestStart
              ))
            order by lower(d.name), d.id
            """)
    List<Doctor> findActiveDoctors(
            @Param("hospitalId") Long hospitalId,
            @Param("departmentId") Long departmentId,
            @Param("namePattern") String namePattern,
            @Param("date") LocalDate date,
            @Param("earliestStart") LocalTime earliestStart,
            @Param("slotStatus") SlotStatus slotStatus
    );
}
