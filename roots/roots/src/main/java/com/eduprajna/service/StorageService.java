package com.eduprajna.service;

import java.io.File;
import java.io.IOException;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StorageService {
    // This should match the value in application.properties
    private static final String UPLOAD_DIR = "C:/Users/nishm/uploads";

    public String store(MultipartFile file) throws IOException {
        String filename = System.currentTimeMillis() + "_" + StringUtils.cleanPath(file.getOriginalFilename());
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) dir.mkdirs();
        File dest = new File(dir, filename); // <--- FIX: Always use the upload dir!
        file.transferTo(dest);
        // Return the relative path for DB
        return "/uploads/" + filename;
    }
}
