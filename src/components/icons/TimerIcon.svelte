<script>
  // Dynamic icon renderer — maps iconKey strings to lucide-svelte components.
  // Adding a new icon: import it here and add to the map.
  import {
    Sunrise, Flame, Dumbbell, Palette, Briefcase, Coffee,
    BookOpen, Music, Leaf, Moon, Heart, Star, Home,
    PenLine, Timer, Zap, Wind, Mountain, Utensils, Laptop,
    Phone, Users, Globe, Sparkles
  } from '@lucide/svelte';

  let { iconKey = 'Timer', size = 20, color = 'currentColor', strokeWidth = 1.5 } = $props();

  const ICONS = {
    Sunrise, Flame, Dumbbell, Palette, Briefcase, Coffee,
    BookOpen, Music, Leaf, Moon, Heart, Star, Home,
    PenLine, Timer, Zap, Wind, Mountain, Utensils, Laptop,
    Phone, Users, Globe, Sparkles,
  };

  let Icon = $derived(ICONS[iconKey] ?? Timer);
</script>

<Icon {size} {color} strokeWidth={strokeWidth} />
