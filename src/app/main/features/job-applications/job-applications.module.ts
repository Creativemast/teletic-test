import { RouterModule, Routes } from '@angular/router';

import { CommonModule } from '@angular/common';
import { CoreCommonModule } from '@core/common.module';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { CoreSidebarModule } from '@core/components';
import { FormsModule } from '@angular/forms';
import { JobApplicationsListComponent } from './job-applications-list/job-applications-list.component';
import { JobApplicationsListService } from './job-applications-list/job-applications-list.service';
import { JobModalDialogComponent } from './job-applications-list/components/job-modaldialog.component';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { NgModule } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

// routing
const routes: Routes = [
  {
    path: 'list',
    component: JobApplicationsListComponent,
    resolve: {
      uls: JobApplicationsListService
    },
    data: { animation: 'JobApplicationsListComponent' }
  }
];

@NgModule({
  declarations: [JobApplicationsListComponent, JobModalDialogComponent],
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
  providers: [JobApplicationsListService]
})
export class JobApplicationsModule {}
