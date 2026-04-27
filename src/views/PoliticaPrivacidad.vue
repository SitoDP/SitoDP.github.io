<template>
  <div class="legal-page">
    <section class="hero">
      <div class="container hero-content">
        <h1>Política de Privacidad</h1>
        <p>Última actualización: enero de 2025</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="legal-body">

          <p class="lead">El sitio web de BSI - Boat Solutions International es propiedad de Boat Solutions International S.L., que actúa como responsable del tratamiento de sus datos personales.</p>

          <p>Hemos adoptado esta Política de Privacidad, que determina cómo tratamos la información recopilada por BSI - Boat Solutions International, y explica los motivos por los que necesitamos recopilar ciertos datos personales sobre usted. Por tanto, debe leer esta Política de Privacidad antes de utilizar el sitio web.</p>

          <p>Nos preocupamos por sus datos personales y nos comprometemos a garantizar su confidencialidad y seguridad.</p>

          <h2>Información personal que recopilamos</h2>
          <p>Cuando visita el sitio web de BSI - Boat Solutions International, recopilamos automáticamente cierta información sobre su dispositivo, incluida información sobre su navegador web, dirección IP, zona horaria y algunas de las cookies instaladas en su dispositivo. Además, mientras navega por el sitio, recopilamos información sobre las páginas web o productos individuales que visualiza, los sitios web o términos de búsqueda que le han referido al sitio, y cómo interactúa con él. Nos referimos a esta información recopilada automáticamente como «Información del dispositivo».</p>
          <p>Asimismo, podemos recopilar los datos personales que usted nos proporcione (incluyendo, entre otros, nombre, apellidos, dirección e información de pago) durante el registro, con el fin de poder cumplir el contrato.</p>

          <h2>¿Por qué tratamos sus datos?</h2>
          <p>Nuestra prioridad es la seguridad de los datos de los usuarios. Por ello, únicamente tratamos los datos mínimos imprescindibles para mantener el sitio web. La información recopilada automáticamente se utiliza exclusivamente para identificar posibles casos de abuso y establecer información estadística sobre el uso del sitio web. Esta información estadística no se agrega de manera que permita identificar a ningún usuario concreto.</p>
          <p>Puede visitar el sitio web sin indicarnos quién es ni revelar ninguna información que permita identificarle. Sin embargo, si desea utilizar alguna de las funciones del sitio web, recibir nuestra newsletter o proporcionarnos detalles a través de un formulario, puede que necesite facilitarnos datos personales como su correo electrónico, nombre, apellidos, ciudad de residencia, organización o número de teléfono.</p>
          <p>Puede optar por no facilitarnos sus datos personales, pero en ese caso es posible que no pueda utilizar algunas funciones del sitio web. Los usuarios que tengan dudas sobre qué información es obligatoria pueden contactarnos en <a href="mailto:info@boat-solutions.es">info@boat-solutions.es</a>.</p>

          <h2>Sus derechos</h2>
          <p>Si es residente en el Espacio Económico Europeo, tiene los siguientes derechos en relación con sus datos personales:</p>
          <ul>
            <li>Derecho a ser informado</li>
            <li>Derecho de acceso</li>
            <li>Derecho de rectificación</li>
            <li>Derecho de supresión</li>
            <li>Derecho a la limitación del tratamiento</li>
            <li>Derecho a la portabilidad de los datos</li>
            <li>Derecho de oposición</li>
            <li>Derechos en relación con la toma de decisiones automatizada y la elaboración de perfiles</li>
          </ul>
          <p>Si desea ejercer alguno de estos derechos, póngase en contacto con nosotros a través de la información de contacto que figura al final de este documento.</p>

          <h2>Enlaces a otros sitios web</h2>
          <p>Nuestro sitio web puede contener enlaces a otros sitios web que no son de nuestra propiedad ni están bajo nuestro control. Tenga en cuenta que no somos responsables de las prácticas de privacidad de dichos sitios web ni de terceros. Le recomendamos que esté atento cuando abandone nuestro sitio web y que lea las declaraciones de privacidad de cada sitio que pueda recopilar información personal.</p>

          <h2>Seguridad de la información</h2>
          <p>Protegemos la información que usted nos facilita en servidores informáticos en un entorno controlado y seguro, protegido contra el acceso, uso o divulgación no autorizados. Mantenemos salvaguardias administrativas, técnicas y físicas razonables para proteger contra el acceso no autorizado, el uso, la modificación y la divulgación de datos personales bajo nuestro control y custodia.</p>

          <h2>Divulgación legal</h2>
          <p>Divulgaremos cualquier información que recopilemos, utilicemos o recibamos si así lo exige o permite la ley, por ejemplo, para cumplir una citación u otro proceso legal similar, y cuando creamos de buena fe que la divulgación es necesaria para proteger nuestros derechos, proteger su seguridad o la de otras personas, investigar fraudes o responder a una solicitud gubernamental.</p>

          <h2>Información de contacto</h2>
          <p>Si desea ponerse en contacto con nosotros para obtener más información sobre esta Política o tratar cualquier asunto relacionado con sus derechos individuales y sus datos personales, puede enviarnos un correo electrónico a <a href="mailto:info@boat-solutions.es">info@boat-solutions.es</a>.</p>

          <div class="legal-contact-box">
            <p><strong>Responsable del tratamiento:</strong> Boat Solutions International S.L.</p>
            <p><strong>Email de contacto:</strong> <a href="mailto:info@boat-solutions.es">info@boat-solutions.es</a></p>
            <p><strong>Teléfono:</strong> <a href="tel:+34676625595">+34 676 625 595</a></p>
            <p><strong>Ubicación:</strong> Vigo, Pontevedra, España</p>
          </div>

        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { usePageMeta } from '../composables/useMeta'

usePageMeta({
  es: {
    title: 'Política de Privacidad',
    description: 'Política de privacidad de Boat Solutions International — cómo tratamos tus datos personales.',
  },
  en: {
    title: 'Privacy Policy',
    description: 'Boat Solutions International privacy policy — how we handle your personal data.',
  },
})
</script>

<style scoped>
.hero {
  background: var(--color-meteorite-dark);
  padding: 140px 20px 60px;
}

.hero-content {
  color: var(--color-light);
}

.hero-content h1 {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.hero-content p {
  font-family: var(--font-body);
  opacity: 0.6;
  font-size: 0.9rem;
}

.legal-body {
  max-width: 780px;
  margin: 0 auto;
}

.lead {
  font-size: 1.1rem;
  color: var(--color-dark);
  line-height: 1.8;
  margin-bottom: 24px;
  font-weight: 500;
}

.legal-body h2 {
  font-size: 1.35rem;
  color: var(--color-dark);
  margin-top: 44px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--color-primary-light);
}

.legal-body p {
  color: var(--color-gray);
  line-height: 1.85;
  margin-bottom: 16px;
  font-size: 0.97rem;
}

.legal-body ul {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legal-body li {
  color: var(--color-gray);
  font-size: 0.97rem;
  padding-left: 20px;
  position: relative;
  line-height: 1.6;
}

.legal-body li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--color-primary);
  font-size: 0.85rem;
}

.legal-body a {
  color: var(--color-primary);
  font-weight: 500;
  transition: opacity 0.2s;
}

.legal-body a:hover { opacity: 0.75; }

.legal-contact-box {
  margin-top: 44px;
  background: var(--color-gray-light);
  border-radius: 14px;
  padding: 28px 32px;
  border-left: 4px solid var(--color-primary);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legal-contact-box p {
  margin: 0;
  color: var(--color-dark);
  font-size: 0.93rem;
}
</style>
