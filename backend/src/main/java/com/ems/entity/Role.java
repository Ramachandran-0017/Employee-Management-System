package com.ems.entity;

public enum Role {
    ADMIN,      // full access: manage employees, departments, and users
    MANAGER,    // can view/edit employees within their department
    EMPLOYEE    // can view/edit only their own profile
}
