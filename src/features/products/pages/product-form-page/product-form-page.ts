import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';

import { ProductsApiService } from '../../../../app/core/services/products-api.service';
import { Product } from '../../../../app/core/models/product.model';
import { productIdNotExistsValidator } from '../../validators/product-id-not-exists.validator';
import { minTodayValidator } from '../../validators/min-today.validator';

@Component({
  selector: 'app-product-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form-page.html',
  styleUrl: './product-form-page.css',
})
export class ProductFormPage {
  saving = signal<boolean>(false);
  submitError = signal<string | null>(null);

  public fb = inject(FormBuilder);
  public api = inject(ProductsApiService);
  public router = inject(Router);
  public route = inject(ActivatedRoute);
  public location = inject(Location);

  //  si viene id en la URL, estamos editando
  editId: string | null = null;

  form = this.fb.group({
    id: this.fb.control('', {
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(10),
      ],
      asyncValidators: [productIdNotExistsValidator(this.api)],
      updateOn: 'blur',
    }),
    name: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
    logo: ['', Validators.required],
    date_release: ['', [Validators.required, minTodayValidator]],
    date_revision: [{ value: '', disabled: true }, Validators.required],
  });

  ngOnInit(): void {
    // Calculo de fecha revisión = +1 año (sirve tanto crear como editar)
    this.form.get('date_release')!.valueChanges.subscribe(value => {
      if (!value) {
        this.form.get('date_revision')!.setValue('');
        return;
      }

      const [y, m, d] = value.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      dt.setFullYear(dt.getFullYear() + 1);

      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');

      this.form.get('date_revision')!.setValue(`${yyyy}-${mm}-${dd}`);
    });

    // Detectar si es edición
    this.editId = this.route.snapshot.paramMap.get('id');

    if (this.editId) {
      // En edición no se debe cambiar el ID
      this.form.get('id')!.disable({ emitEvent: false });

      // Intentar cargar desde navigation state (sin llamar servicio)
      const st = this.location.getState() as any;
      const p = st?.product as Product | undefined;

      if (p && p.id === this.editId) {
        this.patchForm(p);
        return;
      }

      // Fallback: si recargan o entran directo por URL
      this.loadProductFallback(this.editId);
      return;
    }

    // Modo crear
    this.form.get('id')!.setValue(this.generateId());
  }

  private loadProductFallback(id: string): void {
    this.api.getProducts().subscribe({
      next: (data: any) => {
        const list = data?.data ?? data;
        const found = (list as Product[]).find(x => x.id === id);

        if (!found) {
          this.submitError.set('Producto no encontrado.');
          return;
        }

        this.patchForm(found);
      },
      error: () => {
        this.submitError.set('No fue posible cargar el producto.');
      }
    });
  }

  /**
   * setea los valores del formulario con el producto dado.
   * @param p
   */
  private patchForm(p: Product): void {
    this.form.patchValue({
      id: p.id,
      name: p.name,
      description: p.description,
      logo: p.logo,
      date_release: p.date_release,
      date_revision: p.date_revision,
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  /**
   * setea el formulario a su estado inicial.
   * @returns
   */
  reset(): void {
    this.submitError.set(null);
    this.form.reset();
    this.form.get('date_revision')!.setValue('');

    // En edición, no reiniciamos a un id random: mantenemos el mismo id en el input (disabled)
    if (this.editId) {
      return;
    }

    this.form.get('id')!.setValue(this.generateId());
  }


  /**
   * Envía el formulario para crear o actualizar el producto.
   */
  submit(): void {
    this.submitError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    this.saving.set(true);

    // EDITAR: PUT /bp/products/:id (body sin id)
    if (this.editId) {
      const { id, ...body } = payload as any;

      this.api.updateProduct(this.editId, body).subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigateByUrl('/products');
        },
        error: (err) => {
          this.saving.set(false);
          this.handleBackendError(err, 'No fue posible actualizar el producto.');
        }
      });

      return;
    }

    // CREAR: POST /bp/products
    this.api.createProduct(payload as any).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigateByUrl('/products');
      },
      error: (err) => {
        this.saving.set(false);
        this.handleBackendError(err, 'No fue posible crear el producto.');
      }
    });
  }

  private handleBackendError(err: any, fallbackMsg: string): void {
    const backend = err?.error;

    // si viene el arreglo "errors" del backend
    if (backend?.errors?.length) {
      const lines = backend.errors.map((e: any) => {
        const field = e?.property ?? 'campo';
        const constraintMsg = e?.constraints ? Object.values(e.constraints)[0] : 'inválido';
        return `• ${field}: ${constraintMsg}`;
      });

      this.submitError.set(lines.join('\n'));
      return;
    }

    this.submitError.set(backend?.message || fallbackMsg);
  }
}
