package com.eduprajna.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Serve files from C:/Users/nishm/uploads at /uploads/** URL pattern
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:C:/Users/nishm/uploads/");
    }
}
