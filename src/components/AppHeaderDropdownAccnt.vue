<template>
  <CDropdown placement="bottom-end" variant="nav-item">
    <CDropdownToggle class="py-0 pe-0" :caret="false">
      <CAvatar :src="avatar" size="md" />
    </CDropdownToggle>
    <CDropdownMenu class="pt-0">
      <CDropdownItem  @click="logout">
        <CIcon icon="cil-lock-locked" /> Logout
      </CDropdownItem>
    </CDropdownMenu>
  </CDropdown>
</template>

<script>
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import avatar from '@/assets/images/avatars/10.jpg'
export default {
  name: 'AppHeaderDropdownAccnt',
  setup() {
    const router = useRouter();
    const store = useStore();
    const avatarSrc = avatar;
    
    const logout = () => {
      store.dispatch('logout'); // Asegúrate de tener una acción de logout en tu store
      router.push({ name: 'Login' }); 
    };

    return {
      avatar: avatar,
      itemsCount: 42,
      logout
    }
  },
}
</script>
