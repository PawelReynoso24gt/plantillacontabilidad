export default function useNavCapilla() {
  const navConfig = [
    {
      component: 'CNavItem',
      name: 'Inicio',
      to: '/dashboard',
      icon: 'cil-speedometer',
      badge: {
        color: 'primary'
      },
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
          name: 'Egreso Capilla',
          to: '/base/breadcrumbs',
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
          name: 'Ingreso Capilla',
          to: '/buttons/button-groups',
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
          name: 'Deposito de caja Capilla',
          to: '/forms/checks-radios',
        },
        {
          component: 'CNavItem',
          name: 'Retiros de bancos Capilla',
          to: '/forms/range',
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
          name: 'Libro Caja Capilla',
          to: '/forms/input-group',
        },
        {
          component: 'CNavItem',
          name: 'Libro Bancos Capilla',
          to: '/forms/floating-labels',
        },
        {
          component: 'CNavItem',
          name: 'Libro Diario Capilla',
          to: '/forms/layout',
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

  console.log('Nav Config Capilla:', navConfig);
  return navConfig;
}
