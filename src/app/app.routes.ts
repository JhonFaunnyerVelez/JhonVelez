import { ProductFormPage } from './../features/products/pages/product-form-page/product-form-page';
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
  {
    path: 'products/new',
    loadComponent: () =>
      import('../features/products/pages/product-form-page/product-form-page')
        .then(m => m.ProductFormPage),
  },
  {
    path: 'products/:id/edit',
    loadComponent: () =>
      import('../features/products/pages/product-form-page/product-form-page')
        .then(m => m.ProductFormPage),
  },
  { path: '**', redirectTo: 'products' },
];
