package com.eduprajna.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
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
        File dest = new File(dir, filename); // Always use the upload dir
        file.transferTo(dest);
        // Return an API-served relative path for DB so frontend can fetch via baseURL
        return "/admin/products/images/" + filename; // served by ProductController
    }

    public Resource loadAsResource(String filename) throws IOException {
        Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
        if (!Files.exists(filePath)) {
            throw new IOException("File not found: " + filename);
        }
        return new InputStreamResource(new FileInputStream(filePath.toFile())) {
            @Override
            public String getFilename() {
                return filePath.getFileName().toString();
            }

            @Override
            public long contentLength() throws IOException {
                return Files.size(filePath);
            }
        };
    }

    public MediaType probeMediaType(String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            String type = Files.probeContentType(filePath);
            if (type != null) return MediaType.parseMediaType(type);
        } catch (Exception ignored) {}
        return MediaType.APPLICATION_OCTET_STREAM;
    }

    public List<String> listAll() {
        List<String> files = new ArrayList<>();
        File dir = new File(UPLOAD_DIR);
        if (dir.exists() && dir.isDirectory()) {
            File[] list = dir.listFiles();
            if (list != null) {
                for (File f : list) {
                    if (f.isFile()) {
                        files.add(f.getName());
                    }
                }
            }
        }
        return files;
    }

    // Delete a stored file by its filename, returns true if deleted or not present
    public boolean delete(String filename) {
        if (filename == null || filename.isEmpty()) return false;
        File f = Paths.get(UPLOAD_DIR).resolve(filename).normalize().toFile();
        if (!f.exists()) return true; // already gone
        return f.delete();
    }

    // Extracts filename from an API url like "/api/admin/products/images/abc.jpg"
    public String extractFilenameFromUrl(String url) {
        if (url == null) return null;
        int idx = url.lastIndexOf('/') + 1;
        if (idx <= 0 || idx >= url.length()) return null;
        return url.substring(idx);
    }
}
