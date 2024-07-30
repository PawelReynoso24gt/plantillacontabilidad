import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import CoreuiVue from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { iconsSet as icons } from '@/assets/icons'
import DocsExample from '@/components/DocsExample'

// Importaciones de Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUser, faLock, faProjectDiagram } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Añade los iconos que usarás a la librería de Font Awesome
library.add(faUser, faLock, faProjectDiagram)

const app = createApp(App)
app.use(store)
app.use(router)
app.use(CoreuiVue)
app.provide('icons', icons)
app.component('CIcon', CIcon)
app.component('DocsExample', DocsExample)

// Registra el componente de Font Awesome globalmente
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
