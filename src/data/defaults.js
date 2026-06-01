// ─── DEFAULT SEEDS ────────────────────────────────────────────────────
// Austin's personal presets + reasonable generic fallbacks.
// All IDs are stable strings so storage can reference them.

export const TIMER_COLORS = [
  { key: 'sage',   value: '#7B9E87', label: 'Sage'   },
  { key: 'slate',  value: '#7B8FA1', label: 'Slate'  },
  { key: 'amber',  value: '#C9974A', label: 'Amber'  },
  { key: 'rose',   value: '#C47A7A', label: 'Rose'   },
  { key: 'violet', value: '#8B7BB5', label: 'Violet' },
  { key: 'teal',   value: '#5B9EA0', label: 'Teal'   },
  { key: 'sand',   value: '#C4A882', label: 'Sand'   },
  { key: 'moss',   value: '#8A9A5B', label: 'Moss'   },
];

// Icon keys map to lucide-svelte component names
export const TIMER_ICONS = [
  { key: 'Sunrise',     label: 'Sunrise'     },
  { key: 'Flame',       label: 'Flame'       },
  { key: 'Dumbbell',    label: 'Dumbbell'    },
  { key: 'Palette',     label: 'Palette'     },
  { key: 'Briefcase',   label: 'Briefcase'   },
  { key: 'Coffee',      label: 'Coffee'      },
  { key: 'BookOpen',    label: 'Reading'     },
  { key: 'Music',       label: 'Music'       },
  { key: 'Leaf',        label: 'Nature'      },
  { key: 'Moon',        label: 'Rest'        },
  { key: 'Heart',       label: 'Health'      },
  { key: 'Star',        label: 'Goals'       },
  { key: 'Home',        label: 'Home'        },
  { key: 'PenLine',     label: 'Writing'     },
  { key: 'Timer',       label: 'Timer'       },
  { key: 'Zap',         label: 'Energy'      },
  { key: 'Wind',        label: 'Breathe'     },
  { key: 'Mountain',    label: 'Outdoors'    },
  { key: 'Utensils',    label: 'Meals'       },
  { key: 'Laptop',      label: 'Computer'    },
  { key: 'Phone',       label: 'Phone'       },
  { key: 'Users',       label: 'Social'      },
  { key: 'Globe',       label: 'Learning'    },
  { key: 'Sparkles',    label: 'Spiritual'   },
];

// ── Timer definitions ─────────────────────────────────────────────────
export const DEFAULT_TIMERS = {
  // Summer preset timers
  't-spiritual':  { id: 't-spiritual',  name: 'Spiritual',  iconKey: 'Sparkles',   color: '#7B9E87', durationSec: 1800, createdAt: '', updatedAt: '' },
  't-housework':  { id: 't-housework',  name: 'Housework',  iconKey: 'Home',       color: '#C4A882', durationSec: 3600, createdAt: '', updatedAt: '' },
  't-fitness':    { id: 't-fitness',    name: 'Fitness',    iconKey: 'Dumbbell',   color: '#C9974A', durationSec: 2700, createdAt: '', updatedAt: '' },
  't-creativity': { id: 't-creativity', name: 'Creativity', iconKey: 'Palette',    color: '#8B7BB5', durationSec: 3600, createdAt: '', updatedAt: '' },
  't-work':       { id: 't-work',       name: 'Work',       iconKey: 'Briefcase',  color: '#7B8FA1', durationSec: 7200, createdAt: '', updatedAt: '' },
  't-relax':      { id: 't-relax',      name: 'Relax',      iconKey: 'Coffee',     color: '#5B9EA0', durationSec: 1800, createdAt: '', updatedAt: '' },
  // Work-day extra
  't-reading':    { id: 't-reading',    name: 'Reading',    iconKey: 'BookOpen',   color: '#8A9A5B', durationSec: 1800, createdAt: '', updatedAt: '' },
  // Weekend extra
  't-leisure':    { id: 't-leisure',    name: 'Leisure',    iconKey: 'Music',      color: '#C47A7A', durationSec: 3600, createdAt: '', updatedAt: '' },
};

// ── Preset definitions ────────────────────────────────────────────────
export const DEFAULT_PRESETS = [
  {
    id: 'p-summer',
    name: 'Summer',
    iconKey: 'Sunrise',
    timerIds: ['t-spiritual', 't-housework', 't-fitness', 't-creativity', 't-work', 't-relax'],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'p-workday',
    name: 'Work-day',
    iconKey: 'Briefcase',
    timerIds: ['t-spiritual', 't-work', 't-fitness', 't-housework', 't-reading', 't-relax'],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'p-weekend',
    name: 'Weekend',
    iconKey: 'Coffee',
    timerIds: ['t-fitness', 't-creativity', 't-housework', 't-relax', 't-spiritual', 't-leisure'],
    createdAt: '',
    updatedAt: '',
  },
];

export const DEFAULT_ACTIVE_PRESET_ID = 'p-summer';

// Grid column counts by timer count
export const GRID_COLS = {
  1: 1, 2: 2, 3: 3, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4
};
