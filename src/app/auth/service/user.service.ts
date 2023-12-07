import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from 'app/auth/models';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  /**
   *
   * @param {HttpClient} _http
   */
  constructor(private _http: HttpClient) {}

  /**
   * Get all users
   */
  getAll() {
    return this._http.get<User[]>(`${environment.apiUrl}/users`);
  }

  /**
   * Get all recruiter
   */
  getAllRecruiters() {
    return this._http.get<User[]>(`${environment.apiUrl}/recruiters`);
  }

  /**
   * Get all employees
   */
  getAllEmployees() {
    return this._http.get<User[]>(`${environment.apiUrl}/employees`);
  }

  /**
   * Get user by id
   */
  getById(id: number) {
    return this._http.get<User>(`${environment.apiUrl}/users/${id}`);
  }

  /**
   * Delete user
   */
  delete(id: number) {
    return this._http.delete<User>(`${environment.apiUrl}/users/${id}`);
  }

  /**
   * Update user
   */
  update(id: number, user: User) {
    return this._http.put<User>(`${environment.apiUrl}/users/${id}`, user);
  }
}
