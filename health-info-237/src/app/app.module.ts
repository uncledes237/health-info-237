import { NgModule, ErrorHandler } from '@angular/core';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { GlobalErrorHandler } from './core/handlers/global-error.handler';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([]),
    HttpClientModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ],
})
export class AppModule { } 