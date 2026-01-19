# TecnicaDevsuJhonvelez

PARA LEVANTAR PROYECTO
1.Levantar proyecto api 
2.Levantar prueba tecnica ng serve --proxy-config proxy.conf.json

MEJORAS
* se agrega boton cancelar en el form de producto para regresar al form de products
* 

IMPORTANTE : 

Durante la implementación se detectó una diferencia entre la validación del formulario y la validación del backend (longitud mínima del campo nombre).
Se decidió alinear el frontend con la validación del backend, manteniendo el backend como fuente de verdad.

# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch (se re-ejecutan al guardar cambios)
npm test -- --watch

# Ejecutar pruebas de un archivo específico
npm test -- products-page.spec.ts

# Ejecutar pruebas con cobertura de código
npm test -- --coverage

# Ejecutar pruebas en modo verbose (más detalles)
npm test -- --verbose

# Ejecutar solo las pruebas que fallaron en la última ejecución
npm test -- --onlyFailures

# Ejecutar pruebas sin caché
npm test -- --no-cache

# Ejecutar pruebas y actualizar snapshots
npm test -- --updateSnapshot


This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
