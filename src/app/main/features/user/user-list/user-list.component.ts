import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { first, takeUntil } from 'rxjs/operators';

import { ConfirmationModalComponent } from 'app/layout/components/modaldialogs/confirmation-modal.component';
import { CoreConfigService } from '@core/services/config.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { User } from 'app/auth/models';
import { UserListService } from 'app/main/features/user/user-list/user-list.service';
import { UserModalDialogComponent } from './components/user-modaldialog.component';
import { UserService } from 'app/auth/service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserListComponent implements OnInit {
  // Public
  public sidebarToggleRef = false;
  public rows;
  public selectedOption = 10;
  public ColumnMode = ColumnMode;
  public temp = [];
  public previousRoleFilter = '';

  public selectRole: any = [
    { name: 'All', value: '' },
    { name: 'Recruiter', value: 'Recruiter' },
    { name: 'Employee', value: 'Employee' }
  ];

  public selectedRole = this.selectRole[0];
  public searchValue = '';

  // Decorator
  @ViewChild(DatatableComponent) table: DatatableComponent;

  // Private
  private tempData = [];
  private _unsubscribeAll: Subject<any>;

  constructor(
    private _userListService: UserListService,
    private _userService: UserService,
    private _coreConfigService: CoreConfigService,
    private _modalService: NgbModal,
    private _toastrService: ToastrService
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
    this.selectedRole = this.selectRole[0];

    const val = event.target.value.toLowerCase();

    // Filter Our Data
    const temp = this.tempData.filter(function (d) {
      return d.firstName.toLowerCase().indexOf(val) !== -1 ||
        d.lastName.toLowerCase().indexOf(val) !== -1 ||
        d.role.toLowerCase().indexOf(val) !== -1 ||
        d.phoneNumber.toLowerCase().indexOf(val) !== -1 || !val;
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
  toggleAddUser(): void {
    const modalRef = this._modalService.open(UserModalDialogComponent);
    modalRef.componentInstance.mode = 0;
  }

  toggleEditUser(user: User): void {
    const modalRef = this._modalService.open(UserModalDialogComponent);
    modalRef.componentInstance.mode = 1;
    modalRef.componentInstance.user = user;
  }

  /**
   * Filter By Roles
   *
   * @param event
   */
  filterByRole(event) {
    const filter = event ? event.value : '';
    this.previousRoleFilter = filter;
    this.temp = this.filterRows(filter);
    this.rows = this.temp;
  }

  /**
   * Filter Rows
   *
   * @param roleFilter
   */
  filterRows(roleFilter): any[] {
    // Reset search on select change
    this.searchValue = '';

    roleFilter = roleFilter.toLowerCase();

    return this.tempData.filter(row => {
      const isPartialNameMatch = row.role.toLowerCase().indexOf(roleFilter) !== -1 || !roleFilter;
      return isPartialNameMatch;
    });
  }

  /**
  * Open confirmation modal dialog
  */
  openConfirmationModal(user: User) {
    const modalRef = this._modalService.open(ConfirmationModalComponent);
    modalRef.componentInstance.message = `Are you sure you want to delete this user: ${user.firstName} ${user.lastName} ?`;

    modalRef.result.then((result) => {
      if (result) {
        this.deleteUser(user);
      }
    });
  }

  /**
  * Delete User
  */
  deleteUser(user: User) {
    this._userService.delete(user.id).pipe(first())
      .subscribe(
        data => {
          this._userListService.getDataTableRows();
          this._toastrService.success(
            `You have successfully deleted ${user.firstName} ${user.lastName}`,
            'Delete User',
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

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------
  /**
   * On init
   */
  ngOnInit(): void {
    // Subscribe config change
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      //! If we have zoomIn route Transition then load datatable after 450ms(Transition will finish in 400ms)
      if (config.layout.animation === 'zoomIn') {
        setTimeout(() => {
          this._userListService.onUserListChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
            this.rows = response;
            this.tempData = this.rows;
          });
        }, 450);
      } else {
        this._userListService.onUserListChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
          this.rows = response;
          this.tempData = this.rows;
        });
      }
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
