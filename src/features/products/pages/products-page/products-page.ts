import { Component } from '@angular/core';
import { Product } from '../../../../app/core/models/product.model';
import { ProductsApiService } from '../../../../app/core/services/products-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-products-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css',
})
export class ProductsPage {

  products: Product[] = [];

  loading = false;
  error: string | null = null;

  query = '';
  page = 1;
  pageSize = 5;

  readonly skeletonRows = [0, 1, 2, 3, 4];

  constructor(private api: ProductsApiService) { }

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.error = null;

    this.api.getProducts()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.products = data ?? [];
          this.page = 1;
        },
        error: () => {
          this.error = 'No fue posible cargar los productos.';
        },
      });
  }

  onQueryChange(value: string): void {
    this.query = value ?? '';
    this.page = 1;
  }

  onPageSizeChange(value: number): void {
    this.pageSize = Number(value);
    this.page = 1;
  }

  get filteredProducts(): Product[] {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.products;

    return this.products.filter((p) =>
      [p.id, p.name, p.description].some((v) =>
        (v ?? '').toLowerCase().includes(q)
      )
    );
  }

  get total(): number {
    return this.filteredProducts.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  get pagedProducts(): Product[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  prevPage(): void {
    this.page = Math.max(1, this.page - 1);
  }

  nextPage(): void {
    this.page = Math.min(this.totalPages, this.page + 1);
  }
}
