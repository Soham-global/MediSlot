package com.hospital.doctor;

import com.hospital.slot.SlotStatus;
import com.hospital.symptom.dto.SuggestedDoctorRow;
import org.springframework.data.domain.Pageable;
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

    long countByHospitalIdAndActiveTrue(Long hospitalId);

    @Query("""
            select d
            from Doctor d
            join fetch d.department
            where d.hospital.id = :hospitalId
              and (:departmentId is null or d.department.id = :departmentId)
              and (:namePattern is null or lower(d.name) like :namePattern)
              and (:isActive is null or d.active = :isActive)
            order by lower(d.name), d.id
            """)
    List<Doctor> findAdminDoctors(
            @Param("hospitalId") Long hospitalId,
            @Param("departmentId") Long departmentId,
            @Param("namePattern") String namePattern,
            @Param("isActive") Boolean isActive
    );

    @Query("""
            select d
            from Doctor d
            join fetch d.department
            join fetch d.hospital
            where d.id = :id
              and d.hospital.id = :hospitalId
            """)
    Optional<Doctor> findByIdAndHospitalIdWithDetails(
            @Param("id") Long id,
            @Param("hospitalId") Long hospitalId
    );

    @Query("""
            select count(distinct d)
            from Doctor d
            join Slot s on s.doctor = d
            where d.hospital.id = :hospitalId
              and d.active = true
              and s.slotDate = :date
              and s.startTime >= :currentTime
              and s.status = :status
            """)
    long countAvailableDoctorsToday(
            @Param("hospitalId") Long hospitalId,
            @Param("date") LocalDate date,
            @Param("currentTime") LocalTime currentTime,
            @Param("status") SlotStatus status
    );

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

    @Query("""
            select new com.hospital.symptom.dto.SuggestedDoctorRow(
                d.id,
                d.name,
                d.specialization,
                d.experienceYears,
                h.id,
                h.name,
                h.city,
                s.id,
                s.slotDate,
                s.startTime
            )
            from Doctor d
            join d.hospital h
            join Slot s on s.doctor = d
            where d.department.id = :departmentId
              and d.active = true
              and h.active = true
              and s.status = :status
              and (s.slotDate > :today
                   or (s.slotDate = :today and s.startTime >= :currentTime))
              and not exists (
                  select 1
                  from Slot earlier
                  where earlier.doctor = d
                    and earlier.status = :status
                    and (earlier.slotDate > :today
                         or (earlier.slotDate = :today and earlier.startTime >= :currentTime))
                    and (earlier.slotDate < s.slotDate
                         or (earlier.slotDate = s.slotDate and earlier.startTime < s.startTime))
              )
            order by s.slotDate asc, s.startTime asc, d.id asc
            """)
    List<SuggestedDoctorRow> findSuggestedDoctors(
            @Param("departmentId") Long departmentId,
            @Param("today") LocalDate today,
            @Param("currentTime") LocalTime currentTime,
            @Param("status") SlotStatus status,
            Pageable pageable
    );
}
