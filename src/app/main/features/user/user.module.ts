import { RouterModule, Routes } from '@angular/router';

import { CommonModule } from '@angular/common';
import { CoreCommonModule } from '@core/common.module';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { CoreSidebarModule } from '@core/components';
import { FormsModule } from '@angular/forms';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { NgModule } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { UserListComponent } from 'app/main/features/user/user-list/user-list.component';
import { UserListService } from 'app/main/features/user/user-list/user-list.service';
import { UserModalDialogComponent } from 'app/main/features/user/user-list/components/user-modaldialog.component';

// routing
const routes: Routes = [
  {
    path: 'user-list',
    component: UserListComponent,
    resolve: {
      uls: UserListService
    },
    data: { animation: 'UserListComponent' }
  }
];

@NgModule({
  declarations: [UserListComponent, UserModalDialogComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CoreCommonModule,
    FormsModule,
    NgbModule,
    NgSelectModule,
    Ng2FlatpickrModule,
    NgxDatatableModule,
    CorePipesModule,
    CoreDirectivesModule,
    CoreSidebarModule
  ],
  providers: [UserListService]
})
export class UserModule {}
