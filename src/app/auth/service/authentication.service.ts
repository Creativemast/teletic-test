import { BehaviorSubject, Observable } from 'rxjs';
import { Role, User } from 'app/auth/models';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'environments/environment';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  //public
  public currentUser: Observable<User>;

  //private
  public currentUserSubject: BehaviorSubject<User>;

  /**
   *
   * @param {HttpClient} _http
   * @param {ToastrService} _toastrService
   */
  constructor(private _http: HttpClient, private _toastrService: ToastrService) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // getter: currentUserValue
  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  /**
   *  Confirms if user is admin
   */
  get isAdmin() {
    return this.currentUser && this.currentUserSubject.value.role === Role.Admin;
  }

  /**
   *  Confirms if user is recruiter
   */
  get isRecruiter() {
    return this.currentUser && this.currentUserSubject.value.role === Role.Recruiter;
  }

  /**
   *  Confirms if user is employee
   */
  get isEmployee() {
    return this.currentUser && this.currentUserSubject.value.role === Role.Employee;
  }

  /**
   * User login
   *
   * @param username
   * @param password
   * @returns user
   */
  login(username: string, password: string) {
    return this._http
      .post<any>(`${environment.apiUrl}/users/authenticate`, { username, password })
      .pipe(
        map(user => {
          // login successful if there's a jwt token in the response
          if (user && user.token) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('currentUser', JSON.stringify(user));
            // notify
            this.currentUserSubject.next(user);

            // Display welcome toast!
            setTimeout(() => {
              this._toastrService.success(
                'You have successfully logged in as an ' +
                user.role.toUpperCase() +
                ' user to Teletic Test. Now you can start to explore. Enjoy! 🎉',
                '👋 Welcome, ' + user.lastName + '!',
                { toastClass: 'toast ngx-toastr', closeButton: true }
              );
            }, 1000);
          }

          return user;
        })
      );
  }

  /**
   * User register
   *
   * @param user
   * @returns response
   */
  register(user: User) {
    return this._http.post<any>(`${environment.apiUrl}/users/register`, user)
  }

  /**
   * User logout
   *
   */
  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    // notify
    this.currentUserSubject.next(null);
  }
}
