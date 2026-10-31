package com.hospital.doctor.service;

import com.hospital.common.BadRequestException;
import com.hospital.common.ResourceNotFoundException;
import com.hospital.doctor.Doctor;
import com.hospital.doctor.DoctorRepository;
import com.hospital.doctor.DoctorSchedule;
import com.hospital.doctor.DoctorScheduleRepository;
import com.hospital.doctor.dto.DoctorDepartmentResponse;
import com.hospital.doctor.dto.DoctorDetailResponse;
import com.hospital.doctor.dto.DoctorHospitalResponse;
import com.hospital.doctor.dto.DoctorResponse;
import com.hospital.doctor.dto.DoctorScheduleResponse;
import com.hospital.hospital.DepartmentRepository;
import com.hospital.hospital.HospitalRepository;
import com.hospital.slot.SlotStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

@Service
public class DoctorService {

    private static final ZoneId APP_ZONE = ZoneId.of("Asia/Kolkata");

    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;

    public DoctorService(
            DoctorRepository doctorRepository,
            DoctorScheduleRepository doctorScheduleRepository,
            HospitalRepository hospitalRepository,
            DepartmentRepository departmentRepository
    ) {
        this.doctorRepository = doctorRepository;
        this.doctorScheduleRepository = doctorScheduleRepository;
        this.hospitalRepository = hospitalRepository;
        this.departmentRepository = departmentRepository;
    }

    @Transactional(readOnly = true)
    public List<DoctorResponse> getDoctors(
            Long hospitalId,
            Long departmentId,
            String name,
            LocalDate date
    ) {
        LocalDate today = LocalDate.now(APP_ZONE);

        if (date != null && date.isBefore(today)) {
            throw new BadRequestException("Date cannot be in the past");
        }

        validateHospitalFilter(hospitalId);
        validateDepartmentFilter(departmentId);

        LocalTime earliestStart = date != null && date.equals(today)
                ? LocalTime.now(APP_ZONE)
                : LocalTime.MIN;

        return doctorRepository.findActiveDoctors(
                        hospitalId,
                        departmentId,
                        toNamePattern(name),
                        date,
                        earliestStart,
                        SlotStatus.AVAILABLE
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DoctorResponse> getDoctorsForHospital(
            Long hospitalId,
            Long departmentId,
            String name
    ) {
        requireActiveHospital(hospitalId);
        validateDepartmentFilter(departmentId);

        return doctorRepository.findActiveDoctors(
                        hospitalId,
                        departmentId,
                        toNamePattern(name),
                        null,
                        LocalTime.MIN,
                        SlotStatus.AVAILABLE
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DoctorDetailResponse getDoctor(Long id) {
        Doctor doctor = doctorRepository.findActiveByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        List<DoctorScheduleResponse> weeklyTimings =
                doctorScheduleRepository
                        .findByDoctorIdAndActiveTrueOrderByDayOfWeekAscStartTimeAsc(id)
                        .stream()
                        .map(this::toScheduleResponse)
                        .toList();

        return new DoctorDetailResponse(
                doctor.getId(),
                doctor.getName(),
                doctor.getSpecialization(),
                doctor.getQualification(),
                doctor.getExperienceYears(),
                toDepartment(doctor),
                toHospital(doctor),
                weeklyTimings
        );
    }

    private DoctorResponse toResponse(Doctor doctor) {
        return new DoctorResponse(
                doctor.getId(),
                doctor.getName(),
                doctor.getSpecialization(),
                doctor.getQualification(),
                doctor.getExperienceYears(),
                toDepartment(doctor),
                toHospital(doctor)
        );
    }

    private DoctorDepartmentResponse toDepartment(Doctor doctor) {
        return new DoctorDepartmentResponse(doctor.getDepartment().getId(), doctor.getDepartment().getName());
    }

    private DoctorHospitalResponse toHospital(Doctor doctor) {
        return new DoctorHospitalResponse(
                doctor.getHospital().getId(),
                doctor.getHospital().getName(),
                doctor.getHospital().getCity()
        );
    }

    private void validateHospitalFilter(Long hospitalId) {
        if (hospitalId != null) {
            requireActiveHospital(hospitalId);
        }
    }

    private void requireActiveHospital(Long hospitalId) {
        hospitalRepository.findByIdAndActiveTrue(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));
    }

    private void validateDepartmentFilter(Long departmentId) {
        if (departmentId != null && !departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Department not found");
        }
    }

    private String toNamePattern(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }

        return "%" + name.trim().toLowerCase(Locale.ROOT) + "%";
    }

    private DoctorScheduleResponse toScheduleResponse(DoctorSchedule schedule) {
        return new DoctorScheduleResponse(
                schedule.getDayOfWeek(),
                DayOfWeek.of(schedule.getDayOfWeek()).getDisplayName(TextStyle.FULL, Locale.ENGLISH),
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getSlotDurationMinutes()
        );
    }
}
