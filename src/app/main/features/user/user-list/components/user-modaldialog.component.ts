import { AuthenticationService, UserService } from 'app/auth/service';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { User } from 'app/auth/models';
import { UserListService } from '../user-list.service';
import { first } from 'rxjs/operators';
import { phoneNumberValidator } from 'app/auth/helpers';

@Component({
  selector: 'app-user-modaldialog',
  templateUrl: './user-modaldialog.component.html'
})
export class UserModalDialogComponent implements OnInit {
  @Input() mode: number;
  @Input() user: User;
  
  public passwordTextType: boolean;
  public userForm: FormGroup;
  public submitted = false;
  public loading = false;
  public error = '';

  constructor(
    private _formBuilder: FormBuilder,
    private _authenticationService: AuthenticationService,
    private _userListService: UserListService,
    private _userService: UserService,
    private _toastrService: ToastrService,
    public _activeModal: NgbActiveModal) { }

  // convenience getter for easy access to form fields
  get f() {
    return this.userForm.controls;
  }

  /**
   * Toggle password
   */
  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  /**
   * On Submit
   */
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.userForm.invalid) {
      return;
    }

    // Login
    this.loading = true;
    if (this.mode === 0) {
      this._authenticationService
        .register(this.userForm.value)
        .pipe(first())
        .subscribe(
          data => {
            this.loading = false;
            this._userListService.getDataTableRows();
            this._toastrService.success(
              'You have successfully added a new user',
              'New User',
              { toastClass: 'toast ngx-toastr', closeButton: true }
            );
            this._activeModal.close()
          },
          error => {
            this.error = error;
            this.loading = false;
          }
        );
    } else if (this.mode === 1) {
      this._userService
        .update(this.user.id, this.userForm.value)
        .pipe(first())
        .subscribe(
          data => {
            this.loading = false;
            this._userListService.getDataTableRows();
            this._toastrService.success(
              'You have successfully updated this user',
              'Update User',
              { toastClass: 'toast ngx-toastr', closeButton: true }
            );
            this._activeModal.close()
          },
          error => {
            this.error = error;
            this.loading = false;
          }
        );
    }
  }

  ngOnInit(): void {
    this.userForm = this._formBuilder.group({
      username: [this.user ? this.user.username : '', [Validators.required]],
      firstName: [this.user ? this.user.firstName : '', [Validators.required]],
      lastName: [this.user ? this.user.lastName : '', [Validators.required]],
      phoneNumber: [this.user ? this.user.phoneNumber : '', [Validators.required, phoneNumberValidator]],
      role: [this.user ? this.user.role : 'Employee', [Validators.required]],
      password: [this.user ? this.user.password : '', Validators.required]
    });
  }
}
