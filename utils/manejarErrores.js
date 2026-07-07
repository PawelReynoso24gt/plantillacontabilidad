export const manejarErrorRuta = (error, router) => {
        console.error("Fallo detectado:", error);

        // 1. Verificamos si el servidor nos respondió algo
        if (error.response) {
        const status = error.response.status;

            if (status === 400) {
            // El 400 (Bad Request) ya NO redirige. Solo avisa en consola.
            console.warn("Error 400: Petición mal formada (Bad Request). Revisa los datos enviados.");
            }
            else if (status === 401) {
            // Error 401 (No autorizado / Sesión expirada o token inválido)
            router.push('/page401');
            }
            else if (status === 422) {
                // Error 422: Fallan validaciones del Request
                router.push('/page422');
            } 
            else if (status === 403) {
                // Error 403 explícito (Falta de permisos / CORS rechazado por backend)
                router.push('/page403'); 
            }
            else if (status === 404) {
                // Error 404 ruta no encontrada o página inaccesible
                router.push('/page404');
            }
            else if (status === 500) {
                // Error 500: El servidor explotó, error de base de datos
                router.push('/page500'); 
            } 
            else {
                // Para cualquier otro código extraño
                router.push('/page403');
            }
        } 
        // 2. No hay respuesta (Backend apagado: ERR_CONNECTION_REFUSED)
        else if (error.request) {
            console.error("Error de Red: El servidor está apagado o es inalcanzable.");
            
            // Lo mandamos a la pantalla 504 (Gateway Timeout / Servidor Inalcanzable)
            // También puedes usar '/page502' si prefieres llamarlo Bad Gateway
            router.push('/page504'); 
        } 
        // 3. Fallo en la configuración misma de Axios
        else {
            console.error("Error interno de Axios:", error.message);
        }
    };