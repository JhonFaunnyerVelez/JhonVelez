import { Component, inject, signal } from '@angular/core';
import { Product } from '../../../../app/core/models/product.model';
import { ProductsApiService } from '../../../../app/core/services/products-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { delay, finalize } from 'rxjs';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-products-page',
  imports: [CommonModule, FormsModule, RouterLink],
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

  // Inyección del servicio ProductsApiService para interactuar con la API de productos.
  public api = inject(ProductsApiService);

  // ✅ Router para navegación a editar
  public router = inject(Router);

  // Estado del menú y modal de eliminación
  menuOpenId: string | null = null;
  deleteModalOpen = false;
  productToDelete: Product | null = null;

  constructor() { }

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
          this.products = data;
          this.page = 1;
        },
        error: () => {
          this.error.set('No fue posible cargar los productos.');
        },
      });
  }

  /**
   * Se ejecuta cuando cambia el valor de búsqueda.
   */
  onQueryChange(value: string): void {
    this.query = value ?? '';
    this.page = 1;
  }

  /**
   * Se ejecuta cuando cambia el tamaño de página.
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

  /**
   * Obtiene el total de productos después de aplicar los filtros.
   */
  get total(): number {
    return this.filteredProducts.length;
  }

  /**
   * Obtiene el total de páginas según el total de productos y el tamaño de página.
   */
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  /**
   * Obtiene los productos para la página actual después de aplicar los filtros y la paginación.
   */
  get pagedProducts(): Product[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  /**
   * Navega a la página anterior.
   */
  prevPage(): void {
    this.page = Math.max(1, this.page - 1);
  }

  /**
   * Navega a la página siguiente.
   */
  nextPage(): void {
    this.page = Math.min(this.totalPages, this.page + 1);
  }

  toggleMenu(id: string): void {
    this.menuOpenId = this.menuOpenId === id ? null : id;
  }

  closeMenu(): void {
    this.menuOpenId = null;
  }

  // ✅ Editar producto
  // No se vuelve a llamar el servicio, se pasa el objeto completo al formulario
  editProduct(p: Product): void {
    this.closeMenu();
    this.router.navigate(
      ['/products', p.id, 'edit'],
      { state: { product: p } }
    );
  }

  openDeleteModal(p: Product): void {
    this.productToDelete = p;
    this.deleteModalOpen = true;
    this.closeMenu();
  }

  closeDeleteModal(): void {
    this.deleteModalOpen = false;
    this.productToDelete = null;
  }

  confirmDelete(): void {
    const p = this.productToDelete;
    if (!p) return;

    this.api.deleteProduct(p.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.load(); // recarga lista
      },
      error: () => {
        this.closeDeleteModal();
        this.error.set('No fue posible eliminar el producto.');
      }
    });
  }
}
