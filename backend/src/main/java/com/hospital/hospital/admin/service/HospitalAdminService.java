package com.hospital.hospital.admin.service;

import com.hospital.appointment.AppointmentRepository;
import com.hospital.appointment.AppointmentStatus;
import com.hospital.auth.security.CurrentUser;
import com.hospital.common.BadRequestException;
import com.hospital.common.ResourceNotFoundException;
import com.hospital.common.UnauthorizedException;
import com.hospital.doctor.DoctorRepository;
import com.hospital.hospital.Department;
import com.hospital.hospital.DepartmentRepository;
import com.hospital.hospital.Hospital;
import com.hospital.hospital.HospitalRepository;
import com.hospital.hospital.admin.dto.AdminDashboardResponse;
import com.hospital.hospital.admin.dto.AdminDepartmentResponse;
import com.hospital.hospital.admin.dto.AdminHospitalResponse;
import com.hospital.hospital.admin.dto.UpdateAdminHospitalRequest;
import com.hospital.slot.SlotStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class HospitalAdminService {

    private static final ZoneId APP_ZONE = ZoneId.of("Asia/Kolkata");
    private static final List<AppointmentStatus> TODAY_APPOINTMENT_STATUSES =
            List.of(AppointmentStatus.BOOKED, AppointmentStatus.CONFIRMED);

    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final CurrentUser currentUser;

    public HospitalAdminService(
            HospitalRepository hospitalRepository,
            DepartmentRepository departmentRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            CurrentUser currentUser
    ) {
        this.hospitalRepository = hospitalRepository;
        this.departmentRepository = departmentRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.currentUser = currentUser;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        Hospital hospital = findHospital();
        LocalDate today = LocalDate.now(APP_ZONE);
        LocalTime currentTime = LocalTime.now(APP_ZONE);

        long todayAppointments = appointmentRepository.countByHospitalIdAndSlotDateAndStatusIn(
                hospital.getId(),
                today,
                TODAY_APPOINTMENT_STATUSES
        );
        long pendingAppointments = appointmentRepository.countByHospitalIdAndStatusFromDate(
                hospital.getId(),
                AppointmentStatus.BOOKED,
                today
        );
        long completedToday = appointmentRepository.countByHospitalIdAndSlotDateAndStatusIn(
                hospital.getId(),
                today,
                List.of(AppointmentStatus.COMPLETED)
        );
        long totalDoctors = doctorRepository.countByHospitalIdAndActiveTrue(hospital.getId());
        long doctorsAvailableToday = doctorRepository.countAvailableDoctorsToday(
                hospital.getId(),
                today,
                currentTime,
                SlotStatus.AVAILABLE
        );

        return new AdminDashboardResponse(
                hospital.getName(),
                todayAppointments,
                pendingAppointments,
                completedToday,
                totalDoctors,
                doctorsAvailableToday
        );
    }

    @Transactional(readOnly = true)
    public AdminHospitalResponse getHospital() {
        return toResponse(findHospital());
    }

    @Transactional
    public AdminHospitalResponse updateHospital(UpdateAdminHospitalRequest request) {
        if (!request.closingTime().isAfter(request.openingTime())) {
            throw new BadRequestException("Closing time must be after opening time");
        }

        Hospital hospital = findHospital();
        hospital.setName(request.name().trim());
        hospital.setAddress(request.address().trim());
        hospital.setCity(request.city().trim());
        hospital.setPhone(request.phone().trim());
        hospital.setEmail(request.email().trim());
        hospital.setOpeningTime(request.openingTime());
        hospital.setClosingTime(request.closingTime());

        return toResponse(hospitalRepository.save(hospital));
    }

    @Transactional(readOnly = true)
    public List<AdminDepartmentResponse> getDepartments() {
        return departmentRepository.findAllByOrderByNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    private Hospital findHospital() {
        Long hospitalId = currentUser.hospitalId();
        if (hospitalId == null) {
            throw new UnauthorizedException("Invalid admin token");
        }

        return hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));
    }

    private AdminHospitalResponse toResponse(Hospital hospital) {
        return new AdminHospitalResponse(
                hospital.getId(),
                hospital.getName(),
                hospital.getAddress(),
                hospital.getCity(),
                hospital.getPhone(),
                hospital.getEmail(),
                hospital.getOpeningTime(),
                hospital.getClosingTime(),
                hospital.isActive()
        );
    }

    private AdminDepartmentResponse toResponse(Department department) {
        return new AdminDepartmentResponse(
                department.getId(),
                department.getName(),
                department.getDescription()
        );
    }
}
