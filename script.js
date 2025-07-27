document.addEventListener('DOMContentLoaded', () => {
    // --- SELECCIÓN DE ELEMENTOS DEL DOM ---
    const ramos = document.querySelectorAll('.ramo');
    const popup = document.getElementById('mensaje-popup');

    // --- FRASES Y MENSAJES PERSONALIZADOS ---
    const frasesMotivacionales = [
        "¡Eres el mejor!",
        "¡Tú puedes waton!",
        "¡Queda poco!",
        "Un waton inteligente",
        "Los tiburones niños te esperan para que les enseñes",
        "¡Eres el mejor profe!",
        "Te amo profe de efi"
    ];
    const fraseSemestre5 = "¡Eso waton, tú puedes! Ya vas en la mitad, solo te queda el 50%. ¡Te amoo un montón, tiburoncin!";

    // --- LÓGICA PRINCIPAL ---

    /**
     * Carga el estado de los ramos aprobados desde el almacenamiento local del navegador.
     */
    const cargarEstado = () => {
        const aprobadosGuardados = JSON.parse(localStorage.getItem('ramosAprobadosEFI')) || [];
        aprobadosGuardados.forEach(id => {
            const ramo = document.getElementById(id);
            if (ramo) {
                ramo.classList.add('aprobado');
            }
        });
    };

    /**
     * Guarda los IDs de los ramos actualmente aprobados en el almacenamiento local.
     */
    const guardarEstado = () => {
        const ramosAprobados = document.querySelectorAll('.ramo.aprobado');
        const idsAprobados = Array.from(ramosAprobados).map(ramo => ramo.id);
        localStorage.setItem('ramosAprobadosEFI', JSON.stringify(idsAprobados));
    };

    /**
     * Actualiza el estado visual (bloqueado/desbloqueado) de todos los ramos
     * basado en si sus requisitos están cumplidos.
     */
    const actualizarEstadoBloqueo = () => {
        ramos.forEach(ramo => {
            if (ramo.classList.contains('aprobado')) {
                ramo.classList.remove('bloqueado');
                return; // Un ramo aprobado nunca está bloqueado.
            }

            const requisitos = ramo.dataset.requisitos.split(',').filter(Boolean);
            if (requisitos.length === 0) {
                ramo.classList.remove('bloqueado');
                return; // Sin requisitos, nunca está bloqueado.
            }
            
            // Verifica si CADA requisito está aprobado.
            const requisitosCumplidos = requisitos.every(reqId => {
                const reqRamo = document.getElementById(reqId);
                return reqRamo && reqRamo.classList.contains('aprobado');
            });

            ramo.classList.toggle('bloqueado', !requisitosCumplidos);
        });
    };
    
    /**
     * Muestra un mensaje emergente en la parte inferior de la pantalla.
     * @param {string} texto - El mensaje a mostrar.
     * @param {number} duracion - Cuánto tiempo (en ms) debe ser visible.
     * @param {boolean} esError - Si es verdadero, usa el color de error.
     */
    let popupTimer;
    const mostrarMensaje = (texto, duracion, esError = false) => {
        clearTimeout(popupTimer); // Limpia cualquier mensaje anterior
        popup.textContent = texto;
        popup.classList.toggle('error', esError);
        popup.classList.add('visible');

        popupTimer = setTimeout(() => {
            popup.classList.remove('visible');
        }, duracion);
    };
    
    /**
     * Verifica si todos los ramos del semestre 5 están aprobados y muestra un mensaje especial.
     */
    const verificarSemestre5Completo = () => {
        const ramosSemestre5 = document.querySelectorAll('.semestre[data-semestre="5"] .ramo');
        const todosAprobados = Array.from(ramosSemestre5).every(ramo => ramo.classList.contains('aprobado'));
        
        if (todosAprobados) {
            mostrarMensaje(fraseSemestre5, 20000); // 20 segundos
        }
    };


    // --- MANEJADOR DE EVENTOS ---
    
    /**
     * Función que se ejecuta al hacer clic en cualquier ramo.
     * @param {Event} e - El evento de clic.
     */
    const handleRamoClick = (e) => {
        const ramoSeleccionado = e.currentTarget;

        // 1. Verificar si el ramo está bloqueado
        if (ramoSeleccionado.classList.contains('bloqueado')) {
            const requisitosFaltantes = ramoSeleccionado.dataset.requisitos
                .split(',')
                .filter(reqId => !document.getElementById(reqId)?.classList.contains('aprobado'))
                .map(reqId => document.getElementById(reqId)?.textContent)
                .join(', ');
            
            mostrarMensaje(`Bloqueado 🦈 Debes aprobar: ${requisitosFaltantes}`, 5000, true);
            return;
        }

        // 2. Alternar el estado de aprobación
        const fueAprobado = ramoSeleccionado.classList.toggle('aprobado');

        // 3. Mostrar mensajes si corresponde
        if (fueAprobado) {
            const fraseAleatoria = frasesMotivacionales[Math.floor(Math.random() * frasesMotivacionales.length)];
            mostrarMensaje(fraseAleatoria, 10000); // 10 segundos
            verificarSemestre5Completo();
        }
        
        // 4. Guardar y actualizar el estado general
        guardarEstado();
        actualizarEstadoBloqueo();
    };

    // --- INICIALIZACIÓN ---
    
    // Asigna el manejador de eventos a cada ramo.
    ramos.forEach(ramo => ramo.addEventListener('click', handleRamoClick));

    // Carga el estado guardado y actualiza los bloqueos al abrir la página.
    cargarEstado();
    actualizarEstadoBloqueo();
});
