<template>
  <span v-html="icon" v-inline-svg></span>
</template>

<script setup lang="ts">
import { ref } from 'vue';

/**
 * Components properties
 */
const props = defineProps<{
  /**
   * Icon name, should be one of the names listed on https://github.com/codex-team/icons
   */
  name: string,
}>()

/**
 * Icon svg code to be inserted
 */
const icon = ref('')

/**
 * Custom directive
 *
 * Used to replace <span><svg /></span> with just <svg />
 *  in construction like <span v-html="icon" v-inline-svg></span>
 */
const vInlineSvg = {
  mounted: (element: Element) => element.replaceWith(...element.children)
}

try {
  const icons = await import('@codexteam/icons')
  const iconSource = icons[props.name];

  icon.value = iconSource
} catch {
  console.error(`🛍 CodeX Icons: '${props.name}' doesn't exist in the pack`)
}
</script>
