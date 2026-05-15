# Portal Boda

Sitio web profesional para Portal Boda - Fotografía y Video de Matrimonios en Chile.

## 🚀 Deploy en Vercel

### Opción 1: Deploy directo desde carpeta

1. Instala Vercel CLI:
```bash
npm i -g vercel
```

2. Desde esta carpeta, ejecuta:
```bash
vercel
```

3. Sigue las instrucciones:
   - Acepta configuración por defecto
   - Conecta tu cuenta
   - Deploy

### Opción 2: Deploy desde GitHub

1. Crea un repo en GitHub
2. Sube esta carpeta:
```bash
git init
git add .
git commit -m "Portal Boda website"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/portalboda.git
git push -u origin main
```

3. En Vercel:
   - Import project
   - Selecciona el repo
   - Deploy

### Opción 3: Deploy con Vercel Desktop

1. Descarga Vercel Desktop
2. Arrastra esta carpeta
3. Deploy automático

## 🌐 Conectar dominio portalboda.cl

Una vez deployado en Vercel:

1. Ve a tu proyecto en Vercel
2. Settings → Domains
3. Add Domain: `portalboda.cl`
4. Copia los nameservers que te da Vercel
5. Ve a NIC.cl y cambia los nameservers de tu dominio
6. Espera 24-48 horas para propagación

## 📧 Configurar email

Configura `contacto@portalboda.cl` en Zoho Mail (gratis hasta 5 cuentas):
https://www.zoho.com/mail/

## 📁 Estructura

```
portalboda/
├── index.html          - Sitio principal
├── style.css           - Estilos
├── script.js           - Chatbot + interacciones
├── vercel.json         - Configuración Vercel
├── package.json        - Metadata
├── img/                - Imágenes optimizadas (4.2 MB)
└── README.md           - Este archivo
```

## ✅ Verificación

El sitio ha sido verificado y está listo para producción.
Ver `VERIFICACION_COMPLETA.txt` para detalles.

## 🎯 SEO

- Schema.org LocalBusiness implementado
- Cobertura: Santiago, Valparaíso, O'Higgins
- Meta tags optimizados
- Sitemap y robots.txt incluidos

## 📱 Contacto

- WhatsApp: +56 9 5418 9795
- Email: portalboda@gmail.com
- Instagram: @portalboda
- Facebook: /portalboda

---

© 2026 Portal Boda SPA · Todos los derechos reservados
