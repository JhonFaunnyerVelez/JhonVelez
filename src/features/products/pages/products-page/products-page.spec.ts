import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductsPage } from './products-page';
import { ProductsApiService } from '../../../../app/core/services/products-api.service';
import { PRODUCTS_MOCK } from './mock/products.mock';

describe('ProductsPage', () => {
  let component: ProductsPage;
  let fixture: ComponentFixture<ProductsPage>;
  let apiMock: any;
  let router: Router;

  beforeEach(async () => {
    apiMock = {
      getProducts: jest.fn(() => of(PRODUCTS_MOCK)),
      deleteProduct: jest.fn(() => of(void 0)),
    };

    await TestBed.configureTestingModule({
      imports: [ProductsPage],
      providers: [
        provideRouter([]),
        { provide: ProductsApiService, useValue: apiMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getProducts on init', () => {
    fixture.detectChanges();
    expect(apiMock.getProducts).toHaveBeenCalledTimes(1);
  });

  it('should load products successfully', (done) => {
    fixture.detectChanges();
    setTimeout(() => {
      expect(component.products).toEqual(PRODUCTS_MOCK);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
      done();
    }, 1100);
  });

  it('should set error when getProducts fails', (done) => {
    apiMock.getProducts.mockReturnValue(throwError(() => new Error('Error')));
    fixture.detectChanges();
    setTimeout(() => {
      expect(component.error()).toBe('No fue posible cargar los productos.');
      expect(component.loading()).toBe(false);
      done();
    }, 1100);
  });

  it('should filter products by query', () => {
    component.products = PRODUCTS_MOCK;
    component.query = 'Tarjeta';
    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].name).toBe('Tarjeta Crédito');
  });

  it('should filter products by id', () => {
    component.products = PRODUCTS_MOCK;
    component.query = 'uno';
    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].id).toBe('uno');
  });

  it('should filter products by description', () => {
    component.products = PRODUCTS_MOCK;
    component.query = 'compras';
    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].description).toContain('compras');
  });

  it('should return all products when query is empty', () => {
    component.products = PRODUCTS_MOCK;
    component.query = '';
    expect(component.filteredProducts).toEqual(PRODUCTS_MOCK);
  });

  it('should reset page to 1 when query changes', () => {
    component.page = 3;
    component.onQueryChange('test');
    expect(component.page).toBe(1);
    expect(component.query).toBe('test');
  });

  it('should handle null query value', () => {
    component.onQueryChange(null as any);
    expect(component.query).toBe('');
  });

  it('should change page size and reset to page 1', () => {
    component.page = 2;
    component.onPageSizeChange(10);
    expect(component.pageSize).toBe(10);
    expect(component.page).toBe(1);
  });

  it('should calculate total correctly', () => {
    component.products = PRODUCTS_MOCK;
    expect(component.total).toBe(PRODUCTS_MOCK.length);
  });

  it('should calculate total pages correctly', () => {
    component.products = PRODUCTS_MOCK;
    component.pageSize = 5;
    expect(component.totalPages).toBe(2);
  });

  it('should return at least 1 page when no products', () => {
    component.products = [];
    expect(component.totalPages).toBe(1);
  });

  it('should return correct paged products', () => {
    component.products = PRODUCTS_MOCK;
    component.pageSize = 2;
    component.page = 1;
    expect(component.pagedProducts.length).toBe(2);
    expect(component.pagedProducts[0].id).toBe('uno');
  });

  it('should navigate to previous page', () => {
    component.page = 3;
    component.prevPage();
    expect(component.page).toBe(2);
  });

  it('should not go below page 1', () => {
    component.page = 1;
    component.prevPage();
    expect(component.page).toBe(1);
  });

  it('should navigate to next page', () => {
    component.products = PRODUCTS_MOCK;
    component.pageSize = 2;
    component.page = 1;
    component.nextPage();
    expect(component.page).toBe(2);
  });

  it('should not exceed total pages', () => {
    component.products = PRODUCTS_MOCK;
    component.pageSize = 10;
    component.page = 1;
    component.nextPage();
    expect(component.page).toBe(1);
  });

  it('should toggle menu open/close', () => {
    component.toggleMenu('uno');
    expect(component.menuOpenId).toBe('uno');
    component.toggleMenu('uno');
    expect(component.menuOpenId).toBeNull();
  });

  it('should switch menu to different product', () => {
    component.toggleMenu('uno');
    component.toggleMenu('dos');
    expect(component.menuOpenId).toBe('dos');
  });

  it('should close menu', () => {
    component.menuOpenId = 'uno';
    component.closeMenu();
    expect(component.menuOpenId).toBeNull();
  });

  it('should navigate to edit product', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    const product = PRODUCTS_MOCK[0];
    component.menuOpenId = 'uno';
    component.editProduct(product);
    expect(navigateSpy).toHaveBeenCalledWith(
      ['/products', product.id, 'edit'],
      { state: { product } }
    );
    expect(component.menuOpenId).toBeNull();
  });

  it('should open delete modal', () => {
    const product = PRODUCTS_MOCK[0];
    component.menuOpenId = 'uno';
    component.openDeleteModal(product);
    expect(component.deleteModalOpen).toBe(true);
    expect(component.productToDelete).toBe(product);
    expect(component.menuOpenId).toBeNull();
  });

  it('should close delete modal', () => {
    component.deleteModalOpen = true;
    component.productToDelete = PRODUCTS_MOCK[0];
    component.closeDeleteModal();
    expect(component.deleteModalOpen).toBe(false);
    expect(component.productToDelete).toBeNull();
  });

  it('should confirm delete and reload products', (done) => {
    apiMock.getProducts.mockReturnValue(of(PRODUCTS_MOCK.slice(1)));
    component.productToDelete = PRODUCTS_MOCK[0];
    component.deleteModalOpen = true;
    component.confirmDelete();
    expect(apiMock.deleteProduct).toHaveBeenCalledWith(PRODUCTS_MOCK[0].id);
    setTimeout(() => {
      expect(component.deleteModalOpen).toBe(false);
      expect(component.productToDelete).toBeNull();
      done();
    }, 1100);
  });

  it('should handle delete error', () => {
    apiMock.deleteProduct.mockReturnValue(throwError(() => new Error('Error')));
    component.productToDelete = PRODUCTS_MOCK[0];
    component.confirmDelete();
    expect(component.deleteModalOpen).toBe(false);
    expect(component.error()).toBe('No fue posible eliminar el producto.');
  });

  it('should not delete if no product selected', () => {
    component.productToDelete = null;
    component.confirmDelete();
    expect(apiMock.deleteProduct).not.toHaveBeenCalled();
  });
});
