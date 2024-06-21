<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-text1">Hogar Santa Luisa de Marillac</div>
      <div class="footer-text2">2024</div>
      <div class="footer-text3">
        Hecho por:<br>
        Pawel R, Pablo V<br>
        Alejandra G, Angely T
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap');

.footer {
  background-color: #f8f9fa; /* Color de fondo del footer */
  padding: 15px 20px;
  display: flex;
  justify-content: center; /* Centra el contenido del footer horizontalmente */
  align-items: center;
  position: fixed;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e7e7e7; /* Línea superior del footer */
  box-shadow: 0 -1px 5px rgba(0,0,0,0.1); /* Añade una sombra para darle profundidad */
  font-family: 'Merriweather', serif; /* Aplica la fuente Merriweather */
}

.footer-content {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px; /* Ajusta el ancho máximo del contenido */
}

.footer-text1, .footer-text2, .footer-text3 {
  flex: 1;
  font-size: 14px;
  color: #555; /* Color del texto */
}

.footer-text1 {
  text-align: left; /* Alinea el texto 1 a la izquierda */
  font-weight: bold;
  font-size: 16px;
}

.footer-text2 {
  text-align: center; /* Alinea el texto 2 al centro */
  font-weight: bold;
  font-size: 16px;
}

.footer-text3 {
  text-align: right; /* Alinea el texto 3 a la derecha */
  line-height: 1.6; /* Espacio entre líneas */
  font-weight: bold;
  font-size: 16px;
}
</style>
