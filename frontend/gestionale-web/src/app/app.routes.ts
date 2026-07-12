import { Routes } from '@angular/router';

import { Clienti } from './clienti/clienti';

export const routes: Routes = [
  { path: '', component: Clienti },
  { path: '**', redirectTo: '' },
];
