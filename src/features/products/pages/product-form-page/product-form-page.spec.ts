import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { ProductFormPage } from './product-form-page';
import { ProductsApiService } from '../../../../app/core/services/products-api.service';
import { Product } from '../../../../app/core/models/product.model';

describe('ProductFormPage', () => {
  let component: ProductFormPage;
  let fixture: ComponentFixture<ProductFormPage>;
  let apiMock: any;
  let router: Router;
  let location: Location;

  const mockProduct: Product = {
    id: 'test-id',
    name: 'Test Product',
    description: 'Test Description for product',
    logo: 'test-logo.png',
    date_release: '2025-01-20',
    date_revision: '2026-01-20',
  };

  beforeEach(async () => {
    apiMock = {
      getProducts: jest.fn(() => of([mockProduct])),
      createProduct: jest.fn(() => of(mockProduct)),
      updateProduct: jest.fn(() => of(mockProduct)),
      verifyProductId: jest.fn(() => of(false)),
    };

    await TestBed.configureTestingModule({
      imports: [ProductFormPage],
      providers: [
        provideRouter([]),
        { provide: ProductsApiService, useValue: apiMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: jest.fn(() => null),
              },
            },
          },
        },
        {
          provide: Location,
          useValue: {
            getState: jest.fn(() => ({})),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with generated id in create mode', () => {
    fixture.detectChanges();
    expect(component.form.get('id')?.value).toBeTruthy();
    expect(component.form.get('id')?.enabled).toBe(true);
    expect(component.editId).toBeNull();
  });

  it('should calculate date_revision as +1 year from date_release', () => {
    fixture.detectChanges();
    component.form.get('date_release')?.setValue('2025-01-20');
    expect(component.form.get('date_revision')?.value).toBe('2026-01-20');
  });

  it('should handle leap year in date calculation', () => {
    fixture.detectChanges();
    component.form.get('date_release')?.setValue('2024-02-29');
    expect(component.form.get('date_revision')?.value).toBe('2025-03-01');
  });

  it('should clear date_revision when date_release is empty', () => {
    fixture.detectChanges();
    component.form.get('date_release')?.setValue('2025-01-20');
    component.form.get('date_release')?.setValue('');
    expect(component.form.get('date_revision')?.value).toBe('');
  });


  it('should validate name minLength', () => {
    fixture.detectChanges();
    const nameControl = component.form.get('name');
    nameControl?.setValue('Test');
    nameControl?.markAsTouched();
    expect(nameControl?.hasError('minlength')).toBe(true);
  });

  it('should validate name maxLength', () => {
    fixture.detectChanges();
    const nameControl = component.form.get('name');
    nameControl?.setValue('a'.repeat(101));
    nameControl?.markAsTouched();
    expect(nameControl?.hasError('maxlength')).toBe(true);
  });

  it('should validate description minLength', () => {
    fixture.detectChanges();
    const descControl = component.form.get('description');
    descControl?.setValue('Short');
    descControl?.markAsTouched();
    expect(descControl?.hasError('minlength')).toBe(true);
  });

  it('should validate id minLength and maxLength', () => {
    fixture.detectChanges();
    const idControl = component.form.get('id');
    idControl?.setValue('ab');
    expect(idControl?.hasError('minlength')).toBe(true);
    idControl?.setValue('a'.repeat(11));
    expect(idControl?.hasError('maxlength')).toBe(true);
  });

  it('should mark field as invalid when touched and invalid', () => {
    fixture.detectChanges();
    component.form.get('name')?.setValue('');
    component.form.get('name')?.markAsTouched();
    expect(component.isInvalid('name')).toBe(true);
  });

  it('should not mark field as invalid when valid', () => {
    fixture.detectChanges();
    component.form.get('name')?.setValue('Valid Product Name');
    expect(component.isInvalid('name')).toBe(false);
  });

  it('should reset form in create mode', () => {
    fixture.detectChanges();
    component.form.get('name')?.setValue('Test Name');
    component.submitError.set('Some error');
    component.reset();
    expect(component.form.get('name')?.value).toBeNull();
    expect(component.submitError()).toBeNull();
    expect(component.form.get('id')?.value).toBeTruthy();
  });


  it('should not submit if form is invalid', () => {
    fixture.detectChanges();
    component.form.get('name')?.setValue('');
    component.submit();
    expect(apiMock.createProduct).not.toHaveBeenCalled();
    expect(component.form.get('name')?.touched).toBe(true);
  });

  describe('Edit Mode', () => {
    let activatedRoute: ActivatedRoute;

    beforeEach(() => {
      activatedRoute = TestBed.inject(ActivatedRoute);
      (activatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue('test-id');
    });

    it('should disable id field in edit mode', () => {
      jest.spyOn(location, 'getState').mockReturnValue({ product: mockProduct });
      fixture.detectChanges();
      expect(component.editId).toBe('test-id');
      expect(component.form.get('id')?.disabled).toBe(true);
    });

    it('should load product from navigation state', () => {
      jest.spyOn(location, 'getState').mockReturnValue({ product: mockProduct });
      fixture.detectChanges();
      expect(component.form.get('id')?.value).toBe(mockProduct.id);
      expect(component.form.get('name')?.value).toBe(mockProduct.name);
      expect(component.form.get('description')?.value).toBe(mockProduct.description);
    });

    it('should fallback to API when no navigation state', () => {
      jest.spyOn(location, 'getState').mockReturnValue({});
      fixture.detectChanges();
      expect(apiMock.getProducts).toHaveBeenCalled();
    });

    it('should handle product not found in fallback', () => {
      jest.spyOn(location, 'getState').mockReturnValue({});
      apiMock.getProducts.mockReturnValue(of([]));
      fixture.detectChanges();
      expect(component.submitError()).toBe('Producto no encontrado.');
    });

    it('should handle API error in fallback', () => {
      jest.spyOn(location, 'getState').mockReturnValue({});
      apiMock.getProducts.mockReturnValue(throwError(() => new Error('API Error')));
      fixture.detectChanges();
      expect(component.submitError()).toBe('No fue posible cargar el producto.');
    });

  });
});
