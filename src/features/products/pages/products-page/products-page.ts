import { Component, signal } from '@angular/core';
import { Product } from '../../../../app/core/models/product.model';
import { ProductsApiService } from '../../../../app/core/services/products-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { delay, finalize } from 'rxjs';
import { PRODUCTS_MOCK } from './mock/products.mock';

@Component({
  selector: 'app-products-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css',
})
export class ProductsPage {

  products: Product[] = [];

  // Signals, se usan para manejar el estado del componente y asi poder reflejar cambios en la UI de manera reactiva.
  loading = signal(false);
  error = signal<string | null>(null);

  // Filtros y paginación , se usa query para el filtro de búsqueda, page para la página actual y pageSize para el número de elementos por página.
  query = '';
  page = 1;
  pageSize = 5;

  // Filas de esqueleto para mostrar mientras se cargan los datos
  readonly skeletonRows = [0, 1, 2, 3, 4];

  constructor(private api: ProductsApiService) { }

  ngOnInit(): void {
    this.load();
  }

  /**
   * Carga los productos desde el servicio API.
   * Maneja el estado de carga y errores utilizando señales.
   */
  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.getProducts()
      .pipe(
        delay(1000), // Se agrega delay para simular tiempo de carga
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (data) => {
          this.products = PRODUCTS_MOCK;
          this.page = 1;
        },
        error: () => {
          this.error.set('No fue posible cargar los productos.');
        },
      });
  }

  /**
   * Se ejecuta cuando cambia el valor de búsqueda.
   * @param value
   */

  onQueryChange(value: string): void {
    this.query = value ?? '';
    this.page = 1;
  }

  /**
   * se ejecuta cuando cambia el tamaño de página.
   * @param value
   */
  onPageSizeChange(value: number): void {
    this.pageSize = Number(value);
    this.page = 1;
  }

  /**
   * Obtiene los productos filtrados según la consulta de búsqueda.
   */
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
