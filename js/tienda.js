// =============================================================
// VatioVerde: catalogo, filtros, buscador y carrito, con JavaScript.
// Cada bloque dice QUE hace y PARA QUE.
// =============================================================

// --- CONSTANTES: valores que no cambian. Se declaran con const ---
const TARIFA = 950;     // lo que cuesta 1 kWh, en pesos (COP). Tarifa de ejemplo
const DIAS_MES = 30;    // dias de un mes: para pasar el ahorro de un dia al de un mes

// --- ARREGLO DE OBJETOS LITERALES: los productos de la tienda ---
// [ ] = arreglo: una lista de elementos. { } = objeto: datos con nombre (propiedad: valor)
// wattsAntes   = potencia (W) del equipo VIEJO que se reemplaza
// wattsDespues = potencia (W) del equipo NUEVO (0 si no usa energia de la red)
// horasDia     = horas de uso al dia
const productos = [
    { id: 1, nombre: "Bombillo LED globo 13 W", categoria: "iluminacion", precio: 12900,
      wattsAntes: 100, wattsDespues: 13, horasDia: 6 },
    { id: 2, nombre: "Tubo LED T8 18 W", categoria: "iluminacion", precio: 14500,
      wattsAntes: 40, wattsDespues: 18, horasDia: 8 },
    { id: 3, nombre: "Lámpara LED de escritorio 7 W", categoria: "iluminacion", precio: 45000,
      wattsAntes: 50, wattsDespues: 7, horasDia: 4 },
    { id: 4, nombre: "Nevera inverter 260 L", categoria: "electrodomesticos", precio: 1790000,
      wattsAntes: 120, wattsDespues: 50, horasDia: 24 },
    { id: 5, nombre: "Ventilador DC de techo", categoria: "electrodomesticos", precio: 350000,
      wattsAntes: 75, wattsDespues: 30, horasDia: 8 },
    { id: 6, nombre: "Estufa de inducción 2 hornillas", categoria: "electrodomesticos", precio: 780000,
      wattsAntes: 1500, wattsDespues: 1000, horasDia: 1.5 },
    { id: 7, nombre: "Termo solar de 150 L", categoria: "solar", precio: 1350000,
      wattsAntes: 3500, wattsDespues: 0, horasDia: 0.5 },
    { id: 8, nombre: "Bomba de agua solar 90 W", categoria: "solar", precio: 980000,
      wattsAntes: 750, wattsDespues: 0, horasDia: 1 },
    { id: 9, nombre: "Lámpara solar de exterior", categoria: "solar", precio: 85000,
      wattsAntes: 60, wattsDespues: 0, horasDia: 10 }
];

// --- ESTADO: lo que cambia mientras el usuario usa la pagina. Se declara con let ---
let categoriaActiva = "todas";   // el filtro elegido ("todas", "iluminacion"...)
let textoBuscado = "";           // lo que hay escrito en el buscador
let carrito = [];                // los productos agregados. Empieza vacio: []

// --- FUNCIONES ---
// Una funcion es un bloque de codigo con nombre. Recibe datos (parametros)
// y devuelve un resultado con return. Se escribe una vez y se usa muchas veces.

// ahorroKwhMes: cuantos kWh ahorra un producto en un mes.
// Ejemplo con el bombillo: (100 - 13) x 6 x 30 / 1000 = 15,66 kWh
function ahorroKwhMes(producto) {
    // Vatios que se dejan de gastar, por horas al dia, por dias del mes, y pasado a kWh
    return (producto.wattsAntes - producto.wattsDespues) * producto.horasDia * DIAS_MES / 1000;
}

// ahorroPesosMes: cuantos pesos ahorra un producto en un mes.
// Usa la funcion anterior: kWh ahorrados x tarifa.
function ahorroPesosMes(producto) {
    return ahorroKwhMes(producto) * TARIFA;
}

// pesos: escribe un numero como plata colombiana.
// Ejemplo: pesos(12900) -> "$12.900"
function pesos(valor) {
    // Math.round redondea sin decimales. toLocaleString("es-CO") pone el punto de miles.
    return "$" + Math.round(valor).toLocaleString("es-CO");
}

// nombreCategoria: el nombre de la categoria para mostrar, con tilde y mayuscula.
// En los datos se guarda sin tildes ("iluminacion") y en la pagina se muestra bonito.
function nombreCategoria(categoria) {
    // CONDICIONAL: if = "si"; else if = "si no, si"; else = "si no"
    if (categoria === "iluminacion") {
        return "Iluminación";
    } else if (categoria === "electrodomesticos") {
        return "Electrodomésticos";
    } else {
        return "Energía solar";
    }
}

// normalizar: pasa un texto a minusculas y sin tildes, para comparar sin errores.
// Asi "lampara" encuentra "Lámpara".
function normalizar(texto) {
    return texto
        .normalize("NFD")                  // separa cada tilde de su letra
        .replace(/[\u0300-\u036f]/g, "")   // quita las tildes
        .toLowerCase();                    // todo en minusculas
}

// coincideBusqueda: true si el nombre del producto contiene lo que se escribio.
// includes = "contiene". Si no se escribio nada, todo coincide.
function coincideBusqueda(producto, texto) {
    return normalizar(producto.nombre).includes(normalizar(texto));
}

// --- DOM: escribir en la pagina las tarjetas de los productos ---
// DOM = la pagina vista desde JavaScript: cada etiqueta del HTML se puede buscar, leer y cambiar.
// mostrarProductos: dibuja una tarjeta por producto que cumpla el filtro Y la busqueda.
function mostrarProductos() {
    // querySelector busca en la pagina el elemento con ese id
    const contenedor = document.querySelector("#productos");
    const aviso = document.querySelector("#sin-resultados");

    // innerHTML = el HTML que hay dentro del elemento. Lo vaciamos para volver a dibujar
    contenedor.innerHTML = "";
    let encontrados = 0;   // contador: cuantos productos se muestran

    // BUCLE for...of: repite el bloque una vez por cada producto del arreglo
    for (const producto of productos) {
        // CONDICIONAL: si el producto NO es de la categoria elegida, o su nombre NO
        // contiene lo escrito, continue lo salta y pasa al siguiente producto
        const esDeCategoria = categoriaActiva === "todas" || producto.categoria === categoriaActiva;
        if (!esDeCategoria || !coincideBusqueda(producto, textoBuscado)) {
            continue;
        }

        encontrados++;

        // TEMPLATE STRING: texto entre comillas invertidas, con ${ } para meter valores.
        // += agrega la tarjeta al final, sin borrar las anteriores.
        contenedor.innerHTML += `
            <article class="tarjeta">
                <span class="categoria">${nombreCategoria(producto.categoria)}</span>
                <h3>${producto.nombre}</h3>
                <p>Reemplaza un equipo de ${producto.wattsAntes} W. Ahorra
                   <span class="ahorro">${ahorroKwhMes(producto).toFixed(1)} kWh</span> al mes.</p>
                <p class="precio">${pesos(producto.precio)}</p>
                <p>Ahorro al mes: <span class="ahorro">${pesos(ahorroPesosMes(producto))}</span></p>
                <button class="btn btn-primary btn-sm" data-id="${producto.id}">Agregar al carrito</button>
            </article>`;
    }

    // Si no quedo ningun producto, se muestra el aviso. hidden = true oculta el aviso
    aviso.hidden = encontrados > 0;
}

// --- EL CARRITO ---

// agregarAlCarrito: agrega al carrito el producto que tiene ese id.
function agregarAlCarrito(id) {
    // find recorre el arreglo y devuelve el primer producto cuyo id coincide
    const producto = productos.find((p) => p.id === id);
    if (producto) {
        carrito.push(producto);   // push = agregar al final del arreglo
    }
    mostrarCarrito();
}

// mostrarCarrito: dibuja la lista, el total, el ahorro del carrito y los meses para pagarlo.
function mostrarCarrito() {
    const lista = document.querySelector("#lista-carrito");
    lista.innerHTML = "";

    // ACUMULADORES: variables que empiezan en 0 y se van sumando en el bucle (let)
    let total = 0;
    let ahorroMes = 0;

    for (const producto of carrito) {
        lista.innerHTML += `<li>${producto.nombre}: ${pesos(producto.precio)}</li>`;
        total += producto.precio;                  // suma el precio del producto
        ahorroMes += ahorroPesosMes(producto);     // suma el ahorro mensual del producto
    }

    document.querySelector("#total").textContent = "Total: " + pesos(total);

    const parrafoAhorro = document.querySelector("#ahorro");
    if (carrito.length === 0) {
        parrafoAhorro.textContent = "El carrito está vacío.";
    } else {
        // Math.ceil redondea HACIA ARRIBA: 18,9 meses -> 19 (con 18 meses todavia no alcanza)
        const meses = Math.ceil(total / ahorroMes);
        const unidad = meses === 1 ? "mes" : "meses";   // condicional en una linea
        parrafoAhorro.textContent =
            `Ahorro del carrito: ${pesos(ahorroMes)} al mes. La compra se paga sola en ${meses} ${unidad}.`;
    }
}

// --- EVENTOS: el programa reacciona a lo que hace el usuario ---
// addEventListener("evento", funcion) = cuando ocurre el evento, se ejecuta la funcion

// Filtros (click): un boton por categoria y uno de "Todas"
const botonesFiltro = document.querySelectorAll(".filtro");
for (const boton of botonesFiltro) {
    boton.addEventListener("click", function () {
        // Quita el resaltado a todos los botones...
        for (const otro of botonesFiltro) {
            otro.classList.remove("activo");
        }
        // ...y resalta solo el que se oprimio. classList = las clases del elemento
        boton.classList.add("activo");
        // dataset.categoria lee el atributo data-categoria del HTML
        categoriaActiva = boton.dataset.categoria;
        mostrarProductos();
    });
}

// Buscador (input): se dispara con cada letra que se escribe
document.querySelector("#buscador").addEventListener("input", function (evento) {
    // evento.target = el campo de texto. value = lo que hay escrito
    textoBuscado = evento.target.value;
    mostrarProductos();
});

// Botones "Agregar al carrito": el clic se escucha en el CONTENEDOR #productos.
// Los botones los crea JavaScript y se vuelven a crear al filtrar, por eso no se escuchan uno por uno.
document.querySelector("#productos").addEventListener("click", function (evento) {
    // Si el elemento donde se hizo clic tiene data-id, es un boton "Agregar"
    if (evento.target.dataset.id) {
        // dataset.id es TEXTO ("1"). Number lo convierte en numero (1)
        agregarAlCarrito(Number(evento.target.dataset.id));
    }
});

// Boton "Vaciar carrito": el carrito vuelve a ser un arreglo vacio
document.querySelector("#vaciar").addEventListener("click", function () {
    carrito = [];
    mostrarCarrito();
});

// --- AL CARGAR LA PAGINA: se dibujan el catalogo completo y el carrito vacio ---
mostrarProductos();
mostrarCarrito();