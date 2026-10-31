package com.hospital.appointment.admin.controller;

import com.hospital.appointment.admin.dto.AdminAppointmentPageResponse;
import com.hospital.appointment.admin.dto.AdminAppointmentResponse;
import com.hospital.appointment.admin.dto.CancelAppointmentRequest;
import com.hospital.appointment.admin.service.AppointmentAdminService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/appointments")
public class AppointmentAdminController {

    private final AppointmentAdminService appointmentAdminService;

    public AppointmentAdminController(AppointmentAdminService appointmentAdminService) {
        this.appointmentAdminService = appointmentAdminService;
    }

    @GetMapping
    public AdminAppointmentPageResponse getAppointments(
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return appointmentAdminService.getAppointments(
                doctorId,
                date,
                status,
                page,
                size
        );
    }

    @GetMapping("/{id}")
    public AdminAppointmentResponse getAppointment(@PathVariable Long id) {
        return appointmentAdminService.getAppointment(id);
    }

    @PutMapping("/{id}/confirm")
    public AdminAppointmentResponse confirmAppointment(@PathVariable Long id) {
        return appointmentAdminService.confirmAppointment(id);
    }

    @PutMapping("/{id}/cancel")
    public AdminAppointmentResponse cancelAppointment(
            @PathVariable Long id,
            @RequestBody(required = false) CancelAppointmentRequest request
    ) {
        return appointmentAdminService.cancelAppointment(id);
    }

    @PutMapping("/{id}/complete")
    public AdminAppointmentResponse completeAppointment(@PathVariable Long id) {
        return appointmentAdminService.completeAppointment(id);
    }

    @PutMapping("/{id}/no-show")
    public AdminAppointmentResponse noShowAppointment(@PathVariable Long id) {
        return appointmentAdminService.markNoShow(id);
    }
}
