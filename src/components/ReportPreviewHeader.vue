<template>
  <div class="rp-wrapper">
    <div class="rp-topbar"></div>
    <div class="rp-card">
      <div class="rp-left">
        <img :src="logo" alt="Logo" class="rp-logo" />
        <div class="rp-left-text">
          <div class="rp-empresa">{{ empresa }}</div>
          <div v-if="subtitulo" class="rp-subtitulo">{{ subtitulo }}</div>
        </div>
      </div>

      <div class="rp-divider"></div>

      <div class="rp-right">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import defaultLogo from '@/assets/images/avatars/10.jpg';

export default {
  name: 'ReportPreviewHeader',
  props: {
    empresa: {
      type: String,
      default: '',
    },
    subtitulo: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: defaultLogo,
    },
  },
};
</script>

<style scoped>
.rp-wrapper {
  margin-top: 0.5rem;
  margin-bottom: 0.75rem;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #bd9f69;
}

.rp-topbar {
  height: 6px;
  background: #2a2c63;
}

.rp-card {
  background: var(--cui-card-bg);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: stretch;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.rp-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.6rem 1rem;
  border: 1px solid #bd9f69;
  border-radius: 10px;
  background: var(--cui-tertiary-bg);
  flex: 1 1 320px;
}

.rp-logo {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 50%;
  border: 2px solid #bd9f69;
  object-fit: cover;
}

.rp-left-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.rp-empresa {
  font-size: 1rem;
  font-weight: 700;
  color: var(--cui-body-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rp-subtitulo {
  font-size: 0.82rem;
  color: var(--cui-secondary-color);
}

.rp-divider {
  width: 1px;
  align-self: stretch;
  background: var(--cui-border-color);
}

.rp-right {
  flex: 1 1 320px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  color: var(--cui-body-color);
  min-width: 0;
}

.rp-right :deep(strong) {
  color: #2a2c63;
}

.rp-right :deep(.rp-value) {
  color: #bd9f69;
  font-weight: 600;
}

@media (max-width: 768px) {
  .rp-card {
    flex-direction: column;
  }

  .rp-divider {
    width: 100%;
    height: 1px;
  }
}
</style>
