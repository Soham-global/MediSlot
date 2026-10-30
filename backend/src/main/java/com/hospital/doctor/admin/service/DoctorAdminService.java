package com.hospital.doctor.admin.service;

import com.hospital.appointment.AppointmentRepository;
import com.hospital.appointment.AppointmentStatus;
import com.hospital.auth.security.CurrentUser;
import com.hospital.common.ConflictException;
import com.hospital.common.ResourceNotFoundException;
import com.hospital.common.UnauthorizedException;
import com.hospital.doctor.Doctor;
import com.hospital.doctor.DoctorRepository;
import com.hospital.doctor.DoctorSchedule;
import com.hospital.doctor.DoctorScheduleRepository;
import com.hospital.doctor.admin.dto.AdminDoctorDeleteResponse;
import com.hospital.doctor.admin.dto.AdminDoctorDepartmentResponse;
import com.hospital.doctor.admin.dto.AdminDoctorDetailResponse;
import com.hospital.doctor.admin.dto.AdminDoctorResponse;
import com.hospital.doctor.admin.dto.AdminDoctorScheduleResponse;
import com.hospital.doctor.admin.dto.AdminDoctorStatusResponse;
import com.hospital.doctor.admin.dto.CreateAdminDoctorRequest;
import com.hospital.doctor.admin.dto.UpdateAdminDoctorRequest;
import com.hospital.doctor.admin.dto.UpdateDoctorStatusRequest;
import com.hospital.hospital.Department;
import com.hospital.hospital.DepartmentRepository;
import com.hospital.hospital.Hospital;
import com.hospital.hospital.HospitalRepository;
import com.hospital.slot.SlotRepository;
import com.hospital.slot.SlotStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

@Service
public class DoctorAdminService {

    private static final ZoneId APP_ZONE = ZoneId.of("Asia/Kolkata");
    private static final List<AppointmentStatus> UPCOMING_APPOINTMENT_STATUSES =
            List.of(AppointmentStatus.BOOKED, AppointmentStatus.CONFIRMED);

    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;
    private final SlotRepository slotRepository;
    private final AppointmentRepository appointmentRepository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final CurrentUser currentUser;

    public DoctorAdminService(
            DoctorRepository doctorRepository,
            DoctorScheduleRepository doctorScheduleRepository,
            SlotRepository slotRepository,
            AppointmentRepository appointmentRepository,
            HospitalRepository hospitalRepository,
            DepartmentRepository departmentRepository,
            CurrentUser currentUser
    ) {
        this.doctorRepository = doctorRepository;
        this.doctorScheduleRepository = doctorScheduleRepository;
        this.slotRepository = slotRepository;
        this.appointmentRepository = appointmentRepository;
        this.hospitalRepository = hospitalRepository;
        this.departmentRepository = departmentRepository;
        this.currentUser = currentUser;
    }

    @Transactional(readOnly = true)
    public List<AdminDoctorResponse> getDoctors(Long departmentId, String name, Boolean isActive) {
        if (departmentId != null && !departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Department not found");
        }

        return doctorRepository.findAdminDoctors(
                        hospitalId(),
                        departmentId,
                        toNamePattern(name),
                        isActive
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminDoctorResponse createDoctor(CreateAdminDoctorRequest request) {
        Long hospitalId = hospitalId();
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));
        Department department = requireDepartment(request.departmentId());

        Doctor doctor = new Doctor();
        doctor.setHospital(hospital);
        doctor.setDepartment(department);
        doctor.setName(request.name().trim());
        doctor.setSpecialization(request.specialization().trim());
        doctor.setQualification(request.qualification().trim());
        doctor.setExperienceYears(request.experienceYears());
        doctor.setActive(true);

        return toResponse(doctorRepository.save(doctor));
    }

    @Transactional(readOnly = true)
    public AdminDoctorDetailResponse getDoctor(Long id) {
        Doctor doctor = findDoctor(id);

        List<AdminDoctorScheduleResponse> weeklyTimings =
                doctorScheduleRepository
                        .findByDoctorIdAndActiveTrueOrderByDayOfWeekAscStartTimeAsc(id)
                        .stream()
                        .map(this::toScheduleResponse)
                        .toList();

        return new AdminDoctorDetailResponse(
                doctor.getId(),
                doctor.getName(),
                doctor.getSpecialization(),
                doctor.getQualification(),
                doctor.getExperienceYears(),
                doctor.isActive(),
                toDepartment(doctor),
                weeklyTimings
        );
    }

    @Transactional
    public AdminDoctorResponse updateDoctor(Long id, UpdateAdminDoctorRequest request) {
        Doctor doctor = findDoctor(id);
        Department department = requireDepartment(request.departmentId());

        doctor.setDepartment(department);
        doctor.setName(request.name().trim());
        doctor.setSpecialization(request.specialization().trim());
        doctor.setQualification(request.qualification().trim());
        doctor.setExperienceYears(request.experienceYears());

        return toResponse(doctorRepository.save(doctor));
    }

    @Transactional
    public AdminDoctorStatusResponse updateStatus(Long id, UpdateDoctorStatusRequest request) {
        Doctor doctor = findDoctor(id);
        doctor.setActive(request.isActive());
        doctorRepository.save(doctor);

        long upcomingAppointments = appointmentRepository.countByDoctorIdAndStatusInFromDate(
                doctor.getId(),
                UPCOMING_APPOINTMENT_STATUSES,
                LocalDate.now(APP_ZONE)
        );

        return new AdminDoctorStatusResponse(
                doctor.getId(),
                doctor.isActive(),
                upcomingAppointments
        );
    }

    @Transactional
    public AdminDoctorDeleteResponse deleteDoctor(Long id) {
        Doctor doctor = findDoctor(id);

        boolean hasAppointments = appointmentRepository.existsByDoctorId(id);
        boolean hasBookedSlots = slotRepository.existsByDoctorIdAndStatus(id, SlotStatus.BOOKED);

        if (hasAppointments || hasBookedSlots) {
            throw new ConflictException("Doctor has appointments. Deactivate instead.");
        }

        doctorScheduleRepository.deleteAllByDoctorId(id);
        slotRepository.deleteAllByDoctorId(id);
        doctorRepository.delete(doctor);

        return new AdminDoctorDeleteResponse(id, "Doctor deleted successfully");
    }

    private Doctor findDoctor(Long id) {
        return doctorRepository.findByIdAndHospitalIdWithDetails(id, hospitalId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
    }

    private Department requireDepartment(Long departmentId) {
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
    }

    private Long hospitalId() {
        Long hospitalId = currentUser.hospitalId();
        if (hospitalId == null) {
            throw new UnauthorizedException("Invalid admin token");
        }
        return hospitalId;
    }

    private AdminDoctorResponse toResponse(Doctor doctor) {
        return new AdminDoctorResponse(
                doctor.getId(),
                doctor.getName(),
                doctor.getSpecialization(),
                doctor.getQualification(),
                doctor.getExperienceYears(),
                doctor.isActive(),
                toDepartment(doctor)
        );
    }

    private AdminDoctorDepartmentResponse toDepartment(Doctor doctor) {
        return new AdminDoctorDepartmentResponse(
                doctor.getDepartment().getId(),
                doctor.getDepartment().getName()
        );
    }

    private AdminDoctorScheduleResponse toScheduleResponse(DoctorSchedule schedule) {
        return new AdminDoctorScheduleResponse(
                schedule.getDayOfWeek(),
                DayOfWeek.of(schedule.getDayOfWeek()).getDisplayName(TextStyle.FULL, Locale.ENGLISH),
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getSlotDurationMinutes()
        );
    }

    private String toNamePattern(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }

        return "%" + name.trim().toLowerCase(Locale.ROOT) + "%";
    }
}
