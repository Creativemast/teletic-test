import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService, JobApplicationsService, UserService } from 'app/auth/service';
import { BehaviorSubject, Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Role } from 'app/auth/models';

@Injectable()
export class JobApplicationsListService implements Resolve<any> {
  public rows: any;
  public recruiters: any;
  public employees: any;
  public onJobApplicationsListChanged: BehaviorSubject<any>;
  public onRecruitersListChanged: BehaviorSubject<any>;
  public onEmployeesListChanged: BehaviorSubject<any>;
  public currentUser = JSON.parse(localStorage.getItem('currentUser'));

  constructor(
    private _jobApplicationsService: JobApplicationsService,
    private _userService: UserService,
    private _authenticationService: AuthenticationService) {
    // Set the defaults
    this.onJobApplicationsListChanged = new BehaviorSubject({});
    this.onEmployeesListChanged = new BehaviorSubject({});
    this.onRecruitersListChanged = new BehaviorSubject({});
  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      Promise.all([
        this.getDataTableRows(),
        this.getDataEmployees(),
        this.getDataRecruiters()
      ]).then(() => {
        resolve();
      }, reject);
    });
  }

  /**
   * Get rows
   */
  getDataTableRows(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser.role === Role.Admin) {
        this._jobApplicationsService.getAll().subscribe((response: any) => {
          this.rows = response;
          this.onJobApplicationsListChanged.next(this.rows);
          resolve(this.rows);
        }, reject);
      } else if (currentUser.role === Role.Recruiter) {
        this._jobApplicationsService.getAllByRecruiter(currentUser.id).subscribe((response: any) => {
          this.rows = response;
          this.onJobApplicationsListChanged.next(this.rows);
          resolve(this.rows);
        }, reject);
      } else {
        this._jobApplicationsService.getAllByEmployee(currentUser.id).subscribe((response: any) => {
          this.rows = response;
          this.onJobApplicationsListChanged.next(this.rows);
          resolve(this.rows);
        }, reject);
      }
    });
  }

  /**
   * Get recruiters
   */
  getDataRecruiters(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this._userService.getAllRecruiters().subscribe((response: any) => {
        this.recruiters = response;
        this.onRecruitersListChanged.next(this.recruiters);
        resolve(this.recruiters);
      }, reject);
    });
  }

  /**
   * Get employees
   */
  getDataEmployees(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this._userService.getAllEmployees().subscribe((response: any) => {
        this.employees = response;
        this.onEmployeesListChanged.next(this.employees);
        resolve(this.employees);
      }, reject);
    });
  }
}
