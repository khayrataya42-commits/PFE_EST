this is the authentication microservice for the project
# Authentication Microservice
This is the authentication microservice for the project. It is responsible for authenticating users and generating JWT tokens for them. It is written in Python using the Fastapi framework. The microservice uses a H2 database to store user information. The microservice provides the following endpoints:
- /auth/login: This endpoint is used to authenticate users. It takes a username and password as input and returns a JWT token if the user is authenticated.
- /auth/admin: This endpoint is used to authenticate admin users. It takes a username and password as input and returns a JWT token if the user is an admin.
- /auth/students: This endpoint is used to authenticate student users. It takes a username and password as input and returns a JWT token if the user is a student.
- /auth/teachers: This endpoint is used to authenticate teacher users. It takes a username and password as input and returns a JWT token if the user is a teacher.