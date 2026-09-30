import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding: los parámetros de la URL (:id) llegan como inputs del componente
    provideRouter(routes, withComponentInputBinding()),
    // Reemplaza al viejo HttpClientModule
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
