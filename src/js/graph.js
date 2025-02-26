/**
 * Configuración y gestión del grafo de Cytoscape
 * Proporciona funciones para inicializar y manipular la instancia principal
 */

import cytoscape from 'cytoscape';
import cyCanvas from 'cytoscape-canvas';

// Registrar la extensión canvas
cyCanvas(cytoscape);

/**
 * Inicializa y configura la instancia de Cytoscape
 * @param {string} containerId - ID del elemento HTML contenedor
 * @param {Array} elements - Elementos iniciales (nodos y conexiones)
 * @returns {Object} - Instancia de Cytoscape
 */
export function initGraph(containerId, elements) {
  // Detectar si estamos en un dispositivo móvil
  const isMobile = window.innerWidth <= 768;
  console.log(`Inicializando grafo (Móvil: ${isMobile ? 'Sí' : 'No'})`);
  
  // Contenedor del grafo
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Contenedor ${containerId} no encontrado`);
    return null;
  }
  
  // Limpiar cualquier instancia previa
  if (container._cyreg) {
    console.log('Limpiando instancia previa de Cytoscape');
    container._cyreg.instance.destroy();
  }
  
  // Ajustar parámetros del layout según el dispositivo
  const layoutConfig = {
    name: 'cose',
    animate: false,
    nodeDimensionsIncludeLabels: true,
    refresh: 20,
    fit: true,
    padding: isMobile ? 10 : 20,
    randomize: false,
    componentSpacing: isMobile ? 40 : 60,
    nodeOverlap: isMobile ? 10 : 15,
    idealEdgeLength: isMobile ? 50 : 70,
    edgeElasticity: 100,
    nestingFactor: 5,
    gravity: isMobile ? 150 : 120,
    numIter: 1000,
    initialTemp: 200,
    coolingFactor: 0.95,
    minTemp: 1.0
  };
  
  // Configuración de la instancia de Cytoscape
  const cy = cytoscape({
    container: container,
    elements: elements,
    style: getCytoscapeStyles(),
    layout: layoutConfig,
    // Opciones para una mejor experiencia de usuario
    minZoom: isMobile ? 0.2 : 0.3,
    maxZoom: isMobile ? 4 : 3.5,
    pixelRatio: 'auto',
    wheelSensitivity: 0.5 // Reducir sensibilidad de la rueda para un zoom más controlable
  });
  
  // Función para ajustar todo después de la carga
  function initialSetup() {
    // Aplicar configuración inicial
    cy.fit();
    cy.center();
    
    // Ajustar tamaño de nodos según el viewport
    adjustNodeSizes(cy);
    
    console.log('Configuración inicial completada');
  }
  
  // Asegurar que el grafo esté completamente cargado antes de ajustar
  cy.ready(initialSetup);
  
  // También ajustar cuando cambie el tamaño de la ventana
  window.addEventListener('resize', () => {
    console.log('Ventana redimensionada, ajustando grafo');
    adjustNodeSizes(cy);
  });
  
  // Inicializar controles para dispositivos móviles
  initMobileControls(cy);
  
  // Crear capa de canvas para efectos visuales avanzados
  const canvasLayer = cy.cyCanvas({
    zIndex: 1,
    pixelRatio: "auto"
  });
  
  const canvas = canvasLayer.getCanvas();
  const ctx = canvas.getContext('2d');
  
  // Cargar imágenes para los nodos que lo requieran
  const imageCache = {};
  
  cy.nodes().forEach(node => {
    const tipo = node.data('type');
    if (tipo === 'imagen' && node.data('imageUrl')) {
      precargarImagen(node.data('imageUrl'), imageCache);
    } else if (tipo === 'icono' && node.data('iconUrl')) {
      precargarImagen(node.data('iconUrl'), imageCache);
    } else if (tipo === 'svg' && node.data('svgUrl')) {
      precargarImagen(node.data('svgUrl'), imageCache);
    }
  });
  
  // Función para dibujar todos los nodos con sus efectos visuales
  function drawAllNodes() {
    requestAnimationFrame(() => {
      canvasLayer.resetTransform(ctx);
      canvasLayer.clear(ctx);
      canvasLayer.setTransform(ctx);
      
      cy.nodes().forEach(node => {
        const pos = node.position();
        const tipo = node.data('type') || 'default';
        
        switch(tipo) {
          case 'imagen':
            dibujarNodoImagen(ctx, pos, node, imageCache);
            break;
          case 'texto':
            dibujarNodoTexto(ctx, pos, node);
            break;
          case 'icono':
            dibujarNodoIcono(ctx, pos, node, imageCache);
            break;
          case 'svg':
            dibujarNodoSVG(ctx, pos, node, imageCache);
            break;
          case 'boton':
            dibujarNodoBoton(ctx, pos, node);
            break;
          case 'grafico':
            dibujarNodoGrafico(ctx, pos, node);
            break;
          case 'video':
            dibujarNodoVideo(ctx, pos, node);
            break;
          default:
            dibujarNodoDefault(ctx, pos, node);
        }
      });
      
      drawAllNodes();
    });
  }
  
  // Eventos de interacción con el grafo
  cy.on('tap', 'node', function(evt) {
    const node = evt.target;
    
    // Limpiar selección previa
    cy.nodes().removeClass('selected');
    node.addClass('selected');
    
    const tipo = node.data('type');
    
    // Si es un nodo colapsable, alternar su estado
    if (tipo === 'boton') {
      toggleNodoColapsable(node, cy);
    }
    
    // Mostrar la información del nodo
    mostrarInformacionNodo(node, cy);
  });
  
  cy.on('tap', function(evt) {
    // Si se hace clic en el fondo, se cierra la información
    if (evt.target === cy) {
      document.getElementById('expandable-panel').classList.remove('open');
      cy.nodes().removeClass('selected');
    }
  });
  
  // Iniciar el bucle de dibujo
  drawAllNodes();
  
  // Configurar evento de redimensionamiento
  window.addEventListener('resize', () => {
    adjustNodeSizes(cy);
    cy.fit();
    cy.center();
  });

  return cy;
}

/**
 * Inicializa controles para dispositivos móviles
 * @param {Object} cy - Instancia de Cytoscape
 */
export function initMobileControls(cy) {
  // Crear controles de zoom
  const zoomInButton = document.getElementById('zoom-in');
  const zoomOutButton = document.getElementById('zoom-out');
  const resetViewButton = document.getElementById('reset-view');
  
  if (zoomInButton) {
    zoomInButton.addEventListener('click', function() {
      cy.zoom(cy.zoom() + 0.1);
    });
  }
  
  if (zoomOutButton) {
    zoomOutButton.addEventListener('click', function() {
      cy.zoom(cy.zoom() - 0.1);
    });
  }
  
  if (resetViewButton) {
    resetViewButton.addEventListener('click', function() {
      cy.fit();
      cy.center();
    });
  }
}

/**
 * Precarga imágenes para evitar retrasos durante el renderizado
 */
function precargarImagen(url, cache) {
  if (!cache[url]) {
    const img = new Image();
    img.src = url;
    cache[url] = img;
  }
  return cache[url];
}

/**
 * Dibuja un nodo de tipo imagen (con la imagen como fondo)
 */
function dibujarNodoImagen(ctx, pos, node, imageCache) {
  const size = 50;
  const x = pos.x;
  const y = pos.y;
  const imageUrl = node.data('imageUrl');
  
  // Dibuja el fondo del nodo
  ctx.beginPath();
  ctx.rect(x - size/2, y - size/2, size, size);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = node.selected() ? '#BB86FC' : '#888888';
  ctx.lineWidth = node.selected() ? 3 : 1;
  ctx.stroke();
  
  // Dibuja la imagen si está disponible
  if (imageUrl && imageCache[imageUrl]) {
    const img = imageCache[imageUrl];
    if (img.complete) {
      try {
        // Recorta la imagen como un cuadrado
        ctx.save();
        ctx.beginPath();
        ctx.rect(x - size/2 + 2, y - size/2 + 2, size - 4, size - 4);
        ctx.clip();
        
        // Dibuja la imagen recortada
        ctx.drawImage(img, x - size/2 + 2, y - size/2 + 2, size - 4, size - 4);
        ctx.restore();
      } catch (e) {
        console.error("Error al dibujar imagen:", e);
      }
    }
  }
  
  // Añade un borde con efecto sutil
  ctx.beginPath();
  ctx.rect(x - size/2, y - size/2, size, size);
  ctx.strokeStyle = '#ffffff55';
  ctx.lineWidth = 1;
  ctx.stroke();
}

/**
 * Dibuja un nodo de tipo texto
 */
function dibujarNodoTexto(ctx, pos, node) {
  const width = 60;
  const height = 40;
  const x = pos.x || 0;
  const y = pos.y || 0;
  const radius = 5;
  
  // Verificar que las coordenadas sean valores finitos
  if (!isFinite(x) || !isFinite(y) || !isFinite(width) || !isFinite(height)) {
    console.warn("Coordenadas no válidas para dibujar nodo texto:", {x, y, width, height});
    return;
  }
  
  // Dibuja un rectángulo redondeado
  ctx.beginPath();
  ctx.moveTo(x - width/2 + radius, y - height/2);
  ctx.lineTo(x + width/2 - radius, y - height/2);
  ctx.quadraticCurveTo(x + width/2, y - height/2, x + width/2, y - height/2 + radius);
  ctx.lineTo(x + width/2, y + height/2 - radius);
  ctx.quadraticCurveTo(x + width/2, y + height/2, x + width/2 - radius, y + height/2);
  ctx.lineTo(x - width/2 + radius, y + height/2);
  ctx.quadraticCurveTo(x - width/2, y + height/2, x - width/2, y + height/2 - radius);
  ctx.lineTo(x - width/2, y - height/2 + radius);
  ctx.quadraticCurveTo(x - width/2, y - height/2, x - width/2 + radius, y - height/2);
  ctx.closePath();
  
  // Relleno con gradiente
  try {
    const gradient = ctx.createLinearGradient(x - width/2, y, x + width/2, y);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#f0f0f0');
    ctx.fillStyle = gradient;
  } catch (e) {
    console.error("Error al crear gradiente para nodo texto:", e);
    ctx.fillStyle = '#f5f5f5'; // Color de respaldo
  }
  ctx.fill();
  
  // Borde
  ctx.strokeStyle = node.selected() ? '#BB86FC' : '#888888';
  ctx.lineWidth = node.selected() ? 3 : 1;
  ctx.stroke();
  
  // Texto "Aa" como indicador visual de tipo texto
  ctx.font = '14px Montserrat, sans-serif';
  ctx.fillStyle = '#555555';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Aa', x, y);
}

/**
 * Dibuja un nodo de tipo icono
 */
function dibujarNodoIcono(ctx, pos, node, imageCache) {
  const size = 50;
  const x = pos.x;
  const y = pos.y;
  const iconUrl = node.data('iconUrl');
  
  // Dibuja un círculo como fondo
  ctx.beginPath();
  ctx.arc(x, y, size/2, 0, Math.PI * 2);
  ctx.fillStyle = '#f0f0f0';
  ctx.fill();
  ctx.strokeStyle = node.selected() ? '#BB86FC' : '#888888';
  ctx.lineWidth = node.selected() ? 3 : 1;
  ctx.stroke();
  
  // Dibuja el icono si está disponible
  if (iconUrl && imageCache[iconUrl]) {
    const img = imageCache[iconUrl];
    if (img.complete) {
      try {
        const iconSize = size * 0.6;
        ctx.drawImage(img, x - iconSize/2, y - iconSize/2, iconSize, iconSize);
      } catch (e) {
        console.error("Error al dibujar icono:", e);
      }
    }
  }
}

/**
 * Dibuja un nodo de tipo SVG
 */
function dibujarNodoSVG(ctx, pos, node, imageCache) {
  const size = 50;
  const x = pos.x;
  const y = pos.y;
  const svgUrl = node.data('svgUrl');
  
  // Dibuja un círculo como fondo
  ctx.beginPath();
  ctx.arc(x, y, size/2, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  
  // Añade un efecto de sombra sutil
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  // Borde
  ctx.strokeStyle = node.selected() ? '#BB86FC' : '#cccccc';
  ctx.lineWidth = node.selected() ? 3 : 1;
  ctx.stroke();
  
  // Eliminar sombra para el SVG
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  // Dibuja el SVG si está disponible
  if (svgUrl && imageCache[svgUrl]) {
    const img = imageCache[svgUrl];
    if (img.complete) {
      try {
        const svgSize = size * 0.6;
        ctx.drawImage(img, x - svgSize/2, y - svgSize/2, svgSize, svgSize);
      } catch (e) {
        console.error("Error al dibujar SVG:", e);
      }
    }
  }
}

/**
 * Dibuja un nodo de tipo botón colapsible
 */
function dibujarNodoBoton(ctx, pos, node) {
  const width = 120;
  const height = 30;
  const x = pos.x || 0;
  const y = pos.y || 0;
  const radius = 15;
  const collapsed = node.data('collapsed');
  
  // Verificar que las coordenadas sean valores finitos
  if (!isFinite(x) || !isFinite(y) || !isFinite(width) || !isFinite(height)) {
    console.warn("Coordenadas no válidas para dibujar nodo botón:", {x, y, width, height});
    return;
  }
  
  // Dibuja un rectángulo redondeado
  ctx.beginPath();
  ctx.moveTo(x - width/2 + radius, y - height/2);
  ctx.lineTo(x + width/2 - radius, y - height/2);
  ctx.quadraticCurveTo(x + width/2, y - height/2, x + width/2, y - height/2 + radius);
  ctx.lineTo(x + width/2, y + height/2 - radius);
  ctx.quadraticCurveTo(x + width/2, y + height/2, x + width/2 - radius, y + height/2);
  ctx.lineTo(x - width/2 + radius, y + height/2);
  ctx.quadraticCurveTo(x - width/2, y + height/2, x - width/2, y + height/2 - radius);
  ctx.lineTo(x - width/2, y - height/2 + radius);
  ctx.quadraticCurveTo(x - width/2, y - height/2, x - width/2 + radius, y - height/2);
  ctx.closePath();
  
  // Relleno con gradiente
  try {
    const gradient = ctx.createLinearGradient(x, y - height/2, x, y + height/2);
    gradient.addColorStop(0, '#BB86FC');
    gradient.addColorStop(1, '#8F53F1');
    ctx.fillStyle = gradient;
  } catch (e) {
    console.error("Error al crear gradiente para nodo botón:", e);
    ctx.fillStyle = '#8F53F1'; // Color de respaldo
  }
  ctx.fill();
  
  // Borde
  ctx.strokeStyle = node.selected() ? '#ffffff' : 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = node.selected() ? 2 : 1;
  ctx.stroke();
  
  // Texto del botón
  ctx.font = 'bold 12px Montserrat, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.data('label'), x, y);
  
  // Icono de expandir/colapsar
  const iconX = x + width/2 - 20;
  const iconY = y;
  const iconSize = 12;
  
  ctx.beginPath();
  if (collapsed) {
    // Icono +
    ctx.moveTo(iconX - iconSize/2, iconY);
    ctx.lineTo(iconX + iconSize/2, iconY);
    ctx.moveTo(iconX, iconY - iconSize/2);
    ctx.lineTo(iconX, iconY + iconSize/2);
  } else {
    // Icono -
    ctx.moveTo(iconX - iconSize/2, iconY);
    ctx.lineTo(iconX + iconSize/2, iconY);
  }
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * Dibuja un nodo de tipo gráfico (hexágono con animación)
 */
function dibujarNodoGrafico(ctx, pos, node) {
  const size = 25;
  const x = pos.x;
  const y = pos.y;
  
  // Dibuja un hexágono
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i - 30;
    const angleRad = (Math.PI / 180) * angleDeg;
    const px = x + size * Math.cos(angleRad);
    const py = y + size * Math.sin(angleRad);
    
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  
  // Relleno con gradiente
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
  gradient.addColorStop(0, '#BB86FC');
  gradient.addColorStop(1, '#7E57C2');
  ctx.fillStyle = gradient;
  ctx.fill();
  
  ctx.strokeStyle = node.selected() ? '#ffffff' : '#7E57C2';
  ctx.lineWidth = node.selected() ? 3 : 1;
  ctx.stroke();
  
  // Añadir líneas internas para el efecto de gráfico
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y);
  ctx.lineTo(x + size * 0.5, y);
  ctx.moveTo(x, y - size * 0.5);
  ctx.lineTo(x, y + size * 0.5);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Añadir puntos para simular datos
  const puntosRadio = size * 0.4;
  const numPuntos = 5;
  ctx.fillStyle = '#ffffff';
  
  for (let i = 0; i < numPuntos; i++) {
    const angleDeg = (360 / numPuntos) * i;
    const angleRad = (Math.PI / 180) * angleDeg;
    const radioAleatorio = puntosRadio * (0.4 + Math.random() * 0.6);
    const px = x + radioAleatorio * Math.cos(angleRad);
    const py = y + radioAleatorio * Math.sin(angleRad);
    
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Dibuja un nodo de tipo video
 */
function dibujarNodoVideo(ctx, pos, node) {
  const width = 60;
  const height = 40;
  const x = pos.x;
  const y = pos.y;
  
  // Dibuja un rectángulo redondeado para simular pantalla de video
  ctx.beginPath();
  ctx.rect(x - width/2, y - height/2, width, height);
  ctx.fillStyle = '#000000';
  ctx.fill();
  ctx.strokeStyle = node.selected() ? '#BB86FC' : '#888888';
  ctx.lineWidth = node.selected() ? 3 : 1;
  ctx.stroke();
  
  // Dibuja el símbolo de reproducción (triángulo)
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 10);
  ctx.lineTo(x + 15, y);
  ctx.lineTo(x - 10, y + 10);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  
  // Añade líneas para simular pantalla
  ctx.beginPath();
  ctx.moveTo(x - width/2, y - height/2 + 10);
  ctx.lineTo(x + width/2, y - height/2 + 10);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

/**
 * Dibuja un nodo por defecto (con efecto de pulso)
 */
function dibujarNodoDefault(ctx, pos, node) {
  ctx.save();
  ctx.translate(pos.x, pos.y);
  
  const size = node.data('size') || 30;
  const pulso = Math.sin(Date.now() * 0.002) * 2;
  
  // Círculo con resplandor
  ctx.beginPath();
  ctx.arc(0, 0, size + pulso, 0, Math.PI * 2);
  
  // Gradiente radial para efecto de resplandor
  const gradient = ctx.createRadialGradient(0, 0, size * 0.5, 0, 0, size + pulso);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(0.7, 'rgba(52, 152, 219, 0.2)');
  gradient.addColorStop(1, 'rgba(52, 152, 219, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Círculo interior
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
  ctx.fill();
  ctx.strokeStyle = '#3498db';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Muestra información interactiva al hacer clic en un nodo
 */
export function mostrarInformacionNodo(node, cy) {
  // Deseleccionar todos los nodos primero
  cy.nodes().removeClass('selected');
  
  // Marcar este nodo como seleccionado
  node.addClass('selected');
  
  // Eliminar cualquier listener previo para evitar duplicados
  document.removeEventListener('click', window.panelClickHandler);
  
  // Crear panel de información contextual
  const infoContainer = document.getElementById('node-info-panel');
  
  if (!infoContainer) {
    // Si no existe, crear el panel
    const newInfoPanel = document.createElement('div');
    newInfoPanel.id = 'node-info-panel';
    document.body.appendChild(newInfoPanel);
  }
  
  // Obtener el panel y actualizarlo
  const panel = document.getElementById('node-info-panel');
  
  // Comprobar si estamos en un dispositivo móvil
  const isMobile = window.innerWidth <= 768;
  
  if (!isMobile) {
    // Para escritorio: posicionar cerca del nodo
    // Posicionar el panel cerca del nodo y asegurar que no se salga del viewport
    const pos = node.renderedPosition();
    
    // Calcular posición inicial
    let leftPos = pos.x + 70;
    let topPos = pos.y - 30;
    
    // Asegurar que el panel no se salga por la derecha
    const viewportWidth = window.innerWidth;
    const panelWidth = 350;
    if (leftPos + panelWidth > viewportWidth) {
      leftPos = pos.x - panelWidth - 20;
    }
    
    // Asegurar que el panel no se salga por abajo
    const viewportHeight = window.innerHeight;
    const estimatedHeight = 300;
    if (topPos + estimatedHeight > viewportHeight) {
      topPos = Math.max(20, viewportHeight - estimatedHeight - 20);
    }
    
    // Si la posición resultante es menor que cero, ajustar
    if (leftPos < 0) leftPos = 20;
    if (topPos < 0) topPos = 20;
    
    panel.style.left = `${leftPos}px`;
    panel.style.top = `${topPos}px`;
  } else {
    // Para móvil: panel fijo en la parte inferior
    panel.style.left = '0';
    panel.style.right = '0';
    panel.style.bottom = '0';
    panel.style.top = 'auto';
    panel.style.width = '100%';
    panel.style.maxWidth = '100%';
    panel.style.position = 'fixed';
  }
  
  // Crear contenido del panel con mejor estructura
  panel.innerHTML = `
    <div class="panel-header">
      <h3 class="panel-title">${node.data('label')}</h3>
      <button id="close-node-panel" class="close-button">✕</button>
    </div>
    <div class="node-content">
      ${node.data('content') || ''}
    </div>
    <div class="node-details">
      <div class="detail-row"><strong>Tipo:</strong> ${node.data('type')}</div>
      <div class="detail-row"><strong>ID:</strong> ${node.id()}</div>
    </div>
  `;
  
  // Mostrar el panel con animación
  panel.style.display = 'block';
  panel.style.opacity = '0';
  setTimeout(() => {
    panel.style.opacity = '1';
  }, 10);
  
  // Detener la propagación del clic en el nodo para evitar cierre inmediato
  node.on('click', function(evt) {
    evt.stopPropagation();
  });
  
  // Función para cerrar el panel
  function cerrarPanel() {
    panel.style.opacity = '0';
    setTimeout(() => {
      panel.style.display = 'none';
      node.removeClass('selected');
    }, 300);
  }
  
  // Agregar evento al botón de cerrar
  const closeButton = document.getElementById('close-node-panel');
  if (closeButton) {
    closeButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      cerrarPanel();
    });
  }
  
  // Añadir event listener para cerrar el panel al hacer clic fuera
  // Usamos un timeout para evitar que se active inmediatamente con el mismo clic
  setTimeout(() => {
    // Eliminar cualquier handler previo antes de agregar uno nuevo
    if (window.panelClickHandler) {
      document.removeEventListener('click', window.panelClickHandler);
    }
    
    window.panelClickHandler = function(e) {
      // Verificar si el clic fue fuera del panel y del nodo
      // Comprobar si el clic no fue en el panel, en el nodo, o en un elemento dentro del panel
      if (!panel.contains(e.target) && 
          !e.target.closest('#cy') && 
          !e.target.closest('.cytoscape-container')) {
        cerrarPanel();
        document.removeEventListener('click', window.panelClickHandler);
        console.log('Panel de nodo cerrado por clic fuera');
      }
    };
    
    document.addEventListener('click', window.panelClickHandler);
    
    // También cerrar con tecla Escape
    document.addEventListener('keydown', function escKeyHandler(e) {
      if (e.key === 'Escape') {
        cerrarPanel();
        document.removeEventListener('click', window.panelClickHandler);
        document.removeEventListener('keydown', escKeyHandler);
        console.log('Panel de nodo cerrado con tecla Escape');
      }
    });
  }, 300); // Esperar 300ms para evitar que el evento de clic actual cierre el panel
  
  // Evitar que los clics dentro del panel propaguen al documento
  panel.addEventListener('click', function(e) {
    e.stopPropagation();
  });
  
  // Verificar si hay scroll y ajustar la altura máxima en móviles
  if (isMobile) {
    const content = panel.querySelector('.node-content');
    if (content && content.scrollHeight > window.innerHeight * 0.6) {
      panel.style.maxHeight = '70vh';
      panel.style.overflowY = 'auto';
    }
  }
}

/**
 * Alterna el estado de un nodo colapsable (expandir/colapsar)
 * @param {Object} node - Nodo de tipo "boton"
 * @param {Object} cy - Instancia de Cytoscape
 */
export function toggleNodoColapsable(node, cy) {
  // Evitar que el evento se propague para prevenir conflictos
  cy.one('tap', function(evt) {
    evt.stopPropagation();
  });
  
  // Obtener el estado actual
  const collapsed = node.data('collapsed');
  
  // Obtener los nodos hijos
  const childrenIds = node.data('childrenIds') || [];
  
  // Cambiar al estado opuesto
  node.data('collapsed', !collapsed);
  
  // Actualizar la apariencia del nodo botón
  cy.style()
    .selector(`#${node.id()}`)
    .style({
      'border-color': collapsed ? '#BB86FC' : '#6200EA',
      'border-width': collapsed ? 1 : 2
    })
    .update();
  
  if (collapsed) {
    // Expandir: mostrar nodos hijos y conexiones
    childrenIds.forEach(childId => {
      const child = cy.getElementById(childId);
      
      if (child.length > 0) {
        // Mostrar el nodo hijo con animación
        child.style('opacity', 0);
        child.style('display', 'element');
        child.animate({
          style: { opacity: 1 },
          duration: 300,
          easing: 'ease-in-out-cubic'
        });
        
        // Mostrar las conexiones relacionadas
        cy.edges().forEach(edge => {
          if (edge.data('source') === childId || edge.data('target') === childId) {
            if (edge.data('hidden')) {
              edge.style('opacity', 0);
              edge.style('display', 'element');
              edge.animate({
                style: { opacity: 0.7 },
                duration: 300,
                easing: 'ease-in-out-cubic'
              });
              edge.data('hidden', false);
            }
          }
        });
      }
    });
    
    // Reacomodar el grafo
    setTimeout(() => {
      cy.layout({ 
        name: 'cose',
        animate: true,
        animationDuration: 500,
        randomize: false,
        fit: true
      }).run();
    }, 50);
  } else {
    // Colapsar: ocultar nodos hijos y conexiones
    childrenIds.forEach(childId => {
      const child = cy.getElementById(childId);
      
      if (child.length > 0) {
        // Ocultar el nodo hijo con animación
        child.animate({
          style: { opacity: 0 },
          duration: 200,
          easing: 'ease-in-out-cubic',
          complete: function() {
            // Una vez que la animación termina, ocultar completamente
            child.style('display', 'none');
          }
        });
        
        // Ocultar las conexiones relacionadas
        cy.edges().forEach(edge => {
          if (edge.data('source') === childId || edge.data('target') === childId) {
            edge.animate({
              style: { opacity: 0 },
              duration: 200,
              easing: 'ease-in-out-cubic',
              complete: function() {
                edge.style('display', 'none');
                edge.data('hidden', true);
              }
            });
          }
        });
      }
    });
    
    // Reacomodar el grafo después de ocultar nodos
    setTimeout(() => {
      cy.layout({ 
        name: 'cose',
        animate: true,
        animationDuration: 500,
        randomize: false,
        fit: true
      }).run();
    }, 250);
  }
  
  // También muestra información sobre el nodo botón después de la animación
  setTimeout(() => {
    // Mostrar información del nodo después de la animación
    const infoPanel = document.getElementById('node-info-panel');
    if (infoPanel) {
      infoPanel.style.opacity = '0';
      setTimeout(() => {
        infoPanel.style.display = 'none';
        mostrarInformacionNodo(node, cy);
      }, 300);
    } else {
      mostrarInformacionNodo(node, cy);
    }
  }, 350);
}

/**
 * Obtiene el valor computado de una variable CSS
 * @param {string} varName - Nombre de la variable CSS (sin el prefijo var(--)
 * @returns {string} - Valor computado de la variable CSS
 */
function getCssVariable(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${varName}`).trim();
}

/**
 * Define los estilos para los elementos del grafo
 * @returns {Array} - Array de reglas de estilo para Cytoscape
 */
function getCytoscapeStyles() {
  // Obtener valores reales de las variables CSS
  const colorPrimary = getCssVariable('color-primary');
  const colorSecondary = getCssVariable('color-secondary');
  const colorBackground = getCssVariable('color-background');
  const colorTextPrimary = getCssVariable('color-text-primary');
  
  // Detectamos si es un dispositivo móvil
  const isMobile = window.innerWidth <= 768;
  
  return [
    // Estilo base para nodos
    {
      selector: 'node',
      style: {
        'background-color': '#ffffff',
        'background-opacity': 0.9, // Más opaco para mejor contraste
        'border-width': isMobile ? 3 : 2, // Borde más grueso en móviles
        'border-color': colorPrimary,
        'border-opacity': 1, // Completamente opaco para mejor visibilidad
        'width': 70, // Tamaño base más grande
        'height': 70, // Tamaño base más grande
        'label': 'data(label)',
        'color': colorTextPrimary,
        'font-family': 'Montserrat, sans-serif',
        'font-size': '14px', // Texto más grande
        'font-weight': 600, // Un poco más grueso para mejor legibilidad
        'text-halign': 'center',
        'text-valign': 'center',
        'text-outline-width': isMobile ? 2 : 1, // Borde más grueso para el texto en móviles
        'text-outline-color': 'rgba(0, 0, 0, 0.7)', // Contorno oscuro para mejor contraste
        'text-outline-opacity': 0.9,
        'text-background-opacity': 0, // Quitamos el fondo completamente
        'text-background-color': 'transparent',
        'text-border-opacity': 0,
        'transition-property': 'background-color, border-color, width, height',
        'transition-duration': '0.3s'
      }
    },
    
    // Estilo para nodo seleccionado
    {
      selector: 'node.selected',
      style: {
        'border-width': isMobile ? 5 : 4, // Borde aún más grueso en móviles
        'border-color': colorSecondary,
        'width': 85, // 20% más grande que el tamaño base
        'height': 85, // 20% más grande que el tamaño base
        'font-size': '16px', // Texto más grande
        'text-outline-color': 'rgba(0, 0, 0, 0.8)', // Contorno oscuro más fuerte
        'text-outline-opacity': 1,
        'z-index': 100 // Asegurar que quede por encima de otros elementos
      }
    },
    
    // Estilos específicos por tipo de nodo
    {
      selector: 'node[type = "texto"]',
      style: {
        'shape': 'round-rectangle',
        'background-color': '#ffffff',
        'text-valign': 'center'
      }
    },
    {
      selector: 'node[type = "grafico"]',
      style: {
        'shape': 'hexagon',
        'background-color': '#f8f8f8',
        'text-valign': 'bottom'
      }
    },
    {
      selector: 'node[type = "imagen"]',
      style: {
        'shape': 'rectangle',
        'background-color': '#f0f0f0',
        'background-image': 'data(imageUrl)',
        'background-fit': 'cover',
        'background-opacity': 1,
        'text-valign': 'bottom',
        'text-margin-y': 5
      }
    },
    {
      selector: 'node[type = "icono"]',
      style: {
        'shape': 'round-rectangle',
        'background-color': '#e0e0e0',
        'background-image': 'data(iconUrl)',
        'background-width': '60%',
        'background-height': '60%',
        'background-fit': 'contain',
        'text-valign': 'bottom',
        'text-margin-y': 5
      }
    },
    {
      selector: 'node[type = "svg"]',
      style: {
        'shape': 'ellipse',
        'background-color': '#ffffff',
        'background-image': 'data(svgUrl)',
        'background-width': '80%',
        'background-height': '80%',
        'background-fit': 'contain',
        'text-valign': 'bottom',
        'text-margin-y': 5
      }
    },
    {
      selector: 'node[type = "boton"]',
      style: {
        'shape': 'round-rectangle',
        'background-color': colorSecondary,
        'color': '#ffffff',
        'text-valign': 'center',
        'font-weight': 600,
        'width': 'data(width)', // Cambiado de 'label' a 'data(width)'
        'height': 30,
        'text-max-width': 120,
        'padding': '10px'
      }
    },
    {
      selector: 'node[type = "video"]',
      style: {
        'shape': 'tag',
        'background-color': '#e5e5e5',
        'text-valign': 'bottom'
      }
    },
    
    // Estilo para edges (conexiones)
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': colorPrimary,
        'target-arrow-color': colorPrimary,
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1.2,
        'curve-style': 'bezier',
        'opacity': 0.7,
        'transition-property': 'line-color, target-arrow-color, opacity, width',
        'transition-duration': '0.3s'
      }
    },
    
    // Estilo para edges al pasar el mouse (Cambiado de edge:hover a una clase)
    {
      selector: 'edge.hover',
      style: {
        'width': 3,
        'opacity': 1,
        'line-color': colorSecondary,
        'target-arrow-color': colorSecondary
      }
    },
    
    // Estilo para edges seleccionadas
    {
      selector: 'edge:selected',
      style: {
        'width': 3,
        'opacity': 1,
        'line-color': colorSecondary,
        'target-arrow-color': colorSecondary
      }
    }
  ];
}

/**
 * Aplica un nuevo layout al grafo
 * @param {Object} cy - Instancia de Cytoscape
 * @param {string} layoutName - Nombre del layout a aplicar
 */
export function applyLayout(cy, layoutName) {
  let layoutOptions = {
    animate: true,
    animationDuration: 500,
    fit: true,
    padding: 50
  };
  
  switch(layoutName) {
    case 'circular':
      layoutOptions = {
        ...layoutOptions,
        name: 'circle',
        spacingFactor: 0.75
      };
      break;
    
    case 'grid':
      layoutOptions = {
        ...layoutOptions,
        name: 'grid',
        avoidOverlap: true
      };
      break;
    
    case 'breadthfirst':
      layoutOptions = {
        ...layoutOptions,
        name: 'breadthfirst',
        directed: true,
        spacingFactor: 1.2
      };
      break;
    
    case 'concentric':
      layoutOptions = {
        ...layoutOptions,
        name: 'concentric',
        minNodeSpacing: 50
      };
      break;
    
    default:
      layoutOptions = {
        ...layoutOptions,
        name: 'cose',
        animate: false,
        randomize: false,
        componentSpacing: 100,
        nodeOverlap: 20,
        idealEdgeLength: 50, // Aristas más cortas
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80
      };
  }
  
  cy.layout(layoutOptions).run();
}

/**
 * Ajusta el tamaño de los nodos según las dimensiones del viewport
 * @param {Object} cy - Instancia de Cytoscape
 */
function adjustNodeSizes(cy) {
  const container = cy.container();
  if (!container) return;
  
  const width = container.clientWidth;
  const height = container.clientHeight;
  const viewportSize = Math.min(width, height);
  const isMobile = window.innerWidth <= 768;
  
  // Factor de escala mucho más agresivo para todos los dispositivos
  // Usamos un denominador mucho más pequeño para que los nodos sean proporcionalmente más grandes
  const scaleFactor = isMobile ? 5 : 8;
  
  // Tamaño mínimo mucho mayor para asegurar buena visibilidad
  const minSize = isMobile ? 90 : 80;
  const maxSize = isMobile ? 150 : 120;
  
  // Calculamos el tamaño base con una fórmula más agresiva
  const baseNodeSize = Math.max(minSize, Math.min(maxSize, viewportSize / scaleFactor));
  
  console.log(`Viewport: ${width}x${height}, Node size: ${baseNodeSize}px`);
  
  // Aplicar los nuevos tamaños a los nodos
  cy.style()
    .selector('node')
    .style({
      'width': baseNodeSize,
      'height': baseNodeSize,
      'font-size': `${Math.max(16, baseNodeSize / 4)}px` // Texto proporcionalmente más grande
    })
    .selector('node.selected')
    .style({
      'width': baseNodeSize * 1.2,
      'height': baseNodeSize * 1.2,
      'font-size': `${Math.max(18, baseNodeSize / 3.5)}px` // Texto aún más grande para nodos seleccionados
    })
    .update();
  
  // Actualizar también las etiquetas
  cy.nodes().forEach(node => {
    node.style('label', node.data('label'));
  });
  
  // Ajustar el layout para que sea más compacto y los nodos se distribuyan mejor
  applyOptimizedLayout(cy, isMobile);
  
  // Asegurar que el grafo se ajuste completamente al viewport
  setTimeout(() => {
    cy.fit();
    cy.center();
  }, 100);
}

/**
 * Aplica un layout optimizado para todos los dispositivos
 * @param {Object} cy - Instancia de Cytoscape
 * @param {boolean} isMobile - Si es un dispositivo móvil
 */
function applyOptimizedLayout(cy, isMobile) {
  const layoutOptions = {
    name: 'cose',
    animate: false,
    nodeDimensionsIncludeLabels: true,
    refresh: 20,
    fit: true,
    padding: isMobile ? 10 : 20, // Padding reducido en todos los dispositivos
    randomize: false,
    componentSpacing: isMobile ? 40 : 60, // Componentes más juntos
    nodeOverlap: isMobile ? 10 : 15,
    idealEdgeLength: isMobile ? 50 : 70, // Aristas más cortas
    edgeElasticity: 100,
    nestingFactor: 5,
    gravity: isMobile ? 150 : 120, // Gravedad más fuerte para mantener todo junto
    numIter: 1000,
    initialTemp: 200,
    coolingFactor: 0.95,
    minTemp: 1.0
  };
  
  cy.layout(layoutOptions).run();
}
