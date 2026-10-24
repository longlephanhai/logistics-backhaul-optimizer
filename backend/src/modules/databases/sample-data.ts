export const ADMIN_ROLE = "SUPER_ADMIN";
export const USER_ROLE = "NORMAL_USER";

export const INIT_PERMISSIONS = [
    {
        "name": "Create User",
        "apiPath": "/api/v1/users",
        "method": "POST",
        "module": "USERS",
    },
    {
        "name": "Get User by Id",
        "apiPath": "/api/v1/users/:id",
        "method": "GET",
        "module": "USERS",
    },
    {
        "name": "Get User with paginate",
        "apiPath": "/api/v1/users",
        "method": "GET",
        "module": "USERS",
    },
    {
        "name": "Update User",
        "apiPath": "/api/v1/users/:id",
        "method": "PATCH",
        "module": "USERS",
    },
    {
        "name": "Delete User",
        "apiPath": "/api/v1/users/:id",
        "method": "DELETE",
        "module": "USERS",
    },
    {
        "name": "Create a permission",
        "apiPath": "/api/v1/permissions",
        "method": "POST",
        "module": "PERMISSIONS",
    },
    {
        "name": "Fetch Permission with paginate",
        "apiPath": "/api/v1/permissions",
        "method": "GET",
        "module": "PERMISSIONS",
    },
    {
        "name": "Fetch permission by id",
        "apiPath": "/api/v1/permissions/:id",
        "method": "GET",
        "module": "PERMISSIONS",
    },
    {
        "name": "Update a permission",
        "apiPath": "/api/v1/permissions/:id",
        "method": "PATCH",
        "module": "PERMISSIONS",
    },
    {
        "name": "Delete a permission",
        "apiPath": "/api/v1/permissions/:id",
        "method": "DELETE",
        "module": "PERMISSIONS",
    },
    {
        "name": "Create Role",
        "apiPath": "/api/v1/roles",
        "method": "POST",
        "module": "ROLES",
    },
    {
        "name": "Fetch roles with paginate",
        "apiPath": "/api/v1/roles",
        "method": "GET",
        "module": "ROLES",
    },
    {
        "name": "Fetch role by id",
        "apiPath": "/api/v1/roles/:id",
        "method": "GET",
        "module": "ROLES",
    },
    {
        "name": "Update Role",
        "apiPath": "/api/v1/roles/:id",
        "method": "PATCH",
        "module": "ROLES",
    },
    {
        "name": "Delete a Role",
        "apiPath": "/api/v1/roles/:id",
        "method": "DELETE",
        "module": "ROLES",
    }
]