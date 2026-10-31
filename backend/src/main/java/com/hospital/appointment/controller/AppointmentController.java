package com.hospital.appointment.controller;

import com.hospital.appointment.dto.AppointmentResponse;
import com.hospital.appointment.dto.CreateAppointmentRequest;
import com.hospital.appointment.service.AppointmentService;
import com.hospital.auth.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final CurrentUser currentUser;

    public AppointmentController(AppointmentService appointmentService, CurrentUser currentUser) {
        this.appointmentService = appointmentService;
        this.currentUser = currentUser;
    }

    @PostMapping
    public ResponseEntity<AppointmentResponse> bookAppointment(
            @Valid @RequestBody CreateAppointmentRequest request
    ) {
        AppointmentResponse response = appointmentService.bookAppointment(
                currentUser.userId(),
                request
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public List<AppointmentResponse> getMyAppointments(
            @RequestParam(required = false) String status
    ) {
        return appointmentService.getMyAppointments(currentUser.userId(), status);
    }

    @GetMapping("/{id}")
    public AppointmentResponse getAppointment(@PathVariable Long id) {
        return appointmentService.getAppointment(id, currentUser.userId());
    }

    @PutMapping("/{id}/cancel")
    public AppointmentResponse cancelAppointment(@PathVariable Long id) {
        return appointmentService.cancelAppointment(id, currentUser.userId());
    }
}
