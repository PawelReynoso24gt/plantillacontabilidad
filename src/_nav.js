export default function useNavAgricola() {
  const navConfig = [
  {
    component: 'CNavItem',
    name: 'Inicio',
    to: '/theme/colors',
    icon: 'cil-drop',
  },
    {
      component: 'CNavTitle',
      name: 'Acciones',
    },
    {
      component: 'CNavGroup',
      name: 'Egresos',
      to: '/base',
      icon: 'cilCart',
      items: [
        {
          component: 'CNavItem',
          name: 'Egreso Agrícola',
          to: '/base/accordion',
        }
      ],
    },
    {
      component: 'CNavGroup',
      name: 'Ingresos',
      to: '/buttons',
      icon: 'cilCash',
      items: [
        {
          component: 'CNavItem',
          name: 'Ingreso Agrícola',
          to: '/buttons/standard-buttons',
        }
      ],
    },
    {
      component: 'CNavGroup',
      name: 'Traslados Internos',
      to: '/forms',
      icon: 'cil-notes',
      items: [
        {
          component: 'CNavItem',
          name: 'Deposito de caja Agrícola',
          to: '/forms/form-control',
        },
        {
          component: 'CNavItem',
          name: 'Retiros de bancos Agrícola',
          to: '/forms/select',
        }
      ],
    },
    {
      component: 'CNavGroup',
      name: 'Informes',
      to: '/icons',
      icon: 'cil-star',
      items: [
        {
          component: 'CNavItem',
          name: 'Libro Caja Agrícola',
          to: '/icons/coreui-icons',
          badge: {
            color: 'info'
          },
        },
        {
          component: 'CNavItem',
          name: 'Libro Bancos Agrícola',
          to: '/icons/brands',
        },
        {
          component: 'CNavItem',
          name: 'Libro Diario Agrícola',
          to: '/icons/flags',
        },
      ],
    },
    {
      component: 'CNavGroup',
      name: 'CRUDS Simples',
      to: '/notifications',
      icon: 'cil-bell',
      items: [
        {
          component: 'CNavItem',
          name: 'Login',
          to: '/notifications/alerts',
        },
        {
          component: 'CNavItem',
          name: 'Proyectos',
          to: '/notifications/badges',
        },
        {
          component: 'CNavItem',
          name: 'Bancos',
          to: '/notifications/modals',
        },
        {
          component: 'CNavItem',
          name: 'Clasificacion',
          to: '/notifications/toasts',
        },
        {
          component: 'CNavItem',
          name: 'Cuentas',
          to: '/notifications/cuentas',
        },
      ],
    },
  ];

  console.log('Nav Config Agrícola:', navConfig);
  return navConfig;
}
