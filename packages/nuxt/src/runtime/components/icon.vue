<template>
  <span
    class="cdx-icon"
    :class="class"
    v-html="icon"
    ref="iconWrapper"
  ></span>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { CodexIconName } from '../../types';

/**
 * Components properties
 */
const props = defineProps<{
  /**
   * Icon name, should be one of the names listed on https://github.com/codex-team/icons
   */
  name: CodexIconName,

  /**
   * Optional class names
   */
  class?: string,

  /**
   * Optional size if icon, for example: 20
   */
  size?:  number,
}>()

/**
 * Icon svg code to be inserted
 */
const icon = ref<string>('')

/**
 * Wrapper element reference
 */
const iconWrapper = ref<HTMLElement|null>(null);

/**
 * Map with all icons
 */
const icons = await import('@codexteam/icons')

onMounted(() => {
  try {
    const iconSource = icons[props.name as CodexIconName];

    icon.value = iconSource;

    if (props.size !== undefined && iconWrapper.value !== null) {
      iconWrapper.value.style.setProperty('--size', `${props.size}px`);
    }
  } catch {
    console.error(`🛍 CodeX Icons: '${props.name}' doesn't exist in the pack`)
  }
})
</script>

<style>
.cdx-icon {
  --size: 24px;

  display: inline-flex;
}

.cdx-icon svg {
  width: var(--size);
  height: var(--size);
}
</style>
