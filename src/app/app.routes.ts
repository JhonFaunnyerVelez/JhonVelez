import { ProductsPage } from './../features/products/pages/products-page/products-page';
import { Routes } from '@angular/router';


export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'products' },
  {
    path: 'products',
    loadComponent: () =>
      import('../features/products/pages/products-page/products-page')
        .then(m => m.ProductsPage),
  },
  { path: '**', redirectTo: 'products' },
];
