import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { CoreMenuItem } from '@core/types';
import { CoreMenuService } from '../../core-menu.service';
import { Subject } from 'rxjs';
import { User } from 'app/auth/models';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: '[core-menu-vertical-item]',
  templateUrl: './item.component.html'
})
export class CoreMenuVerticalItemComponent implements OnInit, OnDestroy {
  currentUser: User;

  @Input()
  item: CoreMenuItem;

  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {CoreMenuService} _coreMenuService
   */
  constructor(
    private _coreMenuService: CoreMenuService,
  ) {
    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  // Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Subscribe to the current menu changes
    this._coreMenuService.onMenuChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
      this.currentUser = this._coreMenuService.currentUser;
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
