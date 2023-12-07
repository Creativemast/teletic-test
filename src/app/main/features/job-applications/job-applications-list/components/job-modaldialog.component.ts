import { AuthenticationService, JobApplicationsService } from 'app/auth/service';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobApplication, Role, User, } from 'app/auth/models';

import { JobApplicationsListService } from '../job-applications-list.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-job-modaldialog',
  templateUrl: './job-modaldialog.component.html'
})
export class JobModalDialogComponent implements OnInit {
  @Input() mode: number;
  @Input() job: JobApplication;
  @Input() recruiters: User[];
  @Input() employees: User[];
  
  public passwordTextType: boolean;
  public jobForm: FormGroup;
  public submitted = false;
  public loading = false;
  public error = '';
  public currentUser = JSON.parse(localStorage.getItem('currentUser'));

  constructor(
    private _formBuilder: FormBuilder,
    private _authenticationService: AuthenticationService,
    private _jobApplicationsListService: JobApplicationsListService,
    private _jobApplicationsService: JobApplicationsService,
    private _toastrService: ToastrService,
    public _activeModal: NgbActiveModal) { 
      
    }

  // convenience getter for easy access to form fields
  get f() {
    return this.jobForm.controls;
  }

  /**
   * On Submit
   */
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.jobForm.invalid) {
      return;
    }

    // Login
    this.loading = true;
    if (this.mode === 0) {
      this._jobApplicationsService
        .insert(this.jobForm.value)
        .pipe(first())
        .subscribe(
          data => {
            this.loading = false;
            this._jobApplicationsListService.getDataTableRows();
            this._toastrService.success(
              'You have successfully inserted a job application',
              'Insert Job Application',
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
      this._jobApplicationsService
        .update(this.job.id, this.jobForm.value)
        .pipe(first())
        .subscribe(
          data => {
            this.loading = false;
            this._jobApplicationsListService.getDataTableRows();
            this._toastrService.success(
              'You have successfully updated this job application',
              'Update Job Application',
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
    let defaultRecruiter = '';
    let defaultEmployee = '';
    if (this.job) {
      defaultEmployee = this.job.employee.toString();
      defaultRecruiter = this.job.recruiter.toString();
    }
    if (this.currentUser.role === Role.Employee) {
      defaultEmployee = this.currentUser.id;
    }
    if (this.currentUser.role === Role.Recruiter) {
      defaultRecruiter = this.currentUser.id;
    }
    this.jobForm = this._formBuilder.group({
      recruiter: [defaultRecruiter, [Validators.required]],
      employee: [defaultEmployee, [Validators.required]],
      coverLetter: [this.job ? this.job.coverLetter : '', [Validators.required]],
      status: [this.job ? this.job.status : 'Pending', [Validators.required]],
    });
  }
}
