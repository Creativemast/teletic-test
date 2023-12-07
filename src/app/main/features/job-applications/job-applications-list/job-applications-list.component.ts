import { AuthenticationService, JobApplicationsService } from 'app/auth/service';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { first, takeUntil } from 'rxjs/operators';

import { ActivatedRoute } from '@angular/router';
import { ConfirmationModalComponent } from 'app/layout/components/modaldialogs/confirmation-modal.component';
import { CoreConfigService } from '@core/services/config.service';
import { JobApplication } from 'app/auth/models';
import { JobApplicationsListService } from './job-applications-list.service';
import { JobModalDialogComponent } from './components/job-modaldialog.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-job-applications-list',
  templateUrl: './job-applications-list.component.html',
  styleUrls: ['./job-applications-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class JobApplicationsListComponent implements OnInit {
  // Public
  public sidebarToggleRef = false;
  public currentUser = JSON.parse(localStorage.getItem('currentUser'));
  public rows;
  public recruiters;
  public employees;
  public selectedOption = 10;
  public ColumnMode = ColumnMode;
  public temp = [];
  public previousRecruiterFilter = '';
  public previousEmployeeFilter = '';
  public previousStatusFilter = '';

  public selectRecuiter;
  public selectedRecuiter;

  public selectEmployee;
  public selectedEmployee;

  public selectStatus = [
    { name: 'All Status', value: '' },
    { name: 'Pending', value: 'Pending' },
    { name: 'Active', value: 'Active' },
    { name: 'Treated', value: 'Treated' }
  ];
  public selectedStatus = this.selectStatus[0];

  public searchValue = '';

  // Decorator
  @ViewChild(DatatableComponent) table: DatatableComponent;

  // Private
  private tempData = [];
  private tempDataRecruiters = [];
  private tempDataEmployees = [];
  private _unsubscribeAll: Subject<any>;

  constructor(
    private _jobApplicationsListService: JobApplicationsListService,
    private _jobApplicationService: JobApplicationsService,
    private _coreConfigService: CoreConfigService,
    private _modalService: NgbModal,
    private _toastrService: ToastrService,
    private _authenticationService: AuthenticationService,
    private _activatedRoute: ActivatedRoute
  ) {
    this._unsubscribeAll = new Subject();
  }

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * filterUpdate
   *
   * @param event
   */
  filterUpdate(event) {
    // Reset ng-select on search
    this.selectedRecuiter = this.selectRecuiter[0];
    this.selectedEmployee = this.selectEmployee[0];

    const val = event.target.value.toLowerCase();

    // Filter Our Data
    const temp = this.tempData.filter(function (d) {
      return d.coverLetter.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // Update The Rows
    this.rows = temp;
    // Whenever The Filter Changes, Always Go Back To The First Page
    this.table.offset = 0;
  }

  /**
   * Toggle the modal dialog
   *
   * @param name
   */
  toggleAddJobApplication(): void {
    const modalRef = this._modalService.open(JobModalDialogComponent);
    modalRef.componentInstance.mode = 0;
    modalRef.componentInstance.recruiters = this.recruiters;
    modalRef.componentInstance.employees = this.employees;
  }

  toggleEditJobApplication(jobApplication: JobApplication): void {
    const modalRef = this._modalService.open(JobModalDialogComponent);
    modalRef.componentInstance.mode = 1;
    modalRef.componentInstance.job = jobApplication;
    modalRef.componentInstance.recruiters = this.recruiters;
    modalRef.componentInstance.employees = this.employees;
  }

  /**
   * Filter By Recuiter
   *
   * @param event
   */
  filterByRecuiter(event) {
    const filter = event ? event.value : '';
    this.previousRecruiterFilter = filter;
    this.temp = this.filterRows(filter, this.previousEmployeeFilter, this.previousStatusFilter);
    this.rows = this.temp;
  }

  /**
   * Filter By Employee
   *
   * @param event
   */
  filterByEmployee(event) {
    const filter = event ? event.value : '';
    this.previousEmployeeFilter = filter;
    this.temp = this.filterRows(this.previousRecruiterFilter, filter, this.previousStatusFilter);
    this.rows = this.temp;
  }

  /**
   * Filter By Employee
   *
   * @param event
   */
  filterByStatus(event) {
    const filter = event ? event.value : '';
    this.previousStatusFilter = filter;
    this.temp = this.filterRows(this.previousRecruiterFilter, this.previousEmployeeFilter, filter);
    this.rows = this.temp;
  }

  /**
   * Get Recuiter Full Name
   * 
   * @param id
   */
  getRecuiterFullName(id) {
    const selected = this.recruiters.find(recuiter => recuiter.id === id);
    return `${selected.firstName} ${selected.lastName}`;
  }

  /**
  * Get Recuiter Username
  * 
  * @param id
  */
  getRecuiterUsername(id) {
    const selected = this.recruiters.find(recuiter => recuiter.id === id);
    return selected.username;
  }

  /**
* Get Recuiter Avatar
* 
* @param id
*/
  getRecuiterAvatar(id) {
    const selected = this.recruiters.find(recuiter => recuiter.id === id);
    return selected.avatar;
  }

  /**
  * Get Recuiter Full Name
  * 
  * @param id
  */
  getEmployeeFullName(id) {
    const selected = this.employees.find(employee => employee.id === id);
    return `${selected.firstName} ${selected.lastName}`;
  }

  /**
  * Get Recuiter Username
  * 
  * @param id
  */
  getEmployeeUsername(id) {
    const selected = this.employees.find(employee => employee.id === id);
    return selected.username;
  }

  /**
  * Get Recuiter Username
  * 
  * @param id
  */
  getEmployeeAvatar(id) {
    const selected = this.employees.find(employee => employee.id === id);
    return selected.avatar;
  }

  /**
   * Filter Rows
   *
   * @param recruiterFilter
   * @param employeeFilter
   */
  filterRows(recruiterFilter, employeeFilter, statusFilter): any[] {
    // Reset search on select change
    this.searchValue = '';

    return this.tempData.filter(row => {
      const isRecuiterMatch = row.recruiter === recruiterFilter || !recruiterFilter;
      const isEmployeeMatch = row.employee === employeeFilter || !employeeFilter;
      const isStatusMatch = row.status === statusFilter || !statusFilter;
      return isRecuiterMatch && isEmployeeMatch && isStatusMatch;
    });
  }

  /**
  * Open confirmation modal dialog
  */
  openConfirmationModal(job: JobApplication) {
    const modalRef = this._modalService.open(ConfirmationModalComponent);
    modalRef.componentInstance.message = `Are you sure you want to delete this job application ?`;

    modalRef.result.then((result) => {
      if (result) {
        this.deleteJobApplication(job);
      }
    });
  }

  /**
  * Delete Job Application
  */
  deleteJobApplication(job: JobApplication) {
    this._jobApplicationService.delete(job.id).pipe(first())
      .subscribe(
        data => {
          this._jobApplicationsListService.getDataTableRows();
          this._toastrService.success(
            `You have successfully deleted a job application`,
            'Delete Job Application',
            { toastClass: 'toast ngx-toastr', closeButton: true }
          );
        },
        error => {
          this._toastrService.error(
            error,
            'Error occurred',
            { toastClass: 'toast ngx-toastr', closeButton: true }
          );
        }
      );
  }

  private loadData(): void {
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      //! If we have zoomIn route Transition then load datatable after 450ms(Transition will finish in 400ms)
      if (config.layout.animation === 'zoomIn') {
        setTimeout(() => {
          this._jobApplicationsListService.onJobApplicationsListChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
            this.rows = response;
            this.tempData = this.rows;
          });
          this._jobApplicationsListService.onRecruitersListChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
            this.recruiters = response;
            this.tempDataRecruiters = this.recruiters;
            this.selectRecuiter = this.recruiters.map(recuiter => { return { name: `${recuiter.firstName} ${recuiter.lastName}`, value: recuiter.id } });
            this.selectRecuiter.unshift({ name: 'All Recruiters', value: '' });
            this.selectedRecuiter = this.selectRecuiter[0];
          });
          this._jobApplicationsListService.onEmployeesListChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
            this.employees = response;
            this.tempDataEmployees = this.employees;
            this.selectEmployee = this.employees.map(employee => { return { name: `${employee.firstName} ${employee.lastName}`, value: employee.id } });
            this.selectEmployee.unshift({ name: 'All Employees', value: '' });
            this.selectedEmployee = this.selectEmployee[0];
          });
        }, 450);
      } else {
        this._jobApplicationsListService.onJobApplicationsListChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
          this.rows = response;
          this.tempData = this.rows;
        });
        this._jobApplicationsListService.onRecruitersListChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
          this.recruiters = response;
          this.tempDataRecruiters = this.recruiters;
          this.selectRecuiter = this.recruiters.map(recuiter => { return { name: `${recuiter.firstName} ${recuiter.lastName}`, value: recuiter.id } });
          this.selectRecuiter.unshift({ name: 'All Recruiters', value: '' });
          this.selectedRecuiter = this.selectRecuiter[0];
        });
        this._jobApplicationsListService.onEmployeesListChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
          this.employees = response;
          this.tempDataEmployees = this.employees;
          this.selectEmployee = this.employees.map(employee => { return { name: `${employee.firstName} ${employee.lastName}`, value: employee.id } });
          this.selectEmployee.unshift({ name: 'All Employees', value: '' });
          this.selectedEmployee = this.selectEmployee[0];
        });
      }
    });
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------
  /**
   * On init
   */
  ngOnInit(): void {
    // Subscribe config change
    this._activatedRoute.params.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
      // Load data when the route changes
      this.loadData();
    });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
