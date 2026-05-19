// PORTAL BODA — Chatbot de VENTAS con Neuromarketing
// Información REAL y EXACTA de servicios y precios

(function() {
  'use strict';

  // Header scroll
  let lastScroll = 0;
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 100) {
      if (currentScroll > lastScroll) {
        header.classList.add('hidden');
      } else {
        header.classList.remove('hidden');
      }
    }
    lastScroll = currentScroll;
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offset = 80;
          const targetPosition = target.offsetTop - offset;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Año dinámico
  document.getElementById('year').textContent = new Date().getFullYear();

  // Animaciones
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.pack, .servicio-card, .video-card, .m').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  // ============================================
  // CHATBOT DE VENTAS - INFORMACIÓN REAL
  // ============================================
  
  const salesBot = {
    toggle: document.getElementById('chatbot-toggle'),
    window: document.getElementById('chatbot-window'),
    close: document.getElementById('chatbot-close'),
    messages: document.getElementById('chatMessages'),
    input: document.getElementById('chatInput'),
    send: document.getElementById('chatSend'),
    quick: document.getElementById('chatQuick'),
    
    lead: {
      name: null,
      whatsapp: null,
      email: null,
      weddingDate: null,
      location: null,
      guestCount: null,
      stage: 'captura',
      interests: [],
      temperature: 'cold',
      waitingFor: 'name',
      messagesCount: 0
    },
    
    // BASE DE CONOCIMIENTO REAL DE PORTAL BODA
    knowledge: {
      about: {
        experiencia: '+300 matrimonios en 10 años',
        equipo: 'Equipo profesional especializado en matrimonios',
        cobertura: 'Santiago y alrededores, Valparaíso (Algarrobo, El Quisco, Las Cruces), O\'Higgins (Rancagua, San Francisco de Mostazal). Buin y Camino Lonquén son considerados dentro de Santiago.',
        horario: 'Servicios hasta las 2:00 AM',
        entrega: '30-40 días hábiles aproximadamente'
      },
      
      servicios: {
        fotografia: {
          nombre: 'Fotografía de Matrimonio',
          precio: 650000,
          descripcion: 'Desde los preparativos de la novia hasta la fiesta',
          horario: 'Hasta las 2:00 AM',
          entrega: '30-40 días hábiles aprox',
          incluye: [
            'Cobertura completa del día',
            'Preparativos de la novia',
            'Ceremonia',
            'Cóctel',
            'Fiesta hasta las 2:00 AM',
            'Fotos editadas profesionales'
          ]
        },
        
        video: {
          nombre: 'Video Profesional con Drone',
          precio: 789000,
          descripcion: 'Video cinematográfico con estabilizador de imagen',
          incluye: [
            'Video resumen de 35 min aprox',
            'Reel corto para redes sociales',
            'Tomas aéreas con Drone',
            'Estabilizador de imagen para tomas cinematográficas',
            'Edición profesional'
          ],
          conversable: true,
          entrega: '30-40 días hábiles aprox',
          nota: 'Todo conversable, nos ajustamos a sus necesidades'
        },
        
        civil: {
          nombre: 'Fotografía Civil + Sesión Fotográfica',
          precio_normal: 129000,
          precio_con_servicios: 99000,
          duracion: '2 horas',
          condicion: 'Si contratas servicios adicionales (espejo, cabina, 360) y haces reserva de $90.000, el civil queda en $99.000'
        },
        
        espejo: {
          nombre: 'Espejo Mágico',
          precio: 220000,
          duracion: '2 horas',
          incluye: [
            'Espejo interactivo',
            'Impresiones ilimitadas',
            'Libro de recuerdos (se entrega esa misma noche)',
            'Props y accesorios',
            'Operador profesional'
          ]
        },
        
        cabina: {
          nombre: 'Cabina Fotográfica',
          precio: 210000,
          duracion: '2 horas',
          incluye: [
            'Cabina profesional',
            'Impresiones ilimitadas',
            'Props y accesorios',
            'Fondos personalizables',
            'Operador'
          ]
        },
        
        camara360: {
          nombre: 'Cámara 360°',
          precio: 210000,
          duracion: '2 horas',
          descripcion: 'Videos con efectos y musicalizados',
          ubicacion: 'Puede ir en el cóctel o en la fiesta',
          incluye: [
            'Videos 360° con efectos',
            'Descarga inmediata al celular',
            'Musicalización',
            'Operador profesional'
          ],
          nota: 'Una experiencia entretenida para sus invitados'
        },
        
        glitterbar: {
          nombre: 'Glitter Bar',
          precio: 189000,
          duracion: '2 horas',
          capacidad: 'Hasta 100 invitados',
          incluye: [
            'Maquilladora profesional',
            'Todos los implementos necesarios',
            'Glitter de colores',
            'Espejos',
            'Mesa decorada'
          ],
          nota: 'Si va solo (sin foto/video) se suma costo de movilización'
        },
        
        zonagamer: {
          nombre: 'Zona Gamer Kids',
          precio: 229000,
          duracion: 'A partir de 3 horas',
          descripcion: 'Espacio delimitado solo para niños',
          incluye: [
            'Dos PlayStation',
            'Dos pantallas de 55"',
            'Puff de colores',
            'Alfombra',
            'Monitores'
          ],
          beneficio: 'Los adultos se entretienen mientras los niños juegan'
        },
        
        estudiofoto: {
          nombre: 'Estudio Fotográfico',
          descripcion: 'Fotos grandes en color o blanco y negro',
          opciones: 'Con o sin impresión inmediata',
          diferencia: 'Más allá del espejo mágico o cabina, es una experiencia divertida entretenida para todos',
          nota: 'No son solo fotos, es una experiencia'
        },
        
        postboda: {
          nombre: 'Postboda en Algarrobo',
          descripcion: 'Sesión fotográfica en las playas de Algarrobo',
          ubicacion: 'Algarrobo y litoral central (El Quisco, Isla Negra, Cartagena)',
          puede_contratarse: 'Por separado o incluida en packs',
          nota: 'Experiencia única en la playa'
        }
      },
      
      precios: {
        reserva: {
          monto: 90000,
          descripcion: 'Reserva única para todos los servicios',
          nota: 'Vale $90.000 sea un servicio solo o un pack completo',
          link_mercadopago: 'https://mpago.li/2vfXQyT',
          comision_mp: 2459,
          cuotas_mp: '3 cuotas sin interés',
          formas_pago: [
            'MercadoPago: Tarjeta crédito/débito (comisión $2.459, hasta 3 cuotas sin interés)',
            'Transferencia bancaria: $90.000 reserva, luego 50% un mes antes + 50% día del matrimonio por la mañana'
          ],
          proceso_transferencia: 'Reserva $90.000 → 50% un mes antes del matrimonio → 50% hasta el mismo día del matrimonio por la mañana (no después por respeto a los novios y trabajadores)',
          despues_reserva: 'Videollamada de 1.5 hrs aprox para analizar estructura y horarios del matrimonio',
          contrato: 'Realizamos contrato si así lo requieren'
        },
        
        hora_extra: {
          precio: 70000,
          condicion: 'Por servicio, por hora',
          pago: 'Se debe pagar en el momento',
          nota: 'Después de las 2:00 AM'
        },
        
        book_premium: {
          precio: 129000,
          descripcion: 'Book fotográfico premium (diferente al librito del espejo mágico)',
          nota: 'Puede crearse aparte fuera del pack'
        },
        
        fuera_santiago: {
          descripcion: 'Fuera de Santiago: mismos valores + alojamiento, comida, peajes, tags, bencina por presupuestar',
          cobertura_principal: 'Comunas de Santiago (incluye Buin y Camino Lonquén)',
          quinta_region: 'Algarrobo, El Quisco, Las Cruces',
          ohiggins: 'Rancagua, San Francisco de Mostazal y alrededores'
        },
        
        descuentos: {
          dos_servicios: '2% de descuento',
          tres_servicios: '3% de descuento',
          condicion: 'Siempre y cuando se contrate fotografía o video',
          nota: 'El descuento aumenta con cada servicio adicional'
        }
      },
      
      ventajas: [
        '+300 matrimonios en 10 años de experiencia',
        'Un solo proveedor para múltiples servicios',
        'Dirección audiovisual unificada',
        'Postboda en playas de Algarrobo disponible',
        'Descuentos por contratar múltiples servicios',
        'Flexibilidad total - arma tu pack personalizado',
        'Servicios hasta las 2:00 AM',
        'Un solo matrimonio por fecha (atención 100% dedicada)'
      ],
      
      urgencia: [
        'Solo aceptamos 1 matrimonio por fecha',
        'Las fechas de 2026 se están reservando rápido',
        'Cada día más parejas consultan disponibilidad'
      ]
    },
    
    // ============================================
    // DETECCIÓN INTELIGENTE - CHATBOT ÁGIL
    // ============================================
    
    detectIntentAndData(text) {
      const textLower = text.toLowerCase();
      const intent = {
        action: null,
        fecha: null,
        invitados: null,
        servicio: null,
        hasWhatsApp: false,
        hasEmail: false
      };
      
      // Detectar acción principal
      if (/reservar|agendar|contratar|quiero|necesito.*para/.test(textLower)) {
        intent.action = 'reservar';
      } else if (/cuánto|cuanto|precio|costo|cotizar|vale|cobran/.test(textLower)) {
        intent.action = 'cotizar';
      }
      
      // Detectar fecha (múltiples formatos)
      const fechaPatterns = [
        /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/,  // 15/12/2026
        /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|sep[tiembre]*|oct[ubre]*|nov[iembre]*|dic[iembre]*)\s*(de\s*)?(\d{4})/i,  // marzo 2027
        /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|sep[tiembre]*|oct[ubre]*|nov[iembre]*|dic[iembre]*)/i,  // marzo
        /(2026|2027|2028)/  // solo año
      ];
      
      for (let pattern of fechaPatterns) {
        const match = text.match(pattern);
        if (match) {
          intent.fecha = match[0];
          break;
        }
      }
      
      // Detectar número de invitados
      const invitadosMatch = text.match(/(\d+)\s*(personas|invitados|gente|pax)/i);
      if (invitadosMatch) {
        intent.invitados = invitadosMatch[1];
      }
      
      // Detectar servicio específico
      if (/foto|fotógrafo|fotografía/.test(textLower)) intent.servicio = 'fotografia';
      if (/video/.test(textLower)) intent.servicio = 'video';
      if (/postboda|post boda/.test(textLower)) intent.servicio = 'postboda';
      if (/pack|paquete|todo|completo/.test(textLower)) intent.servicio = 'pack';
      if (/espejo/.test(textLower)) intent.servicio = 'espejo';
      if (/cabina/.test(textLower)) intent.servicio = 'cabina';
      
      // Detectar WhatsApp
      if (/\+?56\s*9\s*\d{8}|9\d{8}/.test(text)) {
        intent.hasWhatsApp = true;
      }
      
      // Detectar Email
      if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) {
        intent.hasEmail = true;
      }
      
      return intent;
    },
    
    // Flujo rápido cuando detecta intención clara
    fastTrack(intent, originalText) {
      // CASO 1: Quiere reservar + tiene fecha
      if (intent.action === 'reservar' && intent.fecha) {
        this.lead.weddingDate = intent.fecha;
        if (intent.invitados) this.lead.guestCount = intent.invitados;
        
        // Si ya tiene WhatsApp en el mensaje
        if (intent.hasWhatsApp) {
          const whatsappMatch = originalText.match(/(\+?56\s*9\s*\d{8}|9\d{8})/);
          if (whatsappMatch) {
            const cleaned = whatsappMatch[0].replace(/\s/g, '').replace(/\+/g, '');
            this.lead.whatsapp = cleaned.startsWith('56') ? '+' + cleaned : '+56' + cleaned;
            
            // Pedir solo email y cerrar
            this.addBotMessage(
              `¡Perfecto! Quieres reservar para ${intent.fecha}. Solo necesito tu email para confirmarte todo.`
            );
            this.lead.stage = 'captura';
            this.lead.waitingFor = 'email';
            this.lead.temperature = 'hot';
            return true;
          }
        }
        
        // Pedir WhatsApp rápido
        this.addBotMessage(
          `¡Excelente! Quieres reservar para ${intent.fecha} 🎉\n\n` +
          `Para confirmarte disponibilidad al instante, dame tu WhatsApp (Ej: +56912345678)`
        );
        this.lead.stage = 'captura';
        this.lead.waitingFor = 'whatsapp';
        this.lead.temperature = 'hot';
        return true;
      }
      
      // CASO 2: Quiere cotizar servicio específico
      if (intent.action === 'cotizar' && intent.servicio) {
        this.addBotMessage(
          `¡Claro! Te cuento sobre ${this.getServiceName(intent.servicio)}.\n\n` +
          `Para darte una cotización personalizada, necesito tu nombre y WhatsApp.`
        );
        this.lead.interests.push(intent.servicio);
        this.lead.stage = 'captura';
        this.lead.waitingFor = 'name';
        this.lead.temperature = 'warm';
        return true;
      }
      
      // CASO 3: Solo tiene fecha (sin acción clara)
      if (intent.fecha) {
        this.lead.weddingDate = intent.fecha;
        this.addBotMessage(
          `Perfecto, para ${intent.fecha}. ¿Cuál es tu nombre?`
        );
        this.lead.stage = 'captura';
        this.lead.waitingFor = 'name';
        this.lead.temperature = 'warm';
        return true;
      }
      
      return false;  // No se detectó intención clara, seguir flujo normal
    },
    
    getServiceName(service) {
      const names = {
        'fotografia': 'Fotografía de Matrimonio',
        'video': 'Video Profesional con Drone',
        'postboda': 'Postboda en Algarrobo',
        'pack': 'nuestros Packs personalizados',
        'espejo': 'Espejo Mágico',
        'cabina': 'Cabina Fotográfica'
      };
      return names[service] || 'nuestros servicios';
    },
    
    // ============================================
    // INICIALIZACIÓN
    // ============================================
    
    init() {
      this.toggle.addEventListener('click', () => this.open());
      this.close.addEventListener('click', () => this.closeChat());
      this.send.addEventListener('click', () => this.handleUserMessage());
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleUserMessage();
      });
      
      this.quick.style.display = 'none';
      this.loadLead();
      
      if (!this.lead.name) {
        this.startCaptureFlow();
      } else {
        this.welcomeBack();
      }
    },
    
    startCaptureFlow() {
      this.addBotMessage(
        `¡Hola! 👋 Soy el asistente virtual de Portal Boda.\n\n` +
        `Llevamos +300 matrimonios en 10 años haciendo realidad los días más especiales de parejas en todo Chile.\n\n` +
        `Me encantaría conocerte para entender exactamente lo que sueñan para su día y mostrarte cómo podemos ayudarlos.\n\n` +
        `¿Cuál es tu nombre?`
      );
      this.lead.waitingFor = 'name';
      this.lead.stage = 'captura';
    },
    
    welcomeBack() {
      this.addBotMessage(
        `¡Hola de nuevo, ${this.lead.name}! 😊\n\n` +
        `Qué bueno verte por aquí otra vez. ¿En qué puedo ayudarte hoy?`
      );
      this.lead.stage = 'interés';
      this.lead.temperature = 'warm';
      this.quick.innerHTML = `
        <button onclick="salesBot.showAllServices()">Ver todos los servicios</button>
        <button onclick="salesBot.explainPacks()">¿Cómo funcionan los packs?</button>
        <button onclick="salesBot.checkAvailability()">Verificar disponibilidad</button>
      `;
      this.quick.style.display = 'flex';
    },
    
    // ============================================
    // MANEJO DE MENSAJES
    // ============================================
    
    handleUserMessage() {
      const text = this.input.value.trim();
      if (!text) return;
      
      this.addUserMessage(text);
      this.input.value = '';
      this.lead.messagesCount++;
      
      setTimeout(() => {
        this.processUserMessage(text);
      }, 800);
    },
    
    processUserMessage(text) {
      const textLower = text.toLowerCase();
      
      // DETECCIÓN INTELIGENTE en el primer mensaje real
      if (this.lead.messagesCount === 1 && this.lead.stage === 'captura' && this.lead.waitingFor === 'name') {
        const intent = this.detectIntentAndData(text);
        const fastTracked = this.fastTrack(intent, text);
        
        if (fastTracked) {
          return;  // Ya manejado por fastTrack
        }
        // Si no se detectó intención clara, continuar con flujo normal
      }
      
      if (this.lead.stage === 'captura') {
        this.handleCaptureFlow(text, textLower);
        return;
      }
      
      if (this.lead.stage === 'calificación') {
        this.handleQualificationFlow(text, textLower);
        return;
      }
      
      // Detectar preguntas sobre servicios específicos
      if (textLower.includes('fotografía') || textLower.includes('fotografia') || textLower.includes('fotos')) {
        this.explainFotografia();
        return;
      }
      
      if (textLower.includes('video') || textLower.includes('drone')) {
        this.explainVideo();
        return;
      }
      
      if (textLower.includes('espejo')) {
        this.explainEspejo();
        return;
      }
      
      if (textLower.includes('cabina')) {
        this.explainCabina();
        return;
      }
      
      if (textLower.includes('360') || textLower.includes('cámara') || textLower.includes('camara')) {
        this.explainCamara360();
        return;
      }
      
      if (textLower.includes('glitter')) {
        this.explainGlitter();
        return;
      }
      
      if (textLower.includes('gamer') || textLower.includes('niños') || textLower.includes('ninos') || textLower.includes('kids')) {
        this.explainZonaGamer();
        return;
      }
      
      if (textLower.includes('postboda') || textLower.includes('algarrobo') || textLower.includes('playa')) {
        this.explainPostboda();
        return;
      }
      
      if (textLower.includes('civil')) {
        this.explainCivil();
        return;
      }
      
      if (textLower.includes('precio') || textLower.includes('costo') || textLower.includes('cuánto') || textLower.includes('cuanto') || textLower.includes('valor')) {
        this.explainPricing();
        return;
      }
      
      if (textLower.includes('descuento')) {
        this.explainDescuentos();
        return;
      }
      
      if (textLower.includes('pack')) {
        this.explainPacks();
        return;
      }
      
      if (this.detectBuyingIntent(textLower)) {
        this.lead.temperature = 'hot';
        this.moveToClosing(textLower);
        return;
      }
      
      if (this.detectObjection(textLower)) {
        this.handleObjection(textLower);
        return;
      }
      
      this.handleGeneralQuery(textLower);
    },
    
    // ============================================
    // FLUJO DE CAPTURA
    // ============================================
    
    handleCaptureFlow(text, textLower) {
      const waiting = this.lead.waitingFor;
      
      if (waiting === 'name') {
        this.lead.name = text;
        this.saveLead();
        this.addBotMessage(
          `Un gusto conocerte, ${text} 😊\n\n` +
          `Para poder enviarte información personalizada y coordinar todo, necesito tu número de WhatsApp.\n\n` +
          `¿Me lo compartes? (Ej: +56912345678 o 912345678)`
        );
        this.lead.waitingFor = 'whatsapp';
        
      } else if (waiting === 'whatsapp') {
        const cleaned = text.replace(/\s/g, '').replace(/\+/g, '');
        if (/^56\d{9}$/.test(cleaned) || /^9\d{8}$/.test(cleaned)) {
          this.lead.whatsapp = cleaned.startsWith('56') ? '+' + cleaned : '+56' + cleaned;
          this.saveLead();
          this.addBotMessage(
            `Perfecto 👍\n\n` +
            `Y para enviarte material visual (fotos y videos de matrimonios reales), ¿cuál es tu correo electrónico?`
          );
          this.lead.waitingFor = 'email';
        } else {
          this.addBotMessage(
            `Parece que el número no es válido 😅\n\n` +
            `Escríbelo nuevamente por favor (Ej: +56912345678 o 912345678)`
          );
        }
        
      } else if (waiting === 'email') {
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
          this.lead.email = text.toLowerCase();
          this.saveLead();
          
          this.lead.stage = 'calificación';
          this.lead.waitingFor = 'wedding_date';
          this.lead.temperature = 'warm';
          
          this.addBotMessage(
            `¡Excelente! Ya tengo todo para ayudarte de la mejor forma 🎉\n\n` +
            `Ahora cuéntame, ${this.lead.name}, ¿para cuándo es el gran día? 💍\n\n` +
            `(Mes y año, o fecha exacta si ya la tienen)`
          );
        } else {
          this.addBotMessage(
            `El correo no parece válido 😅 Escríbelo de nuevo por favor (Ej: nombre@correo.com)`
          );
        }
      }
    },
    
    // ============================================
    // FLUJO DE CALIFICACIÓN
    // ============================================
    
    handleQualificationFlow(text, textLower) {
      const waiting = this.lead.waitingFor;
      
      if (waiting === 'wedding_date') {
        this.lead.weddingDate = text;
        this.saveLead();
        
        const urgency = this.knowledge.urgencia[Math.floor(Math.random() * this.knowledge.urgencia.length)];
        
        this.addBotMessage(
          `📅 ${text}... ¡Anotado!\n\n` +
          `⚠️ ${urgency}\n\n` +
          `Y díme, ¿dónde piensan celebrarlo? (Comuna o lugar aproximado)`
        );
        this.lead.waitingFor = 'location';
        
      } else if (waiting === 'location') {
        this.lead.location = text;
        this.saveLead();
        
        this.addBotMessage(
          `Perfecto, ${text} es una linda zona 😊\n\n` +
          `Cuéntame, ¿cuántos invitados esperan aproximadamente?`
        );
        this.lead.waitingFor = 'guests';
        
      } else if (waiting === 'guests') {
        this.lead.guestCount = text;
        this.saveLead();
        
        this.lead.stage = 'interés';
        this.lead.temperature = 'hot';
        this.lead.waitingFor = null;
        
        this.presentValueProposition();
      }
    },
    
    // ============================================
    // PRESENTACIÓN DE VALOR
    // ============================================
    
    presentValueProposition() {
      const name = this.lead.name;
      
      this.addBotMessage(
        `${name}, déjame contarte por qué Portal Boda es diferente:\n\n` +
        `🎬 Llevamos +300 matrimonios en 10 AÑOS documentando los días más especiales de Chile\n\n` +
        `🎯 Puedes contratar servicios individuales O armar tu pack personalizado:\n\n` +
        `📸 Fotografía profesional\n` +
        `🎥 Video cinematográfico + Drone\n` +
        `🏖️ Postboda en Algarrobo\n` +
        `✨ Espejo Mágico\n` +
        `📷 Cabina Fotográfica\n` +
        `🎬 Cámara 360°\n` +
        `💫 Glitter Bar\n` +
        `🎮 Zona Gamer Kids\n\n` +
        `✨ Y lo mejor:\n` +
        `→ Descuentos al contratar múltiples servicios\n` +
        `→ Un solo proveedor coordina todo\n` +
        `→ MENOS estrés para ti`
      );
      
      setTimeout(() => {
        this.addBotMessage(
          `${name}, cuéntame:\n\n` +
          `¿Ya tienes una idea de qué servicios te interesan o prefieres que te asesore según lo que sueñan?`
        );
        
        this.quick.innerHTML = `
          <button onclick="salesBot.showAllServices()">Ver todos los servicios</button>
          <button onclick="salesBot.explainPacks()">¿Cómo armo un pack?</button>
          <button onclick="salesBot.getRecommendation()">Asesórame</button>
        `;
        this.quick.style.display = 'flex';
      }, 3000);
    },
    
    // ============================================
    // EXPLICACIÓN DE SERVICIOS
    // ============================================
    
    showAllServices() {
      const s = this.knowledge.servicios;
      this.addBotMessage(
        `${this.lead.name}, estos son todos nuestros servicios:\n\n` +
        `📸 **Fotografía de Matrimonio** - $650.000 + IVA\n` +
        `   Desde preparativos hasta las 2:00 AM\n\n` +
        `🎥 **Video Profesional + Drone** - $789.000 + IVA\n` +
        `   Video resumen + reel para redes (conversable)\n\n` +
        `📸 **Civil + Sesión** - $129.000 + IVA (2 hrs)\n` +
        `   $99.000 + IVA si contratas más servicios\n\n` +
        `✨ **Espejo Mágico** - $220.000 + IVA (2 hrs)\n` +
        `   Libro de recuerdos entregado esa noche\n\n` +
        `📷 **Cabina Fotográfica** - $210.000 + IVA (2 hrs)\n\n` +
        `🎬 **Cámara 360°** - $210.000 + IVA (2 hrs)\n` +
        `   Videos descargables al instante\n\n` +
        `💫 **Glitter Bar** - $189.000 + IVA (2 hrs)\n` +
        `   Con maquilladora para 100 invitados\n\n` +
        `🎮 **Zona Gamer Kids** - $229.000 + IVA (desde 3 hrs)\n` +
        `   2 PlayStation + pantallas de 55"\n\n` +
        `🏖️ **Postboda en Algarrobo**\n` +
        `   Puede contratarse por separado\n\n` +
        `💡 ¿Te interesa alguno en particular?`
      );
      
      this.quick.innerHTML = `
        <button onclick="salesBot.explainPacks()">¿Cómo armo un pack?</button>
        <button onclick="salesBot.explainDescuentos()">Ver descuentos</button>
        <button onclick="salesBot.moveToReservation()">Quiero reservar</button>
      `;
      this.quick.style.display = 'flex';
    },
    
    explainFotografia() {
      const s = this.knowledge.servicios.fotografia;
      this.addBotMessage(
        `📸 **Fotografía de Matrimonio** - $${s.precio.toLocaleString()} + IVA\n\n` +
        `${s.descripcion}\n\n` +
        `Incluye:\n` +
        s.incluye.map(i => `✓ ${i}`).join('\n') +
        `\n\n⏰ Horario: ${s.horario}\n` +
        `📦 Entrega: ${s.entrega}\n\n` +
        `¿Te gustaría cotizar este servicio o combinarlo con otros?`
      );
    },
    
    explainVideo() {
      const s = this.knowledge.servicios.video;
      this.addBotMessage(
        `🎥 **Video Profesional con Drone** - $${s.precio.toLocaleString()} + IVA\n\n` +
        `${s.descripcion}\n\n` +
        `Incluye:\n` +
        s.incluye.map(i => `✓ ${i}`).join('\n') +
        `\n\n📦 Entrega: ${s.entrega}\n` +
        `💡 ${s.nota}\n\n` +
        `El video es conversable - nos ajustamos a lo que necesites.\n\n` +
        `¿Quieres que te prepare una cotización personalizada?`
      );
    },
    
    explainEspejo() {
      const s = this.knowledge.servicios.espejo;
      this.addBotMessage(
        `✨ **Espejo Mágico** - $${s.precio.toLocaleString()} + IVA\n\n` +
        `Duración: ${s.duracion}\n\n` +
        `Incluye:\n` +
        s.incluye.map(i => `✓ ${i}`).join('\n') +
        `\n\n🎁 El libro de recuerdos se entrega ESA MISMA NOCHE.\n\n` +
        `Es uno de los servicios más populares - ¡a todos les encanta!\n\n` +
        `¿Te gustaría agregarlo a tu cotización?`
      );
    },
    
    explainCabina() {
      const s = this.knowledge.servicios.cabina;
      this.addBotMessage(
        `📷 **Cabina Fotográfica** - $${s.precio.toLocaleString()} + IVA\n\n` +
        `Duración: ${s.duracion}\n\n` +
        `Incluye:\n` +
        s.incluye.map(i => `✓ ${i}`).join('\n') +
        `\n\n¿Te interesa para tu matrimonio?`
      );
    },
    
    explainCamara360() {
      const s = this.knowledge.servicios.camara360;
      this.addBotMessage(
        `🎬 **Cámara 360°** - $${s.precio.toLocaleString()} + IVA\n\n` +
        `Duración: ${s.duracion}\n\n` +
        `${s.descripcion}\n\n` +
        `📍 ${s.ubicacion}\n\n` +
        `Incluye:\n` +
        s.incluye.map(i => `✓ ${i}`).join('\n') +
        `\n\n💡 ${s.nota}\n\n` +
        `¿La incluimos en tu cotización?`
      );
    },
    
    explainGlitter() {
      const s = this.knowledge.servicios.glitterbar;
      this.addBotMessage(
        `💫 **Glitter Bar** - $${s.precio.toLocaleString()} + IVA\n\n` +
        `Duración: ${s.duracion}\n` +
        `Capacidad: ${s.capacidad}\n\n` +
        `Incluye:\n` +
        s.incluye.map(i => `✓ ${i}`).join('\n') +
        `\n\n⚠️ ${s.nota}\n\n` +
        `¿Te gustaría agregarlo?`
      );
    },
    
    explainZonaGamer() {
      const s = this.knowledge.servicios.zonagamer;
      this.addBotMessage(
        `🎮 **Zona Gamer Kids** - $${s.precio.toLocaleString()} + IVA\n\n` +
        `Duración: ${s.duracion}\n\n` +
        `${s.descripcion}\n\n` +
        `Incluye:\n` +
        s.incluye.map(i => `✓ ${i}`).join('\n') +
        `\n\n✨ ${s.beneficio}\n\n` +
        `Perfecto si hay muchos niños en el matrimonio 😊\n\n` +
        `¿Te interesa?`
      );
    },
    
    explainPostboda() {
      const s = this.knowledge.servicios.postboda;
      this.addBotMessage(
        `🏖️ **Postboda en Algarrobo**\n\n` +
        `${s.descripcion}\n\n` +
        `📍 ${s.ubicacion}\n\n` +
        `💡 ${s.puede_contratarse}\n\n` +
        `${s.nota}\n\n` +
        `¿Quieres incluirla en tu cotización?`
      );
    },
    
    explainCivil() {
      const s = this.knowledge.servicios.civil;
      this.addBotMessage(
        `💍 **Fotografía Civil + Sesión Fotográfica**\n\n` +
        `Precio normal: $${s.precio_normal.toLocaleString()} + IVA\n` +
        `Duración: ${s.duracion}\n\n` +
        `✨ OFERTA ESPECIAL:\n` +
        `Si contratas servicios adicionales (espejo, cabina, 360) y haces la reserva de $90.000, el civil queda en:\n\n` +
        `🎉 $${s.precio_con_servicios.toLocaleString()} + IVA\n\n` +
        `¿Te interesa el civil junto con otros servicios?`
      );
    },
    
    // ============================================
    // EXPLICACIÓN DE PACKS Y DESCUENTOS
    // ============================================
    
    explainPacks() {
      this.addBotMessage(
        `${this.lead.name}, así funcionan los packs:\n\n` +
        `🎯 Puedes contratar TODO o solo lo que quieras\n\n` +
        `💰 DESCUENTOS al combinar:\n` +
        `• 2 servicios = 2% descuento\n` +
        `• 3 servicios = 3% descuento\n` +
        `• Y así sucesivamente\n\n` +
        `⚠️ Condición: Debes contratar fotografía O video\n\n` +
        `📝 RESERVA ÚNICA:\n` +
        `Sea un solo servicio o un pack completo, la reserva es de $90.000\n\n` +
        `Ejemplo de pack popular:\n` +
        `📸 Fotografía + 🎥 Video + ✨ Espejo Mágico + 🏖️ Postboda\n` +
        `= 4 servicios = 4% descuento\n\n` +
        `¿Te gustaría que armemos un pack personalizado para ti?`
      );
      
      this.quick.innerHTML = `
        <button onclick="salesBot.getRecommendation()">Sí, armemos un pack</button>
        <button onclick="salesBot.explainPricing()">Ver precios detallados</button>
      `;
      this.quick.style.display = 'flex';
    },
    
    explainDescuentos() {
      const d = this.knowledge.precios.descuentos;
      this.addBotMessage(
        `💰 **Sistema de Descuentos**\n\n` +
        `${d.dos_servicios} si contratas 2 servicios\n` +
        `${d.tres_servicios} si contratas 3 servicios\n` +
        `Y así sucesivamente...\n\n` +
        `⚠️ ${d.condicion}\n\n` +
        `💡 ${d.nota}\n\n` +
        `Mientras más servicios, más ahorras 😊\n\n` +
        `¿Quieres que calculemos tu descuento según lo que te interesa?`
      );
    },
    
    explainPricing() {
      this.addBotMessage(
        `${this.lead.name}, te explico el sistema de precios:\n\n` +
        `💵 **RESERVA:** $90.000\n` +
        `   (Para uno o varios servicios)\n\n` +
        `⏰ **HORA EXTRA:** $70.000 + IVA por servicio\n` +
        `   (Después de las 2:00 AM, pago en el momento)\n\n` +
        `📦 **ENTREGA:**\n` +
        `   Foto/Video: 30-40 días hábiles\n` +
        `   Libro espejo: La misma noche\n\n` +
        `💳 **FORMAS DE PAGO:**\n` +
        `   • Tarjeta (1-3 cuotas sin interés)\n` +
        `   • Transferencia (50% + 50%)\n\n` +
        `⚠️ Todos los precios llevan IVA adicional\n\n` +
        `¿Quieres que te prepare una cotización con los servicios que te interesan?`
      );
      
      this.quick.innerHTML = `
        <button onclick="salesBot.getRecommendation()">Sí, cotízame</button>
        <button onclick="salesBot.checkAvailability()">Verificar disponibilidad</button>
      `;
      this.quick.style.display = 'flex';
    },
    
    // ============================================
    // RECOMENDACIÓN Y CIERRE
    // ============================================
    
    getRecommendation() {
      const guests = parseInt(this.lead.guestCount) || 100;
      
      this.addBotMessage(
        `Perfecto, ${this.lead.name}. Basándome en:\n` +
        `• ${this.lead.guestCount} invitados\n` +
        `• Ubicación: ${this.lead.location}\n` +
        `• Fecha: ${this.lead.weddingDate}\n\n` +
        `Te recomiendo empezar con:\n\n` +
        `📦 **Pack Base:**\n` +
        `📸 Fotografía de Matrimonio\n` +
        `🎥 Video Profesional + Drone\n` +
        `🏖️ Postboda en Algarrobo\n\n` +
        `Y según tus invitados, te sugiero agregar:\n` +
        `${guests > 80 ? '✨ Espejo Mágico (muy popular)' : ''}\n` +
        `${guests > 30 ? '🎮 Zona Gamer Kids (si hay niños)' : ''}\n\n` +
        `Con este pack tendrías un ${this.calculateDiscount(3)}% de descuento.\n\n` +
        `¿Te gustaría ajustar algo o verificamos disponibilidad para ${this.lead.weddingDate}?`
      );
      
      this.quick.innerHTML = `
        <button onclick="salesBot.checkAvailability()">Verificar disponibilidad</button>
        <button onclick="salesBot.showAllServices()">Ver más servicios</button>
      `;
      this.quick.style.display = 'flex';
    },
    
    calculateDiscount(numServices) {
      return numServices;
    },
    
    // ============================================
    // VERIFICACIÓN Y CIERRE
    // ============================================
    
    checkAvailability() {
      this.addBotMessage(
        `Perfecto ${this.lead.name}, estoy verificando disponibilidad para ${this.lead.weddingDate}...\n\n` +
        `⏳ (dame 2 segundos)`
      );
      
      setTimeout(() => {
        this.addBotMessage(
          `✅ ¡EXCELENTE NOTICIA!\n\n` +
          `La fecha ${this.lead.weddingDate} aparece disponible en nuestro sistema.\n\n` +
          `⚠️ IMPORTANTE: ${this.knowledge.urgencia[1]}\n\n` +
          `El que reserva PRIMERO (y confirma el pago), se queda con la fecha.\n\n` +
          `📱 **Para confirmar disponibilidad 100% y reservar:**\n\n` +
          `Escríbenos por WhatsApp al **+56 9 4066 2286** indicando:\n` +
          `• Tu nombre: ${this.lead.name}\n` +
          `• Fecha: ${this.lead.weddingDate}\n` +
          `• Servicios de interés\n\n` +
          `Te confirmamos al instante si está libre y te damos el OK para pagar.\n\n` +
          `💰 La reserva es de $90.000 (sea un servicio o varios)\n\n` +
          `¿Quieres que te explique las opciones de pago ahora?`
        );
        
        this.quick.innerHTML = `
          <button onclick="salesBot.sendPaymentLink()">Sí, opciones de pago</button>
          <button onclick="salesBot.askMoreQuestions()">Tengo dudas antes</button>
        `;
        this.quick.style.display = 'flex';
        
        this.lead.temperature = 'burning';
      }, 2000);
    },
    
    sendPaymentLink() {
      this.addBotMessage(
        `🎉 ¡EXCELENTE DECISIÓN, ${this.lead.name}!\n\n` +
        `⚠️ **PASO IMPORTANTE ANTES DE PAGAR:**\n\n` +
        `📱 Debes contactarnos por WhatsApp al **+56 9 4066 2286** ANTES de realizar la reserva.\n\n` +
        `📋 Al escribirnos, indica:\n` +
        `1️⃣ Tu nombre: ${this.lead.name}\n` +
        `2️⃣ Fecha que quieres reservar: ${this.lead.weddingDate}\n` +
        `3️⃣ Servicios de interés\n\n` +
        `✅ Confirmamos disponibilidad\n` +
        `✅ Te damos el OK para pagar\n` +
        `✅ Una vez que pagues, envías el voucher por el mismo WhatsApp\n\n` +
        `💰 **RESERVA: $90.000**\n\n` +
        `Tienes 2 opciones de pago:\n\n` +
        `**OPCIÓN 1: MercadoPago** 💳\n` +
        `✓ Pago inmediato con tarjeta\n` +
        `✓ Hasta 3 cuotas sin interés\n` +
        `✗ Comisión de $2.459 (la cobra MercadoPago)\n` +
        `Total: $92.459\n\n` +
        `**OPCIÓN 2: Transferencia Bancaria** 🏦\n` +
        `✓ Sin comisiones\n` +
        `✓ Pago: $90.000 reserva → 50% un mes antes → 50% día del matrimonio por la mañana\n` +
        `Total: $90.000\n\n` +
        `¿Cuál prefieres? (Recuerda: primero escríbenos al +56 9 4066 2286)`
      );
      
      this.quick.innerHTML = `
        <button onclick="salesBot.sendMercadoPagoLink()">💳 MercadoPago ($92.459)</button>
        <button onclick="salesBot.sendTransferenciaInfo()">🏦 Transferencia ($90.000)</button>
      `;
      this.quick.style.display = 'flex';
    },
    
    sendMercadoPagoLink() {
      const mpLink = this.knowledge.precios.reserva.link_mercadopago;
      
      this.addBotMessage(
        `✅ Perfecto, ${this.lead.name}!\n\n` +
        `Te envío el link de MercadoPago por WhatsApp al ${this.lead.whatsapp}\n\n` +
        `💳 **Link de pago:** ${mpLink}\n\n` +
        `💰 Total: $92.459 (incluye comisión MercadoPago)\n` +
        `✓ Hasta 3 cuotas sin interés\n\n` +
        `Una vez que completes el pago, tu fecha ${this.lead.weddingDate} queda 100% BLOQUEADA.\n\n` +
        `📅 **Siguiente paso:** Agendamos videollamada de 1.5 hrs para analizar toda la estructura y horarios de tu matrimonio.\n\n` +
        `¿Confirmas que procedemos con MercadoPago?`
      );
      
      this.quick.innerHTML = `
        <button onclick="salesBot.confirmMercadoPago()">Sí, enviar link MercadoPago</button>
        <button onclick="salesBot.sendTransferenciaInfo()">Cambiar a Transferencia</button>
      `;
      this.quick.style.display = 'flex';
    },
    
    confirmMercadoPago() {
      const mpLink = this.knowledge.precios.reserva.link_mercadopago;
      
      this.addBotMessage(
        `✅ ¡PERFECTO!\n\n` +
        `🔗 **Link de MercadoPago:** ${mpLink}\n\n` +
        `📱 **RECORDATORIO IMPORTANTE:**\n\n` +
        `1️⃣ **PRIMERO:** Escribe al WhatsApp **+56 9 4066 2286**\n` +
        `   Mensaje: "Hola, soy ${this.lead.name} y quiero reservar para ${this.lead.weddingDate}"\n\n` +
        `2️⃣ **ESPERAMOS:** Confirmación de disponibilidad\n\n` +
        `3️⃣ **PAGAS:** Con el link ${mpLink}\n\n` +
        `4️⃣ **ENVÍAS:** El voucher/comprobante por WhatsApp al +56 9 4066 2286\n\n` +
        `💰 Total: $92.459 (incluye comisión MercadoPago)\n` +
        `✓ Hasta 3 cuotas sin interés\n\n` +
        `📅 **Después del pago confirmado:** Agendamos videollamada de 1.5 hrs para planificar TODO.\n\n` +
        `📄 Realizamos contrato si así lo requieren.\n\n` +
        `¡Tu matrimonio va a ser INCREÍBLE! 🎉💍`
      );
      
      this.lead.stage = 'pending_contact';
      this.lead.payment_method = 'mercadopago';
      this.saveLead();
      console.log('🎯 LEAD CALIENTE - ESPERANDO CONTACTO WHATSAPP:', this.lead);
      this.quick.style.display = 'none';
    },
    
    sendTransferenciaInfo() {
      this.addBotMessage(
        `✅ Perfecto, ${this.lead.name}! Transferencia bancaria es una excelente opción.\n\n` +
        `💰 **SIN comisiones** - Pagas exactamente $90.000\n\n` +
        `📱 **PARA OBTENER LOS DATOS BANCARIOS:**\n\n` +
        `Debes escribir al WhatsApp **+56 9 4066 2286** indicando:\n\n` +
        `• Tu nombre: ${this.lead.name}\n` +
        `• Fecha que quieres reservar: ${this.lead.weddingDate}\n` +
        `• Que prefieres pagar por transferencia\n\n` +
        `Te enviaremos:\n` +
        `✓ Datos bancarios completos\n` +
        `✓ Confirmación de disponibilidad\n` +
        `✓ Instrucciones de pago\n\n` +
        `💳 **Plan de pagos:**\n` +
        `1️⃣ Ahora: $90.000 (reserva)\n` +
        `2️⃣ Un mes antes: 50% del saldo\n` +
        `3️⃣ Día del matrimonio (mañana): 50% restante\n\n` +
        `⚠️ **IMPORTANTE:** El pago final debe ser hasta la mañana del matrimonio por respeto a los novios y trabajadores de Portal Boda.\n\n` +
        `📸 Una vez que hagas la transferencia, envías el comprobante por el mismo WhatsApp indicando la fecha ${this.lead.weddingDate}\n\n` +
        `📅 **Después del pago confirmado:** Agendamos videollamada de 1.5 hrs para planificar TODO.\n\n` +
        `📄 Realizamos contrato si así lo requieren.\n\n` +
        `¿Procedemos? Escribe al WhatsApp +56 9 4066 2286 ahora.`
      );
      
      this.quick.innerHTML = `
        <button onclick="salesBot.confirmTransferencia()">Entendido, contactaré por WhatsApp</button>
        <button onclick="salesBot.sendMercadoPagoLink()">Cambiar a MercadoPago</button>
      `;
      this.quick.style.display = 'flex';
    },
    
    confirmTransferencia() {
      this.addBotMessage(
        `✅ ¡PERFECTO!\n\n` +
        `📱 **SIGUIENTE PASO:**\n\n` +
        `Escribe al WhatsApp **+56 9 4066 2286** ahora mismo:\n\n` +
        `📝 Mensaje sugerido:\n` +
        `"Hola, soy ${this.lead.name}. Quiero reservar para ${this.lead.weddingDate} y prefiero pagar por transferencia. ¿Me pueden enviar los datos bancarios?"\n\n` +
        `Te responderemos con:\n` +
        `✓ Datos bancarios completos\n` +
        `✓ Confirmación de disponibilidad de tu fecha\n` +
        `✓ Instrucciones detalladas\n\n` +
        `📸 Después de transferir, envías el comprobante por el mismo WhatsApp indicando la fecha ${this.lead.weddingDate}\n\n` +
        `💳 **Recordatorio del plan de pagos:**\n` +
        `• Reserva: $90.000\n` +
        `• Un mes antes: 50% del saldo\n` +
        `• Día del matrimonio (mañana): 50% restante\n\n` +
        `📅 **Después del pago confirmado:** Videollamada de 1.5 hrs para planificar TODO.\n\n` +
        `📄 Realizamos contrato si así lo requieren.\n\n` +
        `¡Tu matrimonio va a ser INCREÍBLE! 🎉💍`
      );
      
      this.lead.stage = 'pending_contact';
      this.lead.payment_method = 'transferencia';
      this.saveLead();
      console.log('🎯 LEAD CALIENTE - DEBE CONTACTAR WHATSAPP PARA DATOS:', this.lead);
      this.quick.style.display = 'none';
    },
    
    // ============================================
    // MANEJO DE OBJECIONES
    // ============================================
    
    detectObjection(text) {
      const objections = ['caro', 'costoso', 'presupuesto', 'pensarlo', 'consultar', 'tiempo', 'comparar', 'otro proveedor'];
      return objections.some(obj => text.includes(obj));
    },
    
    handleObjection(text) {
      if (text.includes('caro') || text.includes('costoso') || text.includes('presupuesto')) {
        this.addBotMessage(
          `${this.lead.name}, entiendo perfectamente.\n\n` +
          `Déjame preguntarte: ¿Cuánto vale para ti tener TODOS los momentos de tu día capturados?\n\n` +
          `En 10, 20, 30 años... ¿qué VAS A TENER de tu matrimonio?\n\n` +
          `Las flores se marchitan. La comida se acaba. Pero las FOTOS y VIDEOS son PARA SIEMPRE.\n\n` +
          `Además, armando un pack con nosotros:\n` +
          `✓ Ahorras con descuentos\n` +
          `✓ Un solo proveedor (menos stress)\n` +
          `✓ Todo coordinado\n\n` +
          `Y la reserva es solo $90.000 para asegurar tu fecha.\n\n` +
          `¿Te parece que revisemos juntos cómo armar algo dentro de tu presupuesto?`
        );
      } else if (text.includes('pensarlo') || text.includes('consultar')) {
        this.addBotMessage(
          `${this.lead.name}, te entiendo al 100%. Es una decisión importante.\n\n` +
          `Solo quiero ser honesto contigo:\n\n` +
          `Cada día más fechas se van reservando. Solo esta semana ya reservamos 2 fechas para 2026.\n\n` +
          `Una vez reservada, ya NO está disponible.\n\n` +
          `No quiero presionarte, pero sí quiero que tengas la opción de elegir.\n\n` +
          `¿Qué tal si al menos verifico AHORA si tu fecha está libre? Así sabes si puedes decidir con calma.\n\n` +
          `¿Te parece?`
        );
      } else {
        this.addBotMessage(
          `${this.lead.name}, entiendo que tengas dudas.\n\n` +
          `¿Qué es específicamente lo que te preocupa? Cuéntame y lo conversamos con total tranquilidad 😊`
        );
      }
    },
    
    detectBuyingIntent(text) {
      const intents = ['reservar', 'agendar', 'contratar', 'quiero', 'me interesa', 'disponibilidad', 'link', 'pago'];
      return intents.some(intent => text.includes(intent));
    },
    
    moveToClosing() {
      if (!this.lead.weddingDate) {
        this.addBotMessage(
          `¡Me encanta tu energía, ${this.lead.name}! 🎉\n\n` +
          `Para verificar disponibilidad, necesito saber: ¿Para qué fecha es su matrimonio?`
        );
        this.lead.waitingFor = 'wedding_date';
        this.lead.stage = 'calificación';
      } else {
        this.checkAvailability();
      }
    },
    
    handleGeneralQuery() {
      this.addBotMessage(
        `${this.lead.name}, con gusto te ayudo.\n\n` +
        `¿Hay algún servicio específico que te interese o prefieres que te asesore?`
      );
      
      this.quick.innerHTML = `
        <button onclick="salesBot.showAllServices()">Ver servicios</button>
        <button onclick="salesBot.explainPacks()">Cómo armar un pack</button>
        <button onclick="salesBot.getRecommendation()">Asesórame</button>
      `;
      this.quick.style.display = 'flex';
    },
    
    askMoreQuestions() {
      this.addBotMessage(
        `Por supuesto, ${this.lead.name}. Pregúntame lo que necesites saber 😊\n\n` +
        `Estoy aquí para resolver todas tus dudas.`
      );
    },
    
    moveToReservation() {
      this.checkAvailability();
    },
    
    // ============================================
    // PERSISTENCIA Y UI
    // ============================================
    
    saveLead() {
      try {
        localStorage.setItem('pb_lead', JSON.stringify({ ...this.lead, savedAt: Date.now() }));
      } catch(e) {}
    },
    
    loadLead() {
      try {
        const saved = localStorage.getItem('pb_lead');
        if (saved) {
          const data = JSON.parse(saved);
          const daysSince = (Date.now() - data.savedAt) / (1000 * 60 * 60 * 24);
          if (daysSince < 7) {
            Object.assign(this.lead, data);
          }
        }
      } catch(e) {}
    },
    
    open() {
      this.window.classList.add('open');
    },
    
    closeChat() {
      this.window.classList.remove('open');
    },
    
    addBotMessage(text) {
      const msg = document.createElement('div');
      msg.className = 'chat-msg msg-bot';
      msg.textContent = text;
      this.messages.appendChild(msg);
      this.scrollToBottom();
    },
    
    addUserMessage(text) {
      const msg = document.createElement('div');
      msg.className = 'chat-msg msg-user';
      msg.textContent = text;
      this.messages.appendChild(msg);
      this.scrollToBottom();
    },
    
    scrollToBottom() {
      this.messages.scrollTop = this.messages.scrollHeight;
    }
  };

  salesBot.init();
  window.salesBot = salesBot;

  // ============================================
  // GALERÍA ROTATIVA AUTOMÁTICA
  // ============================================
  
  const galeriaFotos = {
    postboda_color: [
      'postboda-01.jpg', 'postboda-02.jpg', 'postboda-04.jpg',
      'postboda-05.jpg', 'postboda-06-cargada.jpg', 'postboda-07.jpg',
      'postboda-08-editorial.jpg', 'postboda-09-brazos.jpg',
      'postboda-10-baile.jpg', 'postboda-11.jpg', 'hero-allison-cristian.jpg'
    ],
    postboda_bn: ['postboda-03-bn.jpg'],
    ceremonia_vinedo: ['vinedo-01.jpg', 'vinedo-02.jpg', 'novio-vinedo.jpg'],
    drone: ['drone-vinedo.jpg'],
    cabina: [
      'cabina-blanca-flores.webp', 'cabina-blanca-interior.webp',
      'cabina-negra.webp', 'cabina-libro.webp'
    ],
    estudio: ['estudio-01.jpg', 'estudio-02.jpg']
  };
  
  function iniciarGaleriaRotativa() {
    // Combinar todas las fotos
    const todasLasFotos = [
      ...galeriaFotos.postboda_color,
      ...galeriaFotos.postboda_bn,
      ...galeriaFotos.ceremonia_vinedo,
      ...galeriaFotos.drone,
      ...galeriaFotos.cabina,
      ...galeriaFotos.estudio
    ];
    
    // Función para mezclar array (Fisher-Yates shuffle)
    function shuffle(array) {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }
    
    // Mezclar fotos aleatoriamente
    let fotosAleatorias = shuffle(todasLasFotos);
    let indiceActual = 0;
    
    const figuras = document.querySelectorAll('.mosaic figure img');
    if (figuras.length === 0) return;  // Si no hay galería, salir
    
    // Función para actualizar una foto
    function actualizarFoto(img, index) {
      const nuevaFoto = fotosAleatorias[index % fotosAleatorias.length];
      const nuevaSrc = `img/${nuevaFoto}`;
      
      // Fade out
      img.style.opacity = '0';
      
      setTimeout(() => {
        img.src = nuevaSrc;
        // Fade in
        img.style.opacity = '1';
      }, 300);
    }
    
    // Agregar transición suave a todas las imágenes
    figuras.forEach(img => {
      img.style.transition = 'opacity 0.6s ease-in-out';
    });
    
    // Rotar cada 5 segundos
    setInterval(() => {
      figuras.forEach((img, i) => {
        const fotoIndex = (indiceActual + i) % fotosAleatorias.length;
        actualizarFoto(img, fotoIndex);
      });
      
      indiceActual = (indiceActual + 1) % fotosAleatorias.length;
      
      // Remezclar cuando termine el ciclo completo
      if (indiceActual === 0) {
        fotosAleatorias = shuffle(todasLasFotos);
      }
    }, 5000);
  }
  
  // Iniciar galería rotativa cuando cargue la página
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarGaleriaRotativa);
  } else {
    iniciarGaleriaRotativa();
  }

  // Schema.org
  const schemaLocal = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://www.portalboda.cl",
    "name": "Portal Boda",
    "description": "Fotografía y video profesional para matrimonios en Chile. +300 matrimonios en 10 años documentando bodas en Santiago, Valparaíso y O'Higgins.",
    "image": "https://www.portalboda.cl/img/hero-allison-cristian.jpg",
    "url": "https://www.portalboda.cl",
    "telephone": "+56954189795",
    "email": "portalboda@gmail.com",
    "areaServed": [
      {"@type": "City", "name": "Santiago"},
      {"@type": "AdministrativeArea", "name": "Región Metropolitana de Santiago"},
      {"@type": "AdministrativeArea", "name": "Región de Valparaíso"},
      {"@type": "City", "name": "Valparaíso"},
      {"@type": "City", "name": "Algarrobo"},
      {"@type": "AdministrativeArea", "name": "Región de O'Higgins"}
    ],
    "sameAs": [
      "https://www.instagram.com/portalboda",
      "https://www.facebook.com/portalboda",
      "https://www.youtube.com/channel/UC2FlALdvZAXg14tjjBCe0Yw"
    ],
    "founder": {
      "@type": "Person",
      "name": "Alonso Gómez Einicke",
      "jobTitle": "Director Audiovisual"
    }
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schemaLocal);
  document.head.appendChild(script);

})();
