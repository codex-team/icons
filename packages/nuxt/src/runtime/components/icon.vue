<template>
  <span
    class="cdx-icon"
    :class="class"
    v-html="icon"
    :style="style"
  ></span>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { CodexIconName } from '../../types';
/**
 * Map with all icons
 */
import * as icons from '@codexteam/icons';

/**
 * Components properties
 */
const props = withDefaults(defineProps<{
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
}>(), {
  size: 24
})

/**
 * Icon svg code to be inserted
 */
const icon = ref<string>('')

let iconList: Record<CodexIconName, string>;

/**
 * Workaround SSR problem when "import * as icons from '@codexteam/icons'" wraps with { default: ... }
 */
if ('default' in icons){
  iconList = (icons as unknown as {default: Record<CodexIconName, string>}).default;
} else {
  iconList = icons;
}

/**
 * Pass size variable to the CSS
 */
const style = computed(() => {
  return `--size: ${props.size}px`;
})

icon.value = iconList[props.name as CodexIconName];
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
