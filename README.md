# Three.js + MindAR.js Image Tracking

Proyecto de Realidad Aumentada (AR) con seguimiento de imágenes usando Three.js y MindAR.js, construido con Vite.js y deploy automático a GitHub Pages.

## 🚀 Características

- ✨ **Image Tracking AR**: Seguimiento de imágenes en tiempo real con MindAR.js
- 🎨 **Renderizado 3D**: Gráficos 3D con Three.js
- ⚡ **Vite.js**: Build rápido y hot-reload en desarrollo
- 🔄 **Deploy Automático**: GitHub Actions para deployment a GitHub Pages
- 📱 **Mobile-First**: Optimizado para dispositivos móviles

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Navegador con soporte para WebRTC (cámara)
- HTTPS (requerido para acceso a cámara en producción)

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install
```

## 🎯 Crear Imagen Objetivo Personalizada

1. Coloca tu imagen objetivo en `assets/target-image.png`
   - Usa imágenes con alto contraste
   - Evita patrones repetitivos
   - Tamaño recomendado: 512x512px o mayor

2. Compila la imagen objetivo:
```bash
npm run compile-target
```

Esto generará el archivo `public/targets.mind` que usa MindAR para el tracking.

## 💻 Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
```

Abre `http://localhost:3000` en tu navegador y permite el acceso a la cámara.

## 🏗️ Build para Producción

```bash
# Crear build optimizado
npm run build

# Preview del build
npm run preview
```

## 🚀 Deploy a GitHub Pages

### Configuración Inicial

1. **Habilita GitHub Pages** en tu repositorio:
   - Ve a Settings → Pages
   - En "Source", selecciona "GitHub Actions"

2. **Push a la rama main**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

El workflow de GitHub Actions se ejecutará automáticamente y desplegará tu aplicación.

### Deploy Automático

Cada push a la rama `main` activará automáticamente:
- ✅ Instalación de dependencias
- ✅ Build de producción
- ✅ Deploy a GitHub Pages

Tu aplicación estará disponible en: `https://<tu-usuario>.github.io/<nombre-repo>/`

## 📁 Estructura del Proyecto

```
threejs-mindar/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── assets/
│   └── target-image.png        # Imagen objetivo para tracking
├── public/
│   └── targets.mind            # Archivo compilado de MindAR
├── scripts/
│   └── compile-target.js       # Script para compilar imágenes
├── src/
│   ├── main.js                 # Lógica principal de la app
│   └── style.css               # Estilos
├── index.html                  # Punto de entrada HTML
├── package.json                # Dependencias y scripts
├── vite.config.js              # Configuración de Vite
└── .gitignore
```

## 🎨 Personalización

### Modificar el Contenido 3D

Edita `src/main.js` en la sección donde se crea el cubo:

```javascript
// Reemplaza el cubo con tu propio modelo 3D
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({
  color: 0x00ff88,
  metalness: 0.5,
  roughness: 0.3,
});
this.cube = new THREE.Mesh(geometry, material);
```

### Añadir Múltiples Objetivos

Modifica el script de compilación para incluir múltiples imágenes:

```javascript
const dataList = await compiler.compileImageTargets(
  [
    'assets/target-1.png',
    'assets/target-2.png',
    'assets/target-3.png'
  ],
  (progress) => console.log(`Progreso: ${Math.round(progress * 100)}%`)
);
```

Luego crea múltiples anchors en `main.js`:

```javascript
const anchor1 = this.mindarThree.addAnchor(0);
const anchor2 = this.mindarThree.addAnchor(1);
const anchor3 = this.mindarThree.addAnchor(2);
```

## 🔧 Solución de Problemas

### La cámara no se activa
- Asegúrate de estar usando HTTPS (requerido por navegadores modernos)
- Verifica los permisos de cámara en tu navegador
- En desarrollo local, `localhost` está permitido sin HTTPS

### El tracking no funciona
- Verifica que la imagen objetivo tenga suficiente contraste
- Asegúrate de que `targets.mind` esté compilado correctamente
- La iluminación debe ser adecuada
- Mantén la imagen objetivo estable y bien visible

### Error en el build
- Ejecuta `npm install` para asegurar que todas las dependencias estén instaladas
- Verifica que la versión de Node.js sea 18 o superior

## 📚 Recursos

- [Three.js Documentation](https://threejs.org/docs/)
- [MindAR Documentation](https://hiukim.github.io/mind-ar-js-doc/)
- [Vite Documentation](https://vitejs.dev/)

## 📄 Licencia

MIT
