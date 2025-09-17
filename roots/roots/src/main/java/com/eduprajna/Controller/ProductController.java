package com.eduprajna.Controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.eduprajna.entity.Product;
import com.eduprajna.service.ProductService;
import com.eduprajna.service.StorageService;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = "*")

public class ProductController {
    @Autowired
    private ProductService productService;

    @Autowired
    private StorageService storageService;

    @GetMapping
    public ResponseEntity<List<Product>> getAll() {
        return ResponseEntity.ok(productService.getAll());
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Product> create(
            @RequestPart("product") Product p,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) throws IOException {
        if (imageFile != null && !imageFile.isEmpty()) {
            String relativePath = storageService.store(imageFile);
            p.setImageUrl(relativePath);
        }
        return ResponseEntity.ok(productService.save(p));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody Product p) {
        p.setId(id);
        return ResponseEntity.ok(productService.save(p));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}