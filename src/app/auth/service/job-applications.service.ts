import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JobApplication } from 'app/auth/models';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class JobApplicationsService {
  /**
   *
   * @param {HttpClient} _http
   */
  constructor(private _http: HttpClient) { }

  /**
   * Get all job applications
   */
  getAll() {
    return this._http.get<JobApplication[]>(`${environment.apiUrl}/job-applications`);
  }

  /**
   * Get all job applications by recruiter
   */
  getAllByRecruiter(id: number) {
    return this._http.get<JobApplication[]>(`${environment.apiUrl}/job-applications/recruiter/${id}`);
  }

  /**
   * Get all job applications by employee
   */
  getAllByEmployee(id: number) {
    return this._http.get<JobApplication[]>(`${environment.apiUrl}/job-applications/employee/${id}`);
  }

  /**
   * Get job application by id
   */
  getById(id: number) {
    return this._http.get<JobApplication>(`${environment.apiUrl}/job-applications/${id}`);
  }

  /**
 * Insert job applications
 */
  insert(jobApplication: JobApplication) {
    return this._http.post<any>(`${environment.apiUrl}/job-applications`, jobApplication)
  }

  /**
   * Delete job application
   */
  delete(id: number) {
    return this._http.delete<JobApplication>(`${environment.apiUrl}/job-applications/${id}`);
  }

  /**
   * Update job application
   */
  update(id: number, jobApplication: JobApplication) {
    return this._http.put<JobApplication>(`${environment.apiUrl}/job-applications/${id}`, jobApplication);
  }
}
