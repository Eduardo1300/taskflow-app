# Iconos necesarios para PWA

Los siguientes archivos de iconos deben ser agregados a la carpeta `public/`:

1. **pwa-192x192.png** - Icono de 192x192 píxeles
2. **pwa-512x512.png** - Icono de 512x512 píxeles  
3. **apple-touch-icon.png** - Icono para Apple de 180x180 píxeles
4. **mask-icon.svg** - Icono SVG para Safari

## Instrucciones para crear los iconos:

1. Usa el logo de TaskFlow existente
2. Crea versiones en los tamaños especificados
3. Asegúrate de que tengan fondo sólido para buena visibilidad
4. Los iconos deben seguir las guías de diseño de iconos de aplicaciones

## Comando para generar iconos (si tienes ImageMagick):
```bash
# Desde un icono base de alta resolución (1024x1024)
convert icon-1024.png -resize 192x192 public/pwa-192x192.png
convert icon-1024.png -resize 512x512 public/pwa-512x512.png
convert icon-1024.png -resize 180x180 public/apple-touch-icon.png
```

Por ahora, puedes usar el vite.svg como placeholder hasta que tengas los iconos definitivos.
