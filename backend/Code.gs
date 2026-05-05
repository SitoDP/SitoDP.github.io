/**
 * ============================================================
 * Boat Solutions · Forms webhook
 * ============================================================
 *
 * Recibe envíos de los formularios de la web y los guarda como
 * filas en la hoja activa.
 *
 * Para cualquier `data.type` reconocido (contacto, reserva, quote)
 * además dispara dos correos HTML branded:
 *   1. Confirmación al cliente.
 *   2. Notificación al admin (NOTIFY_EMAIL).
 *
 * Si los emails fallan, la fila ya está guardada y la respuesta
 * sigue siendo de éxito — el error solo se loguea.
 * ============================================================
 */

// =============================================================
// ⚙️ CONFIG
// =============================================================

// ⚠️ TESTING — volver a 'info@boat-solutions.es' antes de producción
const NOTIFY_EMAIL = 'sitoo.suarez@gmail.com';
const REPLY_TO = 'sitoo.suarez@gmail.com';

const BUSINESS_NAME = 'Boat Solutions';
const BUSINESS_TAGLINE_ES = 'Servicios marinos integrales';
const BUSINESS_TAGLINE_EN = 'Integrated marine services';
const PHONE_DISPLAY = '+34 676 625 595';
const LOGO_URL = 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=192,h=192,fit=crop,f=png/AMqDOgByPghjN30x/untitled-design-4-dOqZL1pLyvs3RvbW.png';
const TIMEZONE = 'Europe/Madrid';

// Paleta para los correos HTML
const BRAND_PRIMARY = '#426887';
const BRAND_PRIMARY_DARK = '#2d4a5f';
const BRAND_PRIMARY_LIGHT = '#dde6ed';
const BRAND_DARK = '#0d141a';
const BRAND_TEXT = '#0d141a';
const BRAND_TEXT_SOFT = '#6b7280';
const BRAND_BG = '#fafafa';
const BRAND_LINE = '#e5e7eb';

// Mapas de etiquetas legibles (deben coincidir con src/i18n/contacto.ts)
const SUBJECT_LABELS = {
  consulta:      { es: 'Consulta general',          en: 'General enquiry' },
  presupuesto:   { es: 'Solicitar presupuesto',     en: 'Request a quote' },
  cita:          { es: 'Agendar cita',              en: 'Schedule an appointment' },
  traslado:      { es: 'Traslado de embarcación',   en: 'Vessel transfer' },
  mantenimiento: { es: 'Mantenimiento',             en: 'Maintenance' },
  otro:          { es: 'Otro',                      en: 'Other' },
};

const BOAT_LABELS = {
  velero:    { es: 'Velero',     en: 'Sailing yacht' },
  yate:      { es: 'Yate',       en: 'Motor yacht' },
  lancha:    { es: 'Lancha',     en: 'Motorboat' },
  catamaran: { es: 'Catamarán',  en: 'Catamaran' },
  neumatico: { es: 'Neumático',  en: 'RIB' },
  otro:      { es: 'Otro',       en: 'Other' },
};

// =============================================================
// HTTP ENDPOINTS
// =============================================================

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    const category =
      data.type === 'contacto' ? 'Contacto' :
      data.type === 'quote'    ? 'Presupuesto' :
      data.isConsulting        ? 'Consulta' :
                                 'Reserva';

    const row = [
      new Date(),
      data.type || '',
      category,
      data.name || '',
      data.email || '',
      data.phone || '',
      data.boatType || '',
      data.subject || '',
      data.message || data.specs || '',
      data.comments || data.product || '',
      data.date || '',
      data.time || ''
    ];

    sheet.appendRow(row);

    // Disparo de emails. Si fallan, la fila ya está guardada.
    try {
      const lang = data.language === 'en' ? 'en' : 'es';
      switch (data.type) {
        case 'contacto':
          handleContactoEmails(data, lang); break;
        case 'reserva':
          handleReservaEmails(data, lang); break;
        case 'quote':
          handleQuoteEmails(data, lang); break;
      }
    } catch (mailErr) {
      console.error('[' + (data.type || 'unknown') + '] email error:', mailErr);
    }

    return jsonResponse({ status: 'success', ok: true });
  } catch (err) {
    console.error(err);
    return jsonResponse({ ok: false, error: String(err && err.message || err) });
  }
}

function doGet() {
  return jsonResponse({ ok: true, service: BUSINESS_NAME });
}

// =============================================================
// HANDLERS — un par customer/admin por tipo
// =============================================================

function handleContactoEmails(data, lang) {
  const p = {
    type: 'contacto', lang: lang,
    name:          String(data.name || '').slice(0, 200).trim(),
    email:         String(data.email || '').slice(0, 200).trim(),
    phone:         String(data.phone || '').slice(0, 50).trim(),
    boatType:      String(data.boatType || '').trim(),
    boatTypeLabel: (BOAT_LABELS[data.boatType] && BOAT_LABELS[data.boatType][lang]) || '',
    subject:       String(data.subject || '').trim(),
    subjectLabel:  (SUBJECT_LABELS[data.subject] && SUBJECT_LABELS[data.subject][lang]) || '',
    message:       String(data.message || '').slice(0, 4000).trim(),
  };
  if (!p.name || !p.email || !p.message) return;

  GmailApp.sendEmail(p.email, customerSubjectFor(p), '', {
    htmlBody: customerEmailContacto(p),
    name: BUSINESS_NAME, replyTo: REPLY_TO,
  });
  GmailApp.sendEmail(NOTIFY_EMAIL, adminSubjectFor(p), '', {
    htmlBody: adminEmailContacto(p),
    name: BUSINESS_NAME + ' (web)', replyTo: p.email,
  });
}

function handleReservaEmails(data, lang) {
  const p = {
    type: 'reserva', lang: lang,
    name:          String(data.name || '').slice(0, 200).trim(),
    email:         String(data.email || '').slice(0, 200).trim(),
    phone:         String(data.phone || '').slice(0, 50).trim(),
    boatType:      String(data.boatType || '').trim(),
    boatTypeLabel: (BOAT_LABELS[data.boatType] && BOAT_LABELS[data.boatType][lang]) || '',
    date:          String(data.date || '').trim(),
    time:          String(data.time || '').trim(),
    comments:      String(data.comments || '').slice(0, 4000).trim(),
    isConsulting:  !!data.isConsulting,
  };
  if (!p.name || !p.email) return;

  GmailApp.sendEmail(p.email, customerSubjectFor(p), '', {
    htmlBody: customerEmailReserva(p),
    name: BUSINESS_NAME, replyTo: REPLY_TO,
  });
  GmailApp.sendEmail(NOTIFY_EMAIL, adminSubjectFor(p), '', {
    htmlBody: adminEmailReserva(p),
    name: BUSINESS_NAME + ' (web)', replyTo: p.email,
  });
}

function handleQuoteEmails(data, lang) {
  const p = {
    type: 'quote', lang: lang,
    name:          String(data.name || '').slice(0, 200).trim(),
    email:         String(data.email || '').slice(0, 200).trim(),
    phone:         String(data.phone || '').slice(0, 50).trim(),
    product:       String(data.product || '').slice(0, 200).trim(),
    productHandle: String(data.productHandle || '').trim(),
    specs:         String(data.specs || '').slice(0, 4000).trim(),
  };
  if (!p.name || !p.email) return;

  GmailApp.sendEmail(p.email, customerSubjectFor(p), '', {
    htmlBody: customerEmailQuote(p),
    name: BUSINESS_NAME, replyTo: REPLY_TO,
  });
  GmailApp.sendEmail(NOTIFY_EMAIL, adminSubjectFor(p), '', {
    htmlBody: adminEmailQuote(p),
    name: BUSINESS_NAME + ' (web)', replyTo: p.email,
  });
}

// =============================================================
// SUBJECTS
// =============================================================

function customerSubjectFor(p) {
  const en = p.lang === 'en';
  if (p.type === 'contacto') {
    return en ? "We've received your message — " + BUSINESS_NAME
              : 'Hemos recibido tu mensaje — ' + BUSINESS_NAME;
  }
  if (p.type === 'reserva') {
    if (p.isConsulting) {
      return en ? 'Consulting request received — ' + BUSINESS_NAME
                : 'Hemos recibido tu solicitud de consultoría — ' + BUSINESS_NAME;
    }
    return en ? 'Booking received — ' + BUSINESS_NAME
              : 'Hemos recibido tu reserva — ' + BUSINESS_NAME;
  }
  if (p.type === 'quote') {
    return en ? 'Quote request received — ' + BUSINESS_NAME
              : 'Hemos recibido tu solicitud de presupuesto — ' + BUSINESS_NAME;
  }
  return BUSINESS_NAME;
}

function adminSubjectFor(p) {
  if (p.type === 'contacto') return 'Nueva consulta — ' + p.name;
  if (p.type === 'reserva') {
    const dt = (p.date || '') + (p.time ? ' ' + p.time : '');
    return (p.isConsulting ? 'Nueva consultoría — ' : 'Nueva reserva — ') + p.name + (dt ? ' · ' + dt : '');
  }
  if (p.type === 'quote') {
    return 'Nueva solicitud de presupuesto — ' + p.name + (p.product ? ' · ' + p.product : '');
  }
  return 'Nueva solicitud — ' + p.name;
}

// =============================================================
// SHARED EMAIL PIECES
// =============================================================

function customerHeader(lang) {
  const tagline = lang === 'en' ? BUSINESS_TAGLINE_EN : BUSINESS_TAGLINE_ES;
  return '<tr><td style="background:' + BRAND_DARK + ';background-image:linear-gradient(135deg,' + BRAND_DARK + ' 0%,' + BRAND_PRIMARY + ' 100%);padding:36px 32px;text-align:center;">' +
    '<img src="' + LOGO_URL + '" alt="' + BUSINESS_NAME + '" width="64" height="64" style="border-radius:50%;background:#FFFFFF;display:block;margin:0 auto 14px;">' +
    '<p style="margin:0;color:#FFFFFF;font-family:Georgia,serif;font-size:24px;letter-spacing:0.04em;">' + BUSINESS_NAME + '</p>' +
    '<p style="margin:6px 0 0;color:' + BRAND_PRIMARY_LIGHT + ';font-size:11px;letter-spacing:0.32em;text-transform:uppercase;">' + tagline + '</p>' +
  '</td></tr>';
}

function customerDisclaimer(lang) {
  const en = lang === 'en';
  const text = en
    ? '<strong style="color:' + BRAND_PRIMARY + ';">Notice:</strong> This email has been auto-generated to confirm receipt of your request. Your submission is in our inbox and we will reply personally.'
    : '<strong style="color:' + BRAND_PRIMARY + ';">Aviso:</strong> Este correo se ha generado automáticamente para confirmarte la recepción de tu solicitud. Ya está en nuestra bandeja y te responderemos personalmente.';
  return '<tr><td style="padding:0 36px 32px;">' +
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:' + BRAND_PRIMARY_LIGHT + ';border-radius:12px;">' +
    '<tr><td style="padding:14px 18px;"><p style="margin:0;font-size:12px;line-height:1.5;color:' + BRAND_PRIMARY_DARK + ';">' + text + '</p></td></tr>' +
    '</table></td></tr>';
}

function customerFooter(lang) {
  const tagline = lang === 'en' ? BUSINESS_TAGLINE_EN : BUSINESS_TAGLINE_ES;
  return '<tr><td style="background:' + BRAND_BG + ';padding:24px 36px;text-align:center;border-top:1px solid ' + BRAND_LINE + ';">' +
    '<p style="margin:0 0 6px;font-size:12px;color:' + BRAND_TEXT_SOFT + ';">' + BUSINESS_NAME + ' · ' + tagline + ' · Vigo, Pontevedra</p>' +
    '<p style="margin:0;font-size:12px;color:' + BRAND_TEXT_SOFT + ';">' + PHONE_DISPLAY + ' · info@boat-solutions.es</p>' +
  '</td></tr>';
}

function emailWrap(lang, innerHtml) {
  return '<!DOCTYPE html>\n' +
'<html lang="' + lang + '"><head><meta charset="UTF-8"><title>' + BUSINESS_NAME + '</title></head>' +
'<body style="margin:0;padding:0;background:' + BRAND_BG + ';font-family:\'Helvetica Neue\',Arial,sans-serif;color:' + BRAND_TEXT + ';">' +
'<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:' + BRAND_BG + ';padding:40px 20px;">' +
'<tr><td align="center">' +
'<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(13,20,26,0.08);">' +
innerHtml +
'</table></td></tr></table></body></html>';
}

function customerSignature(lang) {
  const en = lang === 'en';
  const teamName = en ? 'The Boat Solutions team' : 'El equipo de Boat Solutions';
  const tagline = en ? BUSINESS_TAGLINE_EN : BUSINESS_TAGLINE_ES;
  return '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:32px;padding-top:24px;border-top:1px solid ' + BRAND_LINE + ';">' +
    '<tr><td>' +
    '<p style="margin:0 0 4px;font-family:Georgia,serif;font-size:18px;color:' + BRAND_DARK + ';font-weight:600;">' + teamName + '</p>' +
    '<p style="margin:0;font-size:13px;color:' + BRAND_TEXT_SOFT + ';">' + tagline + ' · Vigo, Pontevedra</p>' +
    '</td></tr></table>';
}

function summaryBox(lang, rowsHtml) {
  const en = lang === 'en';
  const heading = en ? 'Summary' : 'Resumen';
  return '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:8px 0 24px;background:' + BRAND_PRIMARY_LIGHT + ';border-radius:12px;">' +
    '<tr><td style="padding:18px 22px;">' +
    '<p style="margin:0 0 12px;font-size:11px;font-weight:bold;letter-spacing:0.18em;text-transform:uppercase;color:' + BRAND_PRIMARY_DARK + ';">' + heading + '</p>' +
    rowsHtml +
    '</td></tr></table>';
}

function summaryRow(label, value) {
  return '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:6px;">' +
    '<tr>' +
    '<td width="120" style="padding:4px 8px 4px 0;font-size:13px;color:' + BRAND_PRIMARY_DARK + ';font-weight:500;">' + label + '</td>' +
    '<td style="padding:4px 0;font-size:14px;color:' + BRAND_TEXT + ';font-weight:600;">' + value + '</td>' +
    '</tr></table>';
}

// =============================================================
// CUSTOMER EMAIL TEMPLATES
// =============================================================

function customerEmailContacto(p) {
  const en = p.lang === 'en';
  const greeting = (en ? 'Hi ' : 'Hola ') + escapeHtml(firstName(p.name)) + ',';
  const intro = en
    ? 'Thanks for getting in touch with <strong>' + BUSINESS_NAME + '</strong>. We have received your message correctly.'
    : 'Gracias por escribir a <strong>' + BUSINESS_NAME + '</strong>. Hemos recibido tu mensaje correctamente.';
  const responseTime = en
    ? "We'll get back to you personally within <strong>24 working hours</strong>."
    : 'Te responderemos personalmente en <strong>menos de 24 h laborables</strong>.';
  const urgent = en
    ? 'If your enquiry is urgent, you can reach us by WhatsApp at <strong>' + PHONE_DISPLAY + '</strong>.'
    : 'Si tu consulta es urgente, puedes escribirnos por WhatsApp al <strong>' + PHONE_DISPLAY + '</strong>.';

  const body =
    '<tr><td style="padding:40px 36px;">' +
    '<h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:26px;color:' + BRAND_DARK + ';font-weight:600;">' + greeting + '</h1>' +
    '<p style="margin:0 0 16px;font-size:16px;line-height:1.65;">' + intro + '</p>' +
    '<p style="margin:0 0 16px;font-size:16px;line-height:1.65;">' + responseTime + '</p>' +
    '<p style="margin:0 0 0;font-size:16px;line-height:1.65;">' + urgent + '</p>' +
    customerSignature(p.lang) +
    '</td></tr>';

  return emailWrap(p.lang, customerHeader(p.lang) + body + customerDisclaimer(p.lang) + customerFooter(p.lang));
}

function customerEmailReserva(p) {
  const en = p.lang === 'en';
  const greeting = (en ? 'Hi ' : 'Hola ') + escapeHtml(firstName(p.name)) + ',';
  const isC = p.isConsulting;
  const intro = en
    ? (isC
        ? 'Thanks for booking a consulting session with <strong>' + BUSINESS_NAME + '</strong>. The first one is free.'
        : 'Thanks for booking with <strong>' + BUSINESS_NAME + '</strong>. We have received your request correctly.')
    : (isC
        ? 'Gracias por solicitar una consultoría con <strong>' + BUSINESS_NAME + '</strong>. La primera es gratuita.'
        : 'Gracias por reservar con <strong>' + BUSINESS_NAME + '</strong>. Hemos recibido tu solicitud correctamente.');
  const confirm = en
    ? "We'll confirm the date and time within <strong>24 working hours</strong>."
    : 'Te confirmaremos fecha y hora en <strong>menos de 24 h laborables</strong>.';
  const urgent = en
    ? 'If you need to change anything, write or WhatsApp us at <strong>' + PHONE_DISPLAY + '</strong>.'
    : 'Si necesitas cambiar algo, escríbenos o llámanos por WhatsApp al <strong>' + PHONE_DISPLAY + '</strong>.';

  const summaryRows =
    summaryRow(en ? 'Type' : 'Tipo', isC ? (en ? 'Consulting' : 'Consultoría') : (en ? 'Appointment' : 'Cita')) +
    (p.date ? summaryRow(en ? 'Date' : 'Fecha', escapeHtml(formatDate(p.date, p.lang))) : '') +
    (p.time ? summaryRow(en ? 'Time' : 'Hora', escapeHtml(p.time)) : '') +
    (p.boatTypeLabel ? summaryRow(en ? 'Vessel' : 'Embarcación', escapeHtml(p.boatTypeLabel)) : '');

  const body =
    '<tr><td style="padding:40px 36px;">' +
    '<h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:26px;color:' + BRAND_DARK + ';font-weight:600;">' + greeting + '</h1>' +
    '<p style="margin:0 0 16px;font-size:16px;line-height:1.65;">' + intro + '</p>' +
    '<p style="margin:0 0 16px;font-size:16px;line-height:1.65;">' + confirm + '</p>' +
    summaryBox(p.lang, summaryRows) +
    '<p style="margin:0;font-size:16px;line-height:1.65;">' + urgent + '</p>' +
    customerSignature(p.lang) +
    '</td></tr>';

  return emailWrap(p.lang, customerHeader(p.lang) + body + customerDisclaimer(p.lang) + customerFooter(p.lang));
}

function customerEmailQuote(p) {
  const en = p.lang === 'en';
  const greeting = (en ? 'Hi ' : 'Hola ') + escapeHtml(firstName(p.name)) + ',';
  const intro = en
    ? 'Thanks for your quote request at <strong>' + BUSINESS_NAME + '</strong>. We have received your enquiry correctly.'
    : 'Gracias por tu solicitud de presupuesto en <strong>' + BUSINESS_NAME + '</strong>. Hemos recibido tu consulta correctamente.';
  const next = en
    ? "We'll send you a personalized quote within <strong>24 working hours</strong>."
    : 'Te haremos llegar un presupuesto personalizado en <strong>menos de 24 h laborables</strong>.';
  const urgent = en
    ? 'For anything urgent, write or WhatsApp us at <strong>' + PHONE_DISPLAY + '</strong>.'
    : 'Para cualquier urgencia, escríbenos o llámanos por WhatsApp al <strong>' + PHONE_DISPLAY + '</strong>.';

  const summaryRows = p.product
    ? summaryRow(en ? 'Product' : 'Producto', escapeHtml(p.product))
    : '';

  const body =
    '<tr><td style="padding:40px 36px;">' +
    '<h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:26px;color:' + BRAND_DARK + ';font-weight:600;">' + greeting + '</h1>' +
    '<p style="margin:0 0 16px;font-size:16px;line-height:1.65;">' + intro + '</p>' +
    '<p style="margin:0 0 16px;font-size:16px;line-height:1.65;">' + next + '</p>' +
    (summaryRows ? summaryBox(p.lang, summaryRows) : '') +
    '<p style="margin:0;font-size:16px;line-height:1.65;">' + urgent + '</p>' +
    customerSignature(p.lang) +
    '</td></tr>';

  return emailWrap(p.lang, customerHeader(p.lang) + body + customerDisclaimer(p.lang) + customerFooter(p.lang));
}

// =============================================================
// ADMIN EMAIL TEMPLATES
// =============================================================

function adminHeader(ribbonText, p) {
  const formattedDate = Utilities.formatDate(new Date(), TIMEZONE, "dd/MM/yyyy 'a las' HH:mm");
  return '<tr><td style="background:' + BRAND_DARK + ';padding:24px 32px;">' +
    '<p style="margin:0;color:' + BRAND_PRIMARY_LIGHT + ';font-size:11px;letter-spacing:0.32em;text-transform:uppercase;">' + ribbonText + '</p>' +
    '<p style="margin:6px 0 0;font-family:Georgia,serif;color:#FFFFFF;font-size:26px;">' + escapeHtml(p.name) + '</p>' +
    '<p style="margin:6px 0 0;color:#9DB3C5;font-size:13px;">' + formattedDate + ' · ' + (p.lang || 'es').toUpperCase() + '</p>' +
  '</td></tr>';
}

function adminFooter() {
  return '<tr><td style="background:' + BRAND_BG + ';padding:18px 32px;text-align:center;border-top:1px solid ' + BRAND_LINE + ';">' +
    '<p style="margin:0;font-size:11px;color:' + BRAND_TEXT_SOFT + ';">Notificación automática del formulario de ' + BUSINESS_NAME + '</p>' +
  '</td></tr>';
}

function adminReplyButton(p, subject) {
  return '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:32px;">' +
    '<tr><td align="center">' +
    '<a href="mailto:' + escapeAttr(p.email) + '?subject=' + encodeURIComponent(subject) + '" style="display:inline-block;background:' + BRAND_PRIMARY + ';color:#FFFFFF;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">' +
    'Responder a ' + escapeHtml(firstName(p.name)) +
    '</a></td></tr></table>';
}

function adminMessageBlock(label, value) {
  return '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:22px;">' +
    '<tr><td style="padding:0 0 8px;">' +
    '<p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:0.18em;text-transform:uppercase;color:' + BRAND_PRIMARY + ';">' + label + '</p>' +
    '</td></tr>' +
    '<tr><td style="background:' + BRAND_PRIMARY_LIGHT + ';border-left:4px solid ' + BRAND_PRIMARY + ';padding:18px 20px;border-radius:0 8px 8px 0;">' +
    '<p style="margin:0;font-size:15px;line-height:1.65;color:' + BRAND_TEXT + ';white-space:pre-wrap;">' + escapeHtml(value) + '</p>' +
    '</td></tr></table>';
}

function adminFieldRow(label, valueHtml) {
  return '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:14px;">' +
    '<tr><td style="padding:0 0 4px;">' +
    '<p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:0.18em;text-transform:uppercase;color:' + BRAND_PRIMARY + ';">' + label + '</p>' +
    '</td></tr>' +
    '<tr><td><p style="margin:0;font-size:15px;color:' + BRAND_TEXT + ';">' + valueHtml + '</p></td></tr>' +
  '</table>';
}

function adminEmailContacto(p) {
  const phoneDigits = p.phone.replace(/[^+0-9]/g, '');
  const fields =
    adminFieldRow('Nombre', escapeHtml(p.name)) +
    adminFieldRow('Email', '<a href="mailto:' + escapeAttr(p.email) + '" style="color:' + BRAND_PRIMARY + ';text-decoration:none;">' + escapeHtml(p.email) + '</a>') +
    (p.phone ? adminFieldRow('Teléfono', '<a href="tel:' + escapeAttr(phoneDigits) + '" style="color:' + BRAND_PRIMARY + ';text-decoration:none;">' + escapeHtml(p.phone) + '</a>') : '') +
    (p.boatTypeLabel ? adminFieldRow('Tipo de embarcación', escapeHtml(p.boatTypeLabel)) : '') +
    (p.subjectLabel ? adminFieldRow('Asunto', escapeHtml(p.subjectLabel)) : '');

  const inner =
    adminHeader('Nueva consulta web', p) +
    '<tr><td style="padding:32px;">' +
      fields +
      adminMessageBlock('Mensaje', p.message) +
      adminReplyButton(p, 'Re: Tu consulta — ' + BUSINESS_NAME) +
    '</td></tr>' +
    adminFooter();

  return emailWrap('es', inner);
}

function adminEmailReserva(p) {
  const phoneDigits = p.phone.replace(/[^+0-9]/g, '');
  const ribbon = p.isConsulting ? 'Nueva consultoría' : 'Nueva reserva';

  const fields =
    adminFieldRow('Nombre', escapeHtml(p.name)) +
    adminFieldRow('Email', '<a href="mailto:' + escapeAttr(p.email) + '" style="color:' + BRAND_PRIMARY + ';text-decoration:none;">' + escapeHtml(p.email) + '</a>') +
    (p.phone ? adminFieldRow('Teléfono', '<a href="tel:' + escapeAttr(phoneDigits) + '" style="color:' + BRAND_PRIMARY + ';text-decoration:none;">' + escapeHtml(p.phone) + '</a>') : '') +
    (p.boatTypeLabel ? adminFieldRow('Tipo de embarcación', escapeHtml(p.boatTypeLabel)) : '') +
    (p.date ? adminFieldRow('Fecha', escapeHtml(formatDate(p.date, 'es'))) : '') +
    (p.time ? adminFieldRow('Hora', escapeHtml(p.time)) : '') +
    adminFieldRow('Tipo', p.isConsulting ? 'Consultoría (gratis)' : 'Reserva regular');

  const inner =
    adminHeader(ribbon, p) +
    '<tr><td style="padding:32px;">' +
      fields +
      (p.comments ? adminMessageBlock('Comentarios', p.comments) : '') +
      adminReplyButton(p, 'Re: Tu reserva — ' + BUSINESS_NAME) +
    '</td></tr>' +
    adminFooter();

  return emailWrap('es', inner);
}

function adminEmailQuote(p) {
  const phoneDigits = p.phone.replace(/[^+0-9]/g, '');

  const fields =
    adminFieldRow('Nombre', escapeHtml(p.name)) +
    adminFieldRow('Email', '<a href="mailto:' + escapeAttr(p.email) + '" style="color:' + BRAND_PRIMARY + ';text-decoration:none;">' + escapeHtml(p.email) + '</a>') +
    (p.phone ? adminFieldRow('Teléfono', '<a href="tel:' + escapeAttr(phoneDigits) + '" style="color:' + BRAND_PRIMARY + ';text-decoration:none;">' + escapeHtml(p.phone) + '</a>') : '') +
    (p.product ? adminFieldRow('Producto', escapeHtml(p.product)) : '') +
    (p.productHandle ? adminFieldRow('Handle', escapeHtml(p.productHandle)) : '');

  const inner =
    adminHeader('Nueva solicitud de presupuesto', p) +
    '<tr><td style="padding:32px;">' +
      fields +
      adminMessageBlock('Detalles / personalización', p.specs || '—') +
      adminReplyButton(p, 'Re: Tu solicitud de presupuesto — ' + BUSINESS_NAME) +
    '</td></tr>' +
    adminFooter();

  return emailWrap('es', inner);
}

// =============================================================
// HELPERS
// =============================================================

function firstName(name) {
  return String(name || '').split(' ')[0] || name;
}

function formatDate(isoOrText, lang) {
  // Acepta 'YYYY-MM-DD' o cualquier string. Si parsea como Date,
  // devuelve formato dd/MM/yyyy (es) o MMM d, yyyy (en).
  const d = new Date(isoOrText);
  if (isNaN(d.getTime())) return isoOrText;
  if (lang === 'en') return Utilities.formatDate(d, TIMEZONE, "MMM d, yyyy");
  return Utilities.formatDate(d, TIMEZONE, "dd/MM/yyyy");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(s) {
  return String(s).replace(/"/g, '%22').replace(/'/g, '%27');
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
