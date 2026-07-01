/**
 * ThemeScript — sem "use client".
 * Renderizado no <head> como Server Component puro; executa antes da hidratação
 * para evitar flash de tema. Também migra a chave antiga "theme" → "squad-theme".
 */
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){
  try {
    if (!localStorage.getItem('squad-theme') && localStorage.getItem('theme')) {
      localStorage.setItem('squad-theme', localStorage.getItem('theme'));
      localStorage.removeItem('theme');
    }
    var t = localStorage.getItem('squad-theme') || 'system';
    var f = localStorage.getItem('squad-frame-theme') !== 'false';
    var d = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (d) document.documentElement.classList.add('dark');
    if (f) document.documentElement.classList.add('frame');
  } catch(e) {}
})()`,
      }}
    />
  );
}
