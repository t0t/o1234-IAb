# Landing Page Experimental

Esta es una landing page experimental que utiliza Cytoscape.js para crear una estructura de navegación dinámica e interactiva, donde los elementos están conectados formando un grafo visual.

## Características

- Logo SVG fijo en la esquina
- Estructura de navegación basada en grafo utilizando Cytoscape.js
- Diferentes tipos de nodos: texto, imágenes, gráficos, video
- Interacciones: clic para ver detalles, doble clic para expandir/colapsar
- Diseño minimalista con tema oscuro
- Totalmente responsivo

## Tecnologías

- Vite como sistema de build
- JavaScript moderno (ES6+)
- HTML5 y CSS3
- Cytoscape.js para visualización y manipulación de grafos
- Sistema de componentes modular

## Estructura del proyecto

```
/
├── index.html           # Página principal con el contenedor SVG
├── vite.config.js       # Configuración de Vite
├── package.json         # Dependencias y configuración del proyecto
├── src/
│   ├── js/
│   │   ├── main.js      # Punto de entrada principal
│   │   ├── graph.js     # Configuración y operaciones de Cytoscape
│   │   ├── nodes.js     # Definición de nodos y datos
│   │   └── events.js    # Manejadores de eventos
│   ├── styles/
│   │   ├── main.css     # Estilos principales
│   │   └── variables.css # Variables CSS
│   └── assets/
│       ├── svg/         # Archivos SVG como el logo
│       ├── img/         # Imágenes
│       └── video/       # Archivos de video
```

## Cómo ejecutar

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar servidor de desarrollo:
```bash
npm run dev
```

3. Construir para producción:
```bash
npm run build
```

## Uso

- **Clic en nodo**: Muestra información detallada en un panel
- **Doble clic en nodo**: Expande/colapsa para mostrar más nodos relacionados
- **Doble clic en fondo**: Restablece la vista
- **Teclas**:
  - `0`: Restablece zoom y posición
  - `+`: Acercar
  - `-`: Alejar
  - `l`: Cambiar layout aleatoriamente
