import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { catchError, map, of } from 'rxjs';
import { ProductsApiService } from '../../../app/core/services/products-api.service';

export function productIdNotExistsValidator(
  api: ProductsApiService
): AsyncValidatorFn {
  return (control: AbstractControl) => {
    const id = control.value;

    if (!id) return of(null);

    return api.verifyProductId(id).pipe(
      map(exists => (exists ? { idExists: true } : null)),
      catchError(() => of(null))
    );
  };
}
