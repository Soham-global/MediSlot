package com.hospital.common;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_JWT = "Bearer JWT";

    @Bean
    public OpenAPI hospitalOpenAPI() {
        SecurityScheme bearerScheme = new SecurityScheme()
                .name("Authorization")
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT");

        return new OpenAPI()
                .info(new Info()
                        .title("Hospital Appointment Booking API")
                        .description("APIs for Motherson employees and hospital administrators")
                        .version("1.0.0"))
                .components(new Components().addSecuritySchemes(BEARER_JWT, bearerScheme))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_JWT));
    }
}
