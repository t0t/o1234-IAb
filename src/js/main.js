/**
 * Landing Page Experimental con Cytoscape.js
 * Archivo principal que coordina la inicialización de componentes
 */

import { initGraph } from './graph.js';
import { setupEvents } from './events.js';
import { getInitialNodes } from './nodes.js';

// Inicialización de la aplicación cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('Iniciando Landing Page Experimental...');
  
  // Crear instancia de Cytoscape con los nodos iniciales
  const cy = initGraph('cy', getInitialNodes());
  
  // Configurar eventos para la interacción del usuario
  setupEvents(cy);
  
  // Aplicar animación inicial para mostrar los elementos gradualmente
  animateInitialView(cy);
});

/**
 * Realiza una animación inicial para mostrar los elementos gradualmente
 * @param {Object} cy - Instancia de Cytoscape
 */
function animateInitialView(cy) {
  // Ocultar todos los elementos inicialmente
  cy.elements().style('opacity', 0);
  
  // Mostrar los elementos con un retraso escalonado para crear efecto
  setTimeout(() => {
    // Mostrar nodos con un retraso entre cada uno
    cy.nodes().forEach((node, i) => {
      setTimeout(() => {
        node.animate({
          style: { opacity: 1 },
          duration: 800,
          easing: 'ease-in-out-cubic'
        });
      }, i * 100);
    });
    
    // Mostrar aristas después de mostrar los nodos
    setTimeout(() => {
      cy.edges().forEach((edge, i) => {
        setTimeout(() => {
          edge.animate({
            style: { opacity: 1 },
            duration: 600,
            easing: 'ease-in-out-cubic'
          });
        }, i * 50);
      });
    }, cy.nodes().length * 100 + 300);
  }, 300);
}
