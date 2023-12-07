import { CustomBreakPointsProvider } from 'app/layout/custom-breakpoints';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HorizontalLayoutModule } from 'app/layout/horizontal/horizontal-layout.module';
import { NgModule } from '@angular/core';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { VerticalLayoutModule } from 'app/layout/vertical/vertical-layout.module';

@NgModule({
  imports: [FlexLayoutModule.withConfig({ disableDefaultBps: true }), VerticalLayoutModule, HorizontalLayoutModule, NgbModalModule],
  providers: [CustomBreakPointsProvider],
  exports: [VerticalLayoutModule, HorizontalLayoutModule]
})
export class LayoutModule {}
