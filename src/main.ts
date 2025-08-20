import 'zone.js';  // Add this line at the very top
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { App } from './app/app';

bootstrapApplication(App, {
  providers: [
    provideAnimations()
  ]
}).catch(err => console.error(err));