/**
 *  ? Tip:
 *
 * For Actual Node.js - Role Based Authorization Tutorial with Example API
 * Refer: https://jasonwatmore.com/post/2018/11/28/nodejs-role-based-authorization-tutorial-with-example-api
 * Running an Angular 9 client app with the Node.js Role Based Auth API
 */

import {
  HTTP_INTERCEPTORS,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { JobApplication, Role, User } from 'app/auth/models';
import { Observable, of, throwError } from 'rxjs';
import { delay, dematerialize, materialize, mergeMap } from 'rxjs/operators';

import { Injectable } from '@angular/core';

// Users with role
const users: User[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin',
    firstName: 'Lyric',
    lastName: 'Horton',
    phoneNumber: '0540999158',
    avatar: 'avatar-s-11.jpg',
    role: Role.Admin
  },
  {
    id: 2,
    username: 'recruiter1',
    password: 'recruiter1',
    firstName: 'Hemza',
    lastName: 'Roudali',
    phoneNumber: '0540990041',
    avatar: 'avatar-s-13.jpg',
    role: Role.Recruiter
  },
  {
    id: 3,
    username: 'employee1',
    password: 'employee1',
    firstName: 'Imani',
    lastName: 'Snyder',
    phoneNumber: '0673767641',
    avatar: 'avatar-s-3.jpg',
    role: Role.Employee
  },
  {
    id: 4,
    username: 'recruiter2',
    password: 'recruiter2',
    firstName: 'Ochieng',
    lastName: 'Chidike',
    phoneNumber: '0679607611',
    avatar: 'avatar-s-7.jpg',
    role: Role.Recruiter
  }
];

// Job applications
const jobApplications: JobApplication[] = [
  {
    id: 1,
    recruiter: 2,
    employee: 3,
    coverLetter: 'Sed eget purus tempor, dictum dolor sed, scelerisque nisi. Aenean fermentum orci id lacus gravida, non pretium ipsum tempus. Aliquam blandit blandit purus.',
    status: 'Pending'
  },
  {
    id: 2,
    recruiter: 4,
    employee: 3,
    coverLetter: 'Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce tempus mauris in lobortis fringilla. Aenean pulvinar velit vel dapibus accumsan.',
    status: 'Active'
  }
];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { url, method, headers, body } = request;

    // wrap in delayed observable to simulate server api call
    return of(null).pipe(mergeMap(handleRoute));
    // .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
    // .pipe(delay(500))
    // .pipe(dematerialize());

    function handleRoute() {
      switch (true) {
        case url.endsWith('/users/authenticate') && method === 'POST':
          return authenticate();
        case url.endsWith('/users/register') && method === 'POST':
          return register();
        case url.endsWith('/users') && method === 'GET':
          return getUsers();
        case url.endsWith('/recruiters') && method === 'GET':
          return getRecruiters();
        case url.endsWith('/employees') && method === 'GET':
          return getEmployees();
        case url.match(/\/users\/\d+$/) && method === 'GET':
          return getUserById();
        case url.match(/\/users\/\d+$/) && method === 'DELETE':
          return deleteUserById();
        case url.match(/\/users\/\d+$/) && method === 'PUT':
          return updateUserById();
          
        case url.endsWith('/job-applications') && method === 'GET':
          return getJobApplications();
        case url.match(/\/job-applications\/recruiter\/\d+$/) && method === 'GET':
          return getJobApplicationsByRecruiter();
        case url.match(/\/job-applications\/employee\/\d+$/) && method === 'GET':
          return getJobApplicationsByEmployee();
        case url.endsWith('/job-applications') && method === 'POST':
          return createJobApplication();
        case url.match(/\/job-applications\/\d+$/) && method === 'DELETE':
          return deleteJobApplicationById();
        case url.match(/\/job-applications\/\d+$/) && method === 'PUT':
          return updateJobApplicationById();
        default:
          // pass through any requests not handled above
          return next.handle(request);
      }
    }

    // route functions

    function authenticate() {
      const { username, password } = body;
      const user = users.find(x => x.username === username && x.password === password);
      if (!user) return error('Username or password is incorrect');
      return ok({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        role: user.role,
        token: `fake-jwt-token.${user.id}`
      });
    }

    function register() {
      const newUser = body as User; // Assuming the request body contains user details
    
      // Check if the username is already taken
      if (users.some(user => user.username === newUser.username)) {
        return error('Username is already taken');
      }
    
      // Assign a new ID for the user (for simplicity, you can use a simple increment)
      const newUserId = users.length + 1;
    
      // Add the new user to the users array
      users.push({
        id: newUserId,
        username: newUser.username,
        password: newUser.password,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phoneNumber: newUser.phoneNumber,
        avatar: 'avatar-s-24.jpg',
        role: newUser.role
      });
    
      return ok({ message: 'Registration successful' });
    }

    function getUsers() {
      if (!isAdmin()) return unauthorized();
      return ok(users.filter(user => user.role !== 'Admin'));
    }

    function getRecruiters() {
      return ok(users.filter(user => user.role === 'Recruiter'));
    }

    function getEmployees() {
      return ok(users.filter(user => user.role === 'Employee'));
    }

    function getUserById() {
      if (!isLoggedIn()) return unauthorized();

      // only admins can access other user records
      if (!isAdmin() && currentUser().id !== idFromUrl()) return unauthorized();

      const user = users.find(x => x.id === idFromUrl());
      return ok(user);
    }

    function deleteUserById() {
      if (!isLoggedIn()) return unauthorized();

      // Extract user ID from the URL
      const userId = idFromUrl();

      // Find the index of the user with the specified ID
      const userIndex = users.findIndex((x) => x.id === userId);

      // Check if the user with the specified ID exists
      if (userIndex === -1) {
        return error('User not found');
      }

      // Only admins can delete users
      if (!isAdmin()) return unauthorized();

      // Remove the user from the users array
      const deletedUser = users.splice(userIndex, 1)[0];

      return ok(deletedUser);
    }

    function updateUserById() {
      if (!isLoggedIn()) return unauthorized();
    
      // Extract user ID from the URL
      const userId = idFromUrl();
    
      // Find the index of the user with the specified ID
      const userIndex = users.findIndex((x) => x.id === userId);
    
      // Check if the user with the specified ID exists
      if (userIndex === -1) {
        return error('User not found');
      }
    
      // Only admins can update users
      if (!isAdmin()) return unauthorized();
    
      // Get the existing user
      const existingUser = users[userIndex];
    
      // Update the user with the new data from the request body
      const updatedUser = { ...existingUser, ...body };
    
      // Update the user in the users array
      users[userIndex] = updatedUser;
    
      return ok(updatedUser);
    }

    function getJobApplications() {
      return ok(jobApplications);
    }

    function getJobApplicationsByRecruiter() {
      return ok(jobApplications.filter(job => job.recruiter === currentUser().id));
    }

    function getJobApplicationsByEmployee() {
      return ok(jobApplications.filter(job => job.employee === currentUser().id));
    }

    function createJobApplication() {
      const newJobApplication = body; // Assuming the request body contains user details
    
      // Assign a new ID for the job (for simplicity, you can use a simple increment)
      const newJobApplicationId = jobApplications.length + 1;
    
      // Add the new job to the job applications array
      jobApplications.push({
        id: newJobApplicationId,
        recruiter: parseInt(newJobApplication.recruiter),
        employee: parseInt(newJobApplication.employee),
        coverLetter: newJobApplication.coverLetter,
        status: newJobApplication.status
      });
    
      return ok({ message: 'Job Application created successful' });
    }

    function deleteJobApplicationById() {
      if (!isLoggedIn()) return unauthorized();

      // Extract job ID from the URL
      const jobId = idFromUrl();

      // Find the index of the job with the specified ID
      const jobIndex = jobApplications.findIndex((x) => x.id === jobId);

      // Check if the job application with the specified ID exists
      if (jobIndex === -1) {
        return error('Job Application not found');
      }

      // Remove the user from the job applications array
      const deletedJob = jobApplications.splice(jobIndex, 1)[0];

      return ok(deletedJob);
    }

    function updateJobApplicationById() {
      if (!isLoggedIn()) return unauthorized();
    
      // Extract job ID from the URL
      const jobId = idFromUrl();
    
      // Find the index of the job with the specified ID
      const jobIndex = jobApplications.findIndex((x) => x.id === jobId);
    
      // Check if the job with the specified ID exists
      if (jobIndex === -1) {
        return error('Job Application not found');
      }
    
      // Get the existing job
      const existingJob = users[jobIndex];
    
      // Update the job with the new data from the request body
      const updatedJob = { 
        ...existingJob, 
        ...body, 
        recruiter: parseInt(body.recruiter),
        employee: parseInt(body.employee), 
      };
    
      // Update the job in the job applications array
      jobApplications[jobIndex] = updatedJob;
    
      return ok(updatedJob);
    }

    // helper functions

    function ok(body) {
      return of(new HttpResponse({ status: 200, body }));
    }

    function unauthorized() {
      return throwError({ status: 401, error: { message: 'unauthorized' } });
    }

    function error(message) {
      return throwError({ status: 400, error: { message } });
    }

    function isLoggedIn() {
      const authHeader = headers.get('Authorization') || '';
      return authHeader.startsWith('Bearer fake-jwt-token');
    }

    function isAdmin() {
      return isLoggedIn() && currentUser().role === Role.Admin;
    }

    function isRecruiter() {
      return isLoggedIn() && currentUser().role === Role.Recruiter;
    }

    function isEmployee() {
      return isLoggedIn() && currentUser().role === Role.Employee;
    }

    function currentUser() {
      if (!isLoggedIn()) return;
      const id = parseInt(headers.get('Authorization').split('.')[1]);
      return users.find(x => x.id === id);
    }

    function idFromUrl() {
      const urlParts = url.split('/');
      return parseInt(urlParts[urlParts.length - 1]);
    }
  }
}

export const fakeBackendProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};
