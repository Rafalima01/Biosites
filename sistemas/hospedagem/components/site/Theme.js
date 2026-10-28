/** Aplica as cores escolhidas no painel (Configurações > Personalização). */
export function Theme({ theme }) {
  const safe = (c, fallback) => (/^#[0-9a-f]{3,8}$/i.test(c || '') ? c : fallback);
  const primary = safe(theme.primary, '#0f4352');
  const accent = safe(theme.accent, '#d9654c');
  const bg = safe(theme.background, '#f6f1e9');
  const css = `:root{--ocean:${primary};--sea:color-mix(in srgb,${primary} 72%,#4fb3c8);--sea-soft:color-mix(in srgb,${primary} 11%,#fff);--coral:${accent};--coral-soft:color-mix(in srgb,${accent} 14%,#fff);--color-bg:${bg};--color-text:color-mix(in srgb,${primary} 55%,#000)}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
