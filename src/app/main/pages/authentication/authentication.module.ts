import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AuthLoginComponent } from 'app/main/pages/authentication/auth-login/auth-login.component';
import { AuthRegisterComponent } from './auth-register/auth-register.component';
import { CommonModule } from '@angular/common';
import { CoreCommonModule } from '@core/common.module';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// routing
const routes: Routes = [
  {
    path: 'login',
    component: AuthLoginComponent,
  },
  {
    path: 'register',
    component: AuthRegisterComponent,
  }
];

@NgModule({
  declarations: [AuthLoginComponent, AuthRegisterComponent],
  imports: [CommonModule, RouterModule.forChild(routes), NgbModule, FormsModule, ReactiveFormsModule, CoreCommonModule]
})
export class AuthenticationModule {}
