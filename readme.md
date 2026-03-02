URL Shortener (Generador de QR)
Este es un proyecto Full Stack desarrollado como parte de mi portafolio profesional. Es un acortador de URLs que simplifica enlaces largos Y genera automáticamente un código QR descargable y rastrea la cantidad de clics en tiempo real.

Características

-Acortamiento de URLs: Genera enlaces cortos únicos de 6 caracteres utilizando nanoid.
-Generación de QR: Crea un código QR dinámico para cada enlace generado.
-Contador de Clics: Sistema de analítica básica que incrementa un contador cada vez que se accede al enlace corto.
-Validación Robusta: Validación de URLs en el backend para asegurar redirecciones seguras.
-Diseño Responsivo: Interfaz moderna con tema oscuro y funcionalidad de "copiar al portapapeles".

Tecnologías Utilizadas

-Backend: Node.js con Express.
-Base de Datos: PostgreSQL para persistencia de datos.
-Frontend: HTML5, CSS3 (Flexbox) y JavaScript Vanilla.

Librerías clave:
pg: Para la conexión con PostgreSQL.
nanoid: Para la generación de códigos únicos.
qrcode: Para la creación de códigos QR en formato DataURL.
dotenv: Para la gestión segura de variables de entorno.


Requisitos Previos
-Node.js instalado (v14 o superior).
-Instancia de PostgreSQL activa.
-Instalación y Configuración
    Clona el repositorio:
        -git clone https://github.com/tu-usuario/url-shortener.git
        -cd url-shortener

Instala las dependencias:

-npm install

Configura las variables de entorno:
-Crea un archivo .env en la raíz del proyecto basándote en el archivo .env.example proporcionado.

Prepara la base de datos:
-Ejecuta las sentencias SQL contenidas en el archivo database.sql para crear la tabla necesaria.

Inicia el servidor:
-npm start
El servidor estará corriendo en http://localhost:3000.

Nota
Este proyecto se bbasa en una aplicación que busca seguir el patrón MVC, gestionar bases de datos relacionales y conectar el frontend con servicios backend de forma asíncrona.