/**
 * Gestión de eventos e interacciones con el grafo
 * Proporciona funciones para manejar las interacciones del usuario
 */

import { getExpandedNodes } from './nodes.js';
import { applyLayout } from './graph.js';

/**
 * Configura todos los eventos de interacción para la instancia de Cytoscape
 * @param {Object} cy - Instancia de Cytoscape
 */
export function setupEvents(cy) {
  // Referencias a elementos DOM
  const infoPanel = document.getElementById('expandable-panel');
  const infoPanelContent = infoPanel ? infoPanel.querySelector('.info-panel-content') : null;
  
  // Si el panel de información existe, configurar eventos
  if (infoPanel && infoPanelContent) {
    // Cerrar panel al hacer clic fuera de él
    document.addEventListener('click', (e) => {
      if (infoPanel.classList.contains('open') && 
          !infoPanel.contains(e.target) && 
          !e.target.closest('.cytoscape-container')) {
        infoPanel.classList.remove('open');
      }
    });
  }
  
  // Evento: Click en un nodo
  cy.on('tap', 'node', function(evt) {
    const node = evt.target;
    
    // Mostrar panel de información con el contenido del nodo
    if (infoPanel && infoPanelContent) {
      showNodeInfo(node, infoPanelContent, infoPanel);
    }
  });
  
  // Evento: Click en el fondo para cerrar el panel
  cy.on('tap', function(evt) {
    if (evt.target === cy && infoPanel) {
      infoPanel.classList.remove('open');
    }
  });
  
  // Evento: Doble click en un nodo para expandir/colapsar
  cy.on('dbltap', 'node', function(evt) {
    const node = evt.target;
    
    // Verificar si el nodo ya ha sido expandido
    if (!node.data('expanded')) {
      expandNode(node, cy);
    } else {
      collapseNode(node, cy);
    }
  });
  
  // Eventos hover para mejorar la experiencia de usuario
  setupHoverEffects(cy);
  
  // Añadir manipulación del viewport con gestos y botones del ratón
  setupViewportControls(cy);
  
  // Configura eventos para cerrar el panel de información
  setupInfoPanelEvents();
}

/**
 * Muestra la información detallada de un nodo en el panel lateral
 * @param {Object} node - Nodo de Cytoscape que fue clickeado
 * @param {HTMLElement} contentElement - Elemento DOM donde mostrar el contenido
 * @param {HTMLElement} panelElement - Elemento DOM del panel completo
 */
function showNodeInfo(node, contentElement, panelElement) {
  // Obtener datos del nodo
  const nodeData = node.data();
  const content = nodeData.content || `<h3>${nodeData.label}</h3><p>No hay información adicional disponible para este nodo.</p>`;
  
  // Actualizar contenido del panel
  contentElement.innerHTML = content;
  
  // Añadir clases específicas según el tipo de nodo
  panelElement.className = 'info-panel open';
  if (nodeData.type) {
    panelElement.classList.add(`type-${nodeData.type}`);
  }
  
  // Añadir comportamiento a los botones o elementos interactivos dentro del panel
  setupPanelInteractions(contentElement);
}

/**
 * Configura interacciones para elementos dentro del panel de información
 * @param {HTMLElement} panelContent - Contenido del panel donde se encuentran los elementos interactivos
 */
function setupPanelInteractions(panelContent) {
  // Ejemplo: Añadir comportamiento a formularios
  const forms = panelContent.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('Formulario enviado (simulación)');
      
      // En una implementación real, aquí se procesaría el formulario
      alert('El formulario ha sido enviado (simulación)');
    });
  });
  
  // Ejemplo: Añadir comportamiento a botones
  const buttons = panelContent.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('click', (e) => {
      if (e.target.closest('form')) return; // Ignorar si es un botón de formulario
      
      console.log('Botón clickeado:', e.target.textContent);
    });
  });
}

/**
 * Expande un nodo añadiendo nodos hijos conectados
 * @param {Object} node - Nodo de Cytoscape a expandir
 * @param {Object} cy - Instancia de Cytoscape
 */
function expandNode(node, cy) {
  // Marcar el nodo como expandido
  node.data('expanded', true);
  
  // Obtener nuevos nodos para la expansión
  const newElements = getExpandedNodes(node.id());
  
  // Añadir los nuevos nodos al grafo
  cy.add(newElements);
  
  // Aplicar un layout centrado en el nodo expandido
  const expandedLayout = cy.layout({
    name: 'concentric',
    concentric: function(ele) {
      if (ele.id() === node.id()) return 2;
      if (ele.isChild()) return 1;
      return 0;
    },
    levelWidth: function() { return 1; },
    animate: true,
    animationDuration: 500,
    animationEasing: 'ease-out',
    fit: true,
    padding: 50
  });
  
  expandedLayout.run();
}

/**
 * Colapsa un nodo eliminando sus nodos hijos
 * @param {Object} node - Nodo de Cytoscape a colapsar
 * @param {Object} cy - Instancia de Cytoscape
 */
function collapseNode(node, cy) {
  // Encontrar los nodos conectados que fueron añadidos en la expansión
  const connectedEles = cy.collection();
  
  // Recorrer vecinos directos
  node.neighborhood().forEach(ele => {
    // Si el ID contiene "expanded", es un nodo añadido por nosotros
    if (ele.id().includes('expanded')) {
      connectedEles.merge(ele);
      
      // También incluir sus conexiones
      ele.connectedEdges().forEach(edge => {
        connectedEles.merge(edge);
      });
    }
  });
  
  // Eliminar los elementos encontrados con una animación
  connectedEles.forEach(ele => {
    ele.animate({
      style: { opacity: 0 },
      duration: 300
    }, {
      complete: function() {
        cy.remove(ele);
      }
    });
  });
  
  // Marcar el nodo como no expandido
  node.data('expanded', false);
  
  // Volver a centrar el grafo
  cy.animate({
    fit: {
      eles: cy.elements(),
      padding: 50
    },
    duration: 500
  });
}

/**
 * Configura efectos visuales para el hover de nodos y bordes
 * @param {Object} cy - Instancia de Cytoscape
 */
function setupHoverEffects(cy) {
  // Hover sobre nodos
  cy.on('mouseover', 'node', function(e) {
    const node = e.target;
    
    // Destacar el nodo actual
    node.animate({
      style: {
        'border-width': 3,
        'border-color': '#ffffff',
        'z-index': 999
      },
      duration: 200
    });
    
    // Destacar bordes conectados
    node.connectedEdges().addClass('hover').animate({
      style: {
        'line-color': '#bb86fc',
        'target-arrow-color': '#bb86fc',
        'width': 3,
        'opacity': 1
      },
      duration: 200
    });
  });
  
  cy.on('mouseout', 'node', function(e) {
    const node = e.target;
    
    // Restaurar estilo del nodo
    if (!node.selected()) {
      node.animate({
        style: {
          'border-width': 2,
          'border-color': '#bb86fc',
          'z-index': 0
        },
        duration: 200
      });
    }
    
    // Restaurar bordes conectados
    node.connectedEdges().removeClass('hover');
  });
  
  // Hover sobre bordes
  cy.on('mouseover', 'edge', function(e) {
    const edge = e.target;
    edge.addClass('hover');
  });
  
  cy.on('mouseout', 'edge', function(e) {
    const edge = e.target;
    edge.removeClass('hover');
  });
}

/**
 * Configura controles adicionales para la manipulación del viewport
 * @param {Object} cy - Instancia de Cytoscape
 */
function setupViewportControls(cy) {
  // Control de orientación con doble click en el fondo
  cy.on('dbltap', function(evt) {
    if (evt.target === cy) {
      // Doble click en el fondo - restablece la vista
      cy.animate({
        fit: {
          eles: cy.elements(),
          padding: 50
        },
        duration: 500
      });
    }
  });
  
  // Añadir controles de teclado para navegación
  document.addEventListener('keydown', (e) => {
    // Solo procesar si no estamos en un campo de texto
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch (e.key) {
      case '0': // Restablecer zoom/posición
        cy.animate({
          fit: {
            eles: cy.elements(),
            padding: 50
          },
          duration: 500
        });
        break;
      case '+': // Acercar
      case '=':
        cy.animate({
          zoom: {
            level: cy.zoom() * 1.2,
            position: { x: cy.width() / 2, y: cy.height() / 2 }
          },
          duration: 300
        });
        break;
      case '-': // Alejar
      case '_':
        cy.animate({
          zoom: {
            level: cy.zoom() * 0.8,
            position: { x: cy.width() / 2, y: cy.height() / 2 }
          },
          duration: 300
        });
        break;
      case 'l': // Cambiar layout
        const layouts = ['cose', 'circle', 'grid', 'concentric', 'breadthfirst'];
        const randomLayout = layouts[Math.floor(Math.random() * layouts.length)];
        applyLayout(cy, randomLayout);
        break;
    }
  });
}

/**
 * Configura eventos para cerrar el panel de información cuando se hace clic fuera de él
 */
export function setupInfoPanelEvents() {
  const infoPanel = document.getElementById('expandable-panel');
  
  if (!infoPanel) {
    console.error('Panel de información no encontrado');
    return;
  }
  
  // Evento para cerrar el panel de información cuando se hace clic fuera de él
  document.addEventListener('click', (event) => {
    // Si el panel está abierto y el clic no fue dentro del panel
    if (infoPanel.classList.contains('open') && 
        !infoPanel.contains(event.target) &&
        !event.target.closest('.cytoscape-container node')) {
      infoPanel.classList.remove('open');
      console.log('Panel cerrado por clic fuera');
    }
  });
  
  // También cerrar al presionar Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && infoPanel.classList.contains('open')) {
      infoPanel.classList.remove('open');
      console.log('Panel cerrado por tecla Escape');
    }
  });
}
