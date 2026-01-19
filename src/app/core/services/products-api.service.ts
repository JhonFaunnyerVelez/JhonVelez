import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductResponse, ProductsResponse } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly baseUrl = `/bp/products`;

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<ProductsResponse>(this.baseUrl).pipe(map(r => r.data));
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<ProductResponse>(this.baseUrl, product).pipe(map(r => r.data));
  }

  verifyProductId(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/verification/${id}`);
  }

  updateProduct(id: string, payload: Omit<Product, 'id'>) {
    return this.http.put(`${this.baseUrl}/${id}`, payload);
  }

  deleteProduct(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

}
