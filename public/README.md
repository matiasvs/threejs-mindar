# 🎯 Compilar Imagen Objetivo

Para que la aplicación AR funcione, necesitas compilar tu imagen objetivo en formato `.mind`.

## Opción 1: Compilador Online (Recomendado)

1. Ve a: **https://hiukim.github.io/mind-ar-js-doc/tools/compile**
2. Sube tu imagen desde `assets/target-image.png`
3. Espera a que compile (puede tardar 1-2 minutos)
4. Descarga el archivo `targets.mind`
5. Colócalo en la carpeta `public/` de este proyecto

## Opción 2: Compilar Localmente (Avanzado)

Si prefieres compilar localmente, necesitas instalar dependencias nativas:

```bash
# Instalar dependencias del sistema (Ubuntu/Debian)
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# O en macOS
brew install pkg-config cairo pango libpng jpeg giflib librsvg

# Luego instalar mind-ar-js
npm install mind-ar
node scripts/compile-target.js
```

## ⚠️ Importante

**Sin el archivo `targets.mind`, la aplicación no funcionará** y mostrará un error.

## 📝 Características de una Buena Imagen Objetivo

- ✅ Alto contraste
- ✅ Patrones únicos y distintivos
- ✅ Evitar patrones repetitivos
- ✅ Tamaño recomendado: 512x512px o mayor
- ✅ Formato: PNG o JPG

## 🔗 Recursos

- [Documentación MindAR](https://hiukim.github.io/mind-ar-js-doc/)
- [Compilador Online](https://hiukim.github.io/mind-ar-js-doc/tools/compile)
