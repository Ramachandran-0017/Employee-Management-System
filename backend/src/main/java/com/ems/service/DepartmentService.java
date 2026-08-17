package com.ems.service;

import com.ems.dto.DepartmentRequest;
import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.exception.DuplicateResourceException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<Department> getAll() {

        List<Department> departments = departmentRepository.findAll();

        for (Department department : departments) {
            List<Employee> employees = employeeRepository.findByDepartment_Id(department.getId());

            department.setEmployees(employees);
        }

        return departments;
    }

    @Transactional
    public Department create(DepartmentRequest request) {

        departmentRepository.findByName(request.getName())
                .ifPresent(d -> {
                    throw new DuplicateResourceException(
                            "Department already exists: " + request.getName());
                });

        Department department = Department.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        return departmentRepository.save(department);
    }

    @Transactional
    public Department update(Long id, DepartmentRequest request) {

        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found with id: " + id));

        department.setName(request.getName());
        department.setDescription(request.getDescription());

        return departmentRepository.save(department);
    }

    @Transactional
    public void delete(Long id) {

        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Department not found with id: " + id);
        }

        // Find employees belonging to this department
        List<Employee> affected = employeeRepository.findByDepartment_Id(id);

        // Unassign employees before deleting department
        for (Employee employee : affected) {
            employee.setDepartment(null);
        }

        employeeRepository.saveAll(affected);

        // Delete department
        departmentRepository.deleteById(id);
    }
}