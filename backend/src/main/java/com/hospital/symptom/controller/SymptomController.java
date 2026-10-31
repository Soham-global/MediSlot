package com.hospital.symptom.controller;

import com.hospital.symptom.dto.SymptomSuggestionRequest;
import com.hospital.symptom.dto.SymptomSuggestionResponse;
import com.hospital.symptom.service.SymptomSuggestionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/symptoms")
public class SymptomController {

    private final SymptomSuggestionService symptomSuggestionService;

    public SymptomController(SymptomSuggestionService symptomSuggestionService) {
        this.symptomSuggestionService = symptomSuggestionService;
    }

    @PostMapping("/suggest")
    public SymptomSuggestionResponse suggest(
            @Valid @RequestBody SymptomSuggestionRequest request
    ) {
        return symptomSuggestionService.suggest(request);
    }
}
