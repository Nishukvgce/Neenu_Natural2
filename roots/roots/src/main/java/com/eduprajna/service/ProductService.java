package com.eduprajna.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.eduprajna.entity.Product;
import com.eduprajna.repository.ProductRepository;


@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;
    public List<Product> getAll() { return productRepository.findAll(); }
    public Product save(Product p) { return productRepository.save(p); }
    public void delete(Long id) { productRepository.deleteById(id); }
    public Product getById(Long id) { return productRepository.findById(id).orElse(null); }
    
}