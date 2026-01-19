import { Product } from "../../../../../app/core/models/product.model";

export const PRODUCTS_MOCK: Product[] = [
  {
    id: 'uno',
    name: 'Tarjeta Crédito',
    description: 'Producto para compras a crédito.',
    logo: 'assets-1.png',
    date_release: '2025-01-01',
    date_revision: '2026-01-01',
  },
  {
    id: 'dos',
    name: 'Cuenta Ahorros',
    description: 'Cuenta para ahorro y retiros.',
    logo: 'assets-2.png',
    date_release: '2024-06-15',
    date_revision: '2025-06-15',
  },
  {
    id: 'tres',
    name: 'Crédito Libre Inversión',
    description: 'Préstamo para múltiples propósitos.',
    logo: 'assets-3.png',
    date_release: '2023-10-20',
    date_revision: '2024-10-20',
  },
  {
    id: 'cuatro',
    name: 'CDT',
    description: 'Inversión a término fijo.',
    logo: 'assets-4.png',
    date_release: '2022-02-01',
    date_revision: '2023-02-01',
  },
  {
    id: 'cinco',
    name: 'Seguro de Vida',
    description: 'Cobertura ante eventualidades.',
    logo: 'assets-5.png',
    date_release: '2021-08-12',
    date_revision: '2022-08-12',
  },
  {
    id: 'seis',
    name: 'Leasing',
    description: 'Financiación de activos.',
    logo: 'assets-6.png',
    date_release: '2020-03-05',
    date_revision: '2021-03-05',
  },
];
