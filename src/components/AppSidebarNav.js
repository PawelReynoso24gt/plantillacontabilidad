import { defineComponent, h, onMounted, ref, resolveComponent, computed, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { CBadge, CSidebarNav, CNavItem, CNavGroup, CNavTitle } from '@coreui/vue';
import simplebar from 'simplebar-vue';
import 'simplebar-vue/dist/simplebar.min.css';
import useNavAgricola from '../_nav';
import useNavCapilla from '../_nav2';

const normalizePath = (path) =>
  decodeURI(path)
    .replace(/#.*$/, '')
    .replace(/(index)?\.(html)$/, '');

const isActiveLink = (route, link) => {
  if (!link) return false;
  if (route.hash === link) return true;

  const currentPath = normalizePath(route.path);
  const targetPath = normalizePath(link);

  return currentPath === targetPath;
};

const isActiveItem = (route, item) => {
  if (isActiveLink(route, item.to)) return true;
  if (item.items) {
    return item.items.some((child) => isActiveItem(route, child));
  }
  return false;
};

const AppSidebarNav = defineComponent({
  name: 'AppSidebarNav',
  components: {
    CNavItem,
    CNavGroup,
    CNavTitle,
  },
  setup() {
    const store = useStore();
    const selectedProject = computed(() => store.state.selectedProject);
    const projectToken = computed(() => store.state.projectToken);
    const navConfig = ref([]);

    const updateNavConfig = () => {
      if (projectToken.value === '1') {
        navConfig.value = useNavAgricola();
      } else if (projectToken.value === '2') {
        navConfig.value = useNavCapilla();
      } else {
        navConfig.value = [];
      }
    };

    watch([selectedProject, projectToken], updateNavConfig, { immediate: true });

    const route = useRoute();
    const firstRender = ref(true);

    onMounted(() => {
      firstRender.value = false;
    });

    const renderItem = (item) => {
      if (!item.to && !item.items && item.component !== 'CNavTitle') {
        console.error('El item de navegación no tiene una propiedad "to" ni items anidados:', item);
        return null;
      }

      if (item.component === 'CNavTitle') {
        return h(CNavTitle, {}, { default: () => item.name });
      }

      if (item.items) {
        return h(
          CNavGroup,
          {
            as: 'div',
            compact: true,
            visible: firstRender.value && item.items.some((child) => isActiveItem(route, child)),
          },
          {
            togglerContent: () => [
              item.icon ? h(resolveComponent('CIcon'), { customClassName: 'nav-icon', name: item.icon }) : null,
              item.name,
            ],
            default: () => item.items.map(renderItem),
          },
        );
      }

      return h(
        RouterLink,
        {
          to: item.to,
          custom: true,
        },
        {
          default: (props) =>
            h(
              resolveComponent(item.component),
              {
                active: props.isActive,
                as: 'div',
                href: props.href,
                onClick: () => props.navigate(),
              },
              {
                default: () => [
                  item.icon
                    ? h(resolveComponent('CIcon'), { customClassName: 'nav-icon', name: item.icon })
                    : h('span', { class: 'nav-icon' }, h('span', { class: 'nav-icon-bullet' })),
                  item.name,
                  item.badge
                    ? h(CBadge, { class: 'ms-auto', color: item.badge.color }, { default: () => item.badge.text })
                    : null,
                ],
              },
            ),
        },
      );
    };

    return () => h(CSidebarNav, { as: simplebar }, { default: () => navConfig.value.length ? navConfig.value.map(renderItem) : null });
  },
});

export default AppSidebarNav;
