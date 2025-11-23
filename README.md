# Gestión de Rutas – Prototipo Funcional (CFE)

Este proyecto es un **prototipo web interactivo** diseñado para simular un sistema de gestión de rutas usado por técnicos de CFE.  
Fue creado como parte de la materia **Ingeniería de Software**, siguiendo buenas prácticas de documentación, diseño modular, arquitectura y prototipado funcional.

El sitio incluye:

- Pantallas descriptivas (problema, propuesta, arquitectura)
- Prototipo interactivo con módulos funcionales
- Simulación de base de datos usando `localStorage`
- Uso de Bootstrap 5, Bootstrap Icons y componentes reutilizables


## 🚀 **Enlace al sitio (GitHub Pages)**
 
https://cottonmouth2804.github.io/gestion-rutas-cfe


## 📌 **Descripción general**

El sistema permite visualizar cómo funcionaría una herramienta real para:

- Organizar rutas de técnicos  
- Registrar medidores  
- Asignar zonas  
- Validar duplicidad  
- Monitorear el avance de los trabajos  
- Generar reportes visuales  

Todo esto mediante un prototipo interactivo con interfaz limpia y moderna.

Este proyecto **no usa backend**, no requiere base de datos y funciona 100% en el navegador gracias a *localStorage*.


## 📁 **Estructura del proyecto**
gestion-rutas-cfe/
│
├── index.html # Página principal
│
├── pages/
│ ├── problema.html # Descripción del problema actual
│ ├── propuesta.html # Propuesta de solución
│ ├── arquitectura.html # Arquitectura y diagramas
│ └── prototipo.html # Home del prototipo funcional
│
│ └── prototipo/ # Módulos funcionales
│ ├── tecnicos.html
│ ├── medidores.html
│ ├── rutas.html
│ ├── asignaciones.html
│ └── reportes.html
│
├── css/
│ ├── bootstrap.min.css # Bootstrap local
│ └── style.css # Estilos personalizados
│
├── js/
│ ├── bootstrap.min.js # Bootstrap JS local
│ ├── tecnicos.js # Lógica del módulo Técnicos
│ ├── medidores.js # Lógica del módulo Medidores
│ ├── rutas.js # Lógica del módulo Rutas Programadas
│ ├── asignaciones.js # Lógica del módulo Asignaciones
│ └── reportes.js # Dashboard y reportes
│
│
└── img/ # Imágenes, iconos y logotipos

---

## 🔧 **Tecnologías utilizadas**

- **HTML5**
- **CSS3**
- **Bootstrap 5 (local)**
- **Bootstrap Icons (CDN)**
- **JavaScript puro**
- **localStorage**
- **Git & GitHub Pages**

---

## 🎯 **Características principales**

### ✔ Pantallas de análisis
- Presentación del problema real en campo  
- Propuesta de solución profesional  
- Arquitectura con módulos y diagramas  

### ✔ Prototipo funcional
Incluye interacción real en:

- Registro y edición de técnicos  
- Gestión de medidores  
- Generación de rutas programadas  
- Asignación de tareas  
- Validación de duplicidad  
- Dashboard de reportes (estadísticas + exportación CSV)


## 🧩 **Cómo ejecutar el proyecto**

### 🔹 Opción 1 — Desde GitHub Pages  
Solo abre el link público:

https://cottonmouth2804.github.io/gestion-rutas-cfe



