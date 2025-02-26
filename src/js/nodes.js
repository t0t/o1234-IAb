/**
 * Definición de nodos y datos para el grafo
 * Proporciona la información de los nodos iniciales y sus conexiones
 */

/**
 * Obtiene los nodos y conexiones iniciales para el grafo
 * @returns {Array} - Array de elementos para Cytoscape (nodos y edges)
 */
export function getInitialNodes() {
  return [
    // Nodo central (tipo texto)
    { 
      data: { 
        id: 'main', 
        label: 'Inicio',
        type: 'texto',
        content: '<h2>Bienvenido a nuestra landing page experimental</h2><p>Explora los diferentes nodos para descubrir más información.</p>'
      } 
    },
    
    // Nodos principales con diferentes tipos
    { 
      data: { 
        id: 'about', 
        label: 'Nosotros',
        type: 'texto',
        content: '<h3>Sobre Nosotros</h3><p>Somos una compañía innovadora especializada en soluciones digitales creativas y experiencias web interactivas.</p><p>Nuestro equipo está compuesto por desarrolladores, diseñadores y estrategas digitales apasionados por crear proyectos únicos.</p>'
      } 
    },
    { 
      data: { 
        id: 'services', 
        label: 'Servicios',
        type: 'imagen',
        imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=300&q=80',
        content: '<h3>Nuestros Servicios</h3><p>Ofrecemos servicios profesionales de desarrollo web, diseño y marketing digital para empresas y startups.</p>'
      } 
    },
    { 
      data: { 
        id: 'portfolio', 
        label: 'Proyectos',
        type: 'icono',
        iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3l-1 1v2h12v-2l-1-1h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H4V5h16v11z" fill="%23333"/></svg>',
        content: '<h3>Proyectos Destacados</h3><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;"><div style="background-color: #3700B3; height: 100px; display: flex; align-items: center; justify-content: center; color: white;">Proyecto 1</div><div style="background-color: #018786; height: 100px; display: flex; align-items: center; justify-content: center; color: white;">Proyecto 2</div><div style="background-color: #b00020; height: 100px; display: flex; align-items: center; justify-content: center; color: white;">Proyecto 3</div><div style="background-color: #F57C00; height: 100px; display: flex; align-items: center; justify-content: center; color: white;">Proyecto 4</div></div>'
      } 
    },
    { 
      data: { 
        id: 'contact', 
        label: 'Contacto',
        type: 'svg',
        svgUrl: 'data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z" fill="%23BB86FC"/></svg>',
        content: '<h3>Contacta con Nosotros</h3><form><div style="margin-bottom: 15px;"><label>Nombre:</label><input type="text" style="width: 100%; padding: 8px; background: #2d2d2d; border: 1px solid #666; color: white;"></div><div style="margin-bottom: 15px;"><label>Email:</label><input type="email" style="width: 100%; padding: 8px; background: #2d2d2d; border: 1px solid #666; color: white;"></div><div style="margin-bottom: 15px;"><label>Mensaje:</label><textarea style="width: 100%; padding: 8px; background: #2d2d2d; border: 1px solid #666; color: white; min-height: 100px;"></textarea></div><button type="button" style="background: #BB86FC; border: none; padding: 10px 20px; color: white; cursor: pointer;">Enviar</button></form>'
      } 
    },
    { 
      data: { 
        id: 'video', 
        label: 'Video',
        type: 'video',
        content: '<h3>Nuestro Video</h3><div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/Dto8UDHcw9I" title="Video explicativo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>'
      } 
    },
    { 
      data: { 
        id: 'boton-expandible', 
        label: 'Más información',
        type: 'boton',
        width: 150, 
        collapsed: true,
        childrenIds: ['web-dev', 'design', 'marketing'],
        content: '<h3>Información Adicional</h3><p>Haz clic en este nodo para expandir o colapsar la información relacionada.</p>'
      } 
    },
    
    // Nodos secundarios conectados al botón colapsible
    { 
      data: { 
        id: 'web-dev', 
        label: 'Web',
        type: 'texto',
        parent: 'boton-expandible',
        content: '<h3>Desarrollo Web</h3><p>Ofrecemos servicios de desarrollo web utilizando las tecnologías más modernas:</p><ul><li>JavaScript moderno (ES6+)</li><li>HTML5 y CSS3</li><li>Arquitecturas SPA</li><li>Diseño responsive</li><li>APIs y backend</li></ul>'
      } 
    },
    { 
      data: { 
        id: 'design', 
        label: 'Diseño',
        type: 'imagen',
        parent: 'boton-expandible',
        imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=300&q=80',
        content: '<h3>Diseño UX/UI</h3><div style="display: flex; flex-direction: column; gap: 10px;"><div style="background-color: #2d2d2d; padding: 15px;"><h4>Nuestro proceso de diseño</h4><ol><li>Investigación de usuarios</li><li>Wireframing</li><li>Prototipado</li><li>Diseño visual</li><li>Testing con usuarios</li></ol></div><div style="background-color: #2d2d2d; padding: 15px;"><h4>Herramientas</h4><p>Figma, Adobe XD, Sketch, Illustrator, Photoshop</p></div></div>'
      } 
    },
    { 
      data: { 
        id: 'marketing', 
        label: 'Marketing',
        type: 'grafico',
        parent: 'boton-expandible',
        content: '<h3>Marketing Digital</h3><p>Estrategias de marketing digital para potenciar tu presencia online:</p><div style="margin-top: 15px;"><div style="display: flex; align-items: center; margin-bottom: 10px;"><div style="width: 20px; height: 20px; background-color: #BB86FC; margin-right: 10px;"></div><div>SEO (40%)</div></div><div style="display: flex; align-items: center; margin-bottom: 10px;"><div style="width: 20px; height: 20px; background-color: #03DAC6; margin-right: 10px;"></div><div>SEM (25%)</div></div><div style="display: flex; align-items: center; margin-bottom: 10px;"><div style="width: 20px; height: 20px; background-color: #CF6679; margin-right: 10px;"></div><div>Social Media (20%)</div></div><div style="display: flex; align-items: center;"><div style="width: 20px; height: 20px; background-color: #FFB74D; margin-right: 10px;"></div><div>Email Marketing (15%)</div></div></div>'
      } 
    },
    
    // Conexiones entre nodos
    { data: { id: 'e-main-about', source: 'main', target: 'about' } },
    { data: { id: 'e-main-services', source: 'main', target: 'services' } },
    { data: { id: 'e-main-portfolio', source: 'main', target: 'portfolio' } },
    { data: { id: 'e-main-contact', source: 'main', target: 'contact' } },
    { data: { id: 'e-main-video', source: 'main', target: 'video' } },
    { data: { id: 'e-main-boton', source: 'main', target: 'boton-expandible' } },
    
    // Conexiones para los nodos hijos (inicialmente ocultas)
    { data: { id: 'e-boton-webdev', source: 'boton-expandible', target: 'web-dev', hidden: true } },
    { data: { id: 'e-boton-design', source: 'boton-expandible', target: 'design', hidden: true } },
    { data: { id: 'e-boton-marketing', source: 'boton-expandible', target: 'marketing', hidden: true } },
    
    // Conexiones adicionales para crear relaciones más complejas
    { data: { id: 'e-design-portfolio', source: 'design', target: 'portfolio', hidden: true } },
    { data: { id: 'e-webdev-video', source: 'web-dev', target: 'video', hidden: true } },
    { data: { id: 'e-marketing-contact', source: 'marketing', target: 'contact', hidden: true } }
  ];
}

/**
 * Genera nodos adicionales para expandir el grafo
 * @param {string} parentId - ID del nodo padre al que conectar los nuevos nodos
 * @returns {Array} - Array de nuevos elementos para añadir al grafo
 */
export function getExpandedNodes(parentId) {
  // Generar un ID único basado en el tiempo para evitar colisiones
  const timestamp = Date.now();
  
  // Crear nuevos nodos y conexiones
  return [
    { 
      data: { 
        id: `expanded-1-${timestamp}`, 
        label: 'Detalle 1',
        type: 'texto',
        content: '<h3>Información Adicional 1</h3><p>Contenido detallado relacionado con el nodo principal.</p>'
      } 
    },
    { 
      data: { 
        id: `expanded-2-${timestamp}`, 
        label: 'Detalle 2',
        type: 'imagen',
        imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=300&q=80',
        content: '<h3>Información Adicional 2</h3><div style="background-color: #2d2d2d; height: 150px; display: flex; align-items: center; justify-content: center; color: white;">Aquí iría una imagen relacionada</div>'
      } 
    },
    { 
      data: { 
        id: `expanded-3-${timestamp}`, 
        label: 'Detalle 3',
        type: 'grafico',
        content: '<h3>Información Adicional 3</h3><p>Más detalles sobre este tema específico.</p>'
      } 
    },
    // Conexiones al nodo padre
    { data: { id: `e-parent-1-${timestamp}`, source: parentId, target: `expanded-1-${timestamp}` } },
    { data: { id: `e-parent-2-${timestamp}`, source: parentId, target: `expanded-2-${timestamp}` } },
    { data: { id: `e-parent-3-${timestamp}`, source: parentId, target: `expanded-3-${timestamp}` } },
    // Conexión entre los nuevos nodos
    { data: { id: `e-exp-1-2-${timestamp}`, source: `expanded-1-${timestamp}`, target: `expanded-2-${timestamp}` } },
    { data: { id: `e-exp-2-3-${timestamp}`, source: `expanded-2-${timestamp}`, target: `expanded-3-${timestamp}` } }
  ];
}
