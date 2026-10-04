/** Keys that move the highlight inside a vertical menu. */
export type MenuKey = 'ArrowDown' | 'ArrowUp' | 'Home' | 'End';

export function isMenuKey(key: string): key is MenuKey {
  return key === 'ArrowDown' || key === 'ArrowUp' || key === 'Home' || key === 'End';
}

/** Index highlighted after `key` in a menu of `count` options; the arrows wrap around at both ends. */
export function nextMenuIndex(current: number, key: MenuKey, count: number): number {
  if (count <= 0) return -1;
  switch (key) {
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    case 'ArrowDown':
      return (current + 1 + count) % count;
    case 'ArrowUp':
      return (current - 1 + count) % count;
  }
}
