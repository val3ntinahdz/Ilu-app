# Ilu-app

## Problema

Las remesas son fundamentales para la economía de Oaxaca, proporcionando bienestar y desarrollo a muchas familias. Sin embargo, existen barreras importantes al acceso y aprovechamiento de este recurso:

- **Altos costos de comisión** en servicios tradicionales.
- **Limitada accesibilidad**, ya que muchas personas deben desplazarse físicamente a sucursales para recibir pagos.
- **Ausencia de historial crediticio**, lo que dificulta la inclusión financiera, ya que las transferencias convencionales no generan registros útiles para este fin.

## Tecología usada

### Backend
- **Node.js** (ES Modules)
- **Express.js**
- **@interledger/open-payments** (para integración con pagos abiertos)
- **Librerías:** CORS, dotenv, uuid, qrcode

### Frontend
- **React 18** + **Vite**
- **Bootstrap 5**
- **Lucide React** (iconos)
- **Axios** (HTTP client)

## Solución

**Ilu** es un aplicación que facilita la recepción y gestión de remesas y pagos digitales, promoviendo la economía circular y la inclusión financiera en Oaxaca. Utiliza Open Payments para reducir comisiones y generar historial crediticio digital, además de contar con un asistente virtual para educación financiera.

### Características principales

- Recepción de remesas en línea, sin necesidad de acudir a sucursales.
- Historial crediticio digital.
- Comisiones más bajas gracias a Open Payments.
- Accesibilidad universal desde cualquier dispositivo con internet.
- Educación financiera mediante un asistente virtual para el ahorro inteligente.

## Beneficios

- **Reducción de costos** para los usuarios en la recepción de remesas.
- **Mayor accesibilidad**: uso desde cualquier lugar, sin desplazamientos.
- **Generación de historial crediticio** para fomentar la inclusión financiera.
- **Facilidad de uso** gracias a una interfaz amigable y soporte educativo.
- **Fomento de la economía circular** en Oaxaca.

## Arquitectura/stack simple

```
Frontend (React + Vite + Bootstrap)
           |
           v
Backend (Node.js + Express + Open Payments)
           |
           v
Servicios de Open Payments / Interledger
```

- El **frontend** se comunica con el **backend** vía API REST.
- El **backend** gestiona usuarios, transacciones y lógica de negocio, y se conecta a la red de pagos abiertos.
- La infraestructura busca ser escalable y segura, separando claramente la capa de presentación y la lógica de negocio.

## Funciones son indispensables

- **Dashboard del usuario**: visualización de saldo, transacciones y estadísticas.
- **Envío y recepción de dinero**: transferencias digitales entre usuarios.
- **Visualización de historial/transacciones recientes**.
- **Generación de historial crediticio** automático.
- **Recomendaciones y educación financiera** mediante asistente virtual.
- **Gestión de notificaciones** y alertas.
- **Autenticación y seguridad** para los usuarios.
- **Integración con Open Payments** para comisiones bajas y estándares abiertos.

## Responsabilidades
------------------------------------------------------------------------------------
| Nombre        | Rol / Responsabilidad                                            |
|---------------|------------------------------------------------------------------|
| Valentina León Hernandez | Liderazgo general, arquitectura, backend Open Payments|
| Saúl Abigael Guerra Rivas| Frontend principal, integración UX/UI                 |
|Nahum Santa Ana Ceballos  | Desarrollador frontend, documentación                 |
| Abraham Reyes Castillo   | Desarrollador backend ,intrgración de simulación AI,  |
------------------------------------------------------------------------------------

---

## Objetivo del Proyecto

Desarrollar una plataforma web que permita a los usuarios recibir, administrar y aprovechar sus remesas de forma digital, reduciendo costos y fomentando la creación de un historial crediticio.

### Objetivos específicos

- Ofrecer una experiencia sencilla y accesible.
- Garantizar la seguridad y privacidad de los datos.
- Promover la inclusión financiera.
- Facilitar la integración de pagos digitales con estándares abiertos.
- Impulsar la economía circular en la región.

---

## Hackathon Open Payments – Interledger
**Equipo:** Code Spartans: ILU  
**Proyecto:** Ilu-app
