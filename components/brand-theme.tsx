'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

function hexToHsl(hex: string): string | null {
  const m = hex.replace('#', '');
  if (m.length !== 6) return null;
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function readableForeground(hsl: string): string {
  const [h, s, l] = hsl.split(' ').map((p) => parseFloat(p));
  return l > 55 ? '170 40% 12%' : '40 20% 99%';
}

export function BrandTheme() {
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['theme_primary', 'theme_accent']);
      if (!mounted || !data || data.length === 0) return;

      const map: Record<string, string> = {};
      data.forEach((s) => { if (s.value) map[s.key] = s.value; });

      const root = document.documentElement;
      const primaryHex = map.theme_primary;
      const accentHex = map.theme_accent;
      const vars: string[] = [];

      if (primaryHex) {
        const hsl = hexToHsl(primaryHex);
        if (hsl) {
          root.style.setProperty('--primary', hsl);
          root.style.setProperty('--ring', hsl);
          root.style.setProperty('--primary-foreground', readableForeground(hsl));
          vars.push(`--primary: ${hsl}; --ring: ${hsl}; --primary-foreground: ${readableForeground(hsl)};`);
        }
      }
      if (accentHex) {
        const hsl = hexToHsl(accentHex);
        if (hsl) {
          root.style.setProperty('--accent', hsl);
          root.style.setProperty('--accent-foreground', readableForeground(hsl));
          vars.push(`--accent: ${hsl}; --accent-foreground: ${readableForeground(hsl)};`);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  return null;
}
