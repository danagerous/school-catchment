<template>
  <nav class="navbar-top">
    <div class="navbar-content">
      <div class="navbar-brand">
        <img src="/images/logo_sd8.png" alt="Kootenay Lake School District" class="logo" />
        <span>Catchment Areas</span>
      </div>
      <Button
        label="Filters"
        @click="$emit('toggle-filters')"
        outlined
        size="small"
      />
    </div>
  </nav>
  <nav class="navbar-bottom">
    <div class="navbar-content">
      <Button
        label="About"
        @click="$emit('toggle-about')"
        severity="info"
        size="small"
      />
    </div>
  </nav>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'toggle-filters'): void
  (e: 'toggle-about'): void
}>()
</script>

<style scoped>
.navbar-top {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  z-index: 999;
}

.navbar-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 45px;
  background-color: #f8f9fa;
  border-top: 1px solid rgba(0, 0, 0, 0.125);
  z-index: 999;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  height: 100%;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.logo {
  height: 46px;
}

@media (max-width: 576px) {
  .navbar-brand span {
    font-size: 0.9rem;
  }
}
</style>
