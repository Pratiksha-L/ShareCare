import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LoginComponent } from './login/login.component';
import {CardModule} from 'primeng/card';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextModule} from 'primeng/inputtext';
import {PasswordModule} from 'primeng/password';
import { ButtonModule  } from 'primeng/button';
import {MessageService} from 'primeng/api';
import {ToastModule } from 'primeng/toast';
import {AuthguardService} from './authguard.service';
import {TabViewModule} from 'primeng/tabview';

@NgModule({
  imports: [
    TabViewModule,
    ReactiveFormsModule,
    FormsModule ,
    DropdownModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    ToastModule,
    ComponentsModule,
    RouterModule,
    AppRoutingModule,
    NgbModule,
    ToastrModule.forRoot()
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    LoginComponent

  ],
  providers: [AuthguardService ,MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
