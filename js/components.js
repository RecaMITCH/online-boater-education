function renderHeader(activePage) {
  const nav = [
    { label: 'Home', href: '/', id: 'home' },
    { label: 'States', href: '/states', id: 'states' },
    { label: 'About', href: '/about', id: 'about' },
    { label: 'FAQ', href: '/faq', id: 'faq' },
  ];

  const links = nav.map(n =>
    `<a href="${n.href}" class="text-sm font-medium transition-colors ${n.id === activePage ? 'text-sky-400' : 'text-white/80 hover:text-white'}">${n.label}</a>`
  ).join('');

  const mobileLinks = nav.map(n =>
    `<a href="${n.href}" class="block px-4 py-3 text-base font-medium transition-colors ${n.id === activePage ? 'text-sky-400 bg-white/5' : 'text-white/80 hover:text-white hover:bg-white/5'}">${n.label}</a>`
  ).join('');

  return `
  <header class="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <a href="/" class="flex items-center gap-2">
          <svg class="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 17h1l1-2h2l1 2h1l2-4h2l2 4h1l1-2h2l1 2h1M5 21h14M12 3C8 3 4 6 4 10c0 2 1 3 2 4h12c1-1 2-2 2-4 0-4-4-7-8-7z"/>
          </svg>
          <span class="text-lg font-bold text-white tracking-tight">OnlineBoaterEducation<span class="text-sky-400">.com</span></span>
        </a>
        <nav class="hidden md:flex items-center gap-8">
          ${links}
          <a href="https://recademics.com" class="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-sky-500/25 hover:shadow-sky-400/30">
            Start Your Course
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
          </a>
        </nav>
        <button id="mobile-menu-btn" class="md:hidden text-white p-2" aria-label="Menu">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
    </div>
    <div id="mobile-menu" class="hidden md:hidden border-t border-white/10 bg-slate-900/98">
      ${mobileLinks}
      <div class="p-4">
        <a href="https://recademics.com" class="block text-center bg-sky-500 hover:bg-sky-400 text-white font-semibold px-5 py-3 rounded-lg transition-all">Start Your Course</a>
      </div>
    </div>
  </header>`;
}

function renderFooter() {
  return `
  <footer class="bg-slate-900 text-white/70 border-t border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div class="md:col-span-1">
          <a href="/" class="flex items-center gap-2 mb-4">
            <svg class="w-7 h-7 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 17h1l1-2h2l1 2h1l2-4h2l2 4h1l1-2h2l1 2h1M5 21h14M12 3C8 3 4 6 4 10c0 2 1 3 2 4h12c1-1 2-2 2-4 0-4-4-7-8-7z"/>
            </svg>
            <span class="text-base font-bold text-white">OnlineBoaterEducation<span class="text-sky-400">.com</span></span>
          </a>
          <p class="text-sm leading-relaxed">Your trusted source for state-approved online boater safety education courses.</p>
        </div>
        <div>
          <h4 class="text-white font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="/states" class="hover:text-white transition-colors">Find Your State</a></li>
            <li><a href="/about" class="hover:text-white transition-colors">About Us</a></li>
            <li><a href="/faq" class="hover:text-white transition-colors">FAQ</a></li>
            <li><a href="https://recademics.com" class="hover:text-white transition-colors">Start a Course</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold text-sm uppercase tracking-wider mb-4">Popular States</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="/states/florida" class="hover:text-white transition-colors">Florida</a></li>
            <li><a href="/states/texas" class="hover:text-white transition-colors">Texas</a></li>
            <li><a href="/states/california" class="hover:text-white transition-colors">California</a></li>
            <li><a href="/states/michigan" class="hover:text-white transition-colors">Michigan</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold text-sm uppercase tracking-wider mb-4">Support</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="mailto:support@onlineboatereducation.com" class="hover:text-white transition-colors">Email Support</a></li>
            <li><a href="/faq" class="hover:text-white transition-colors">Help Center</a></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p class="text-xs">&copy; ${new Date().getFullYear()} OnlineBoaterEducation.com &mdash; A <a href="https://recademics.com" class="text-sky-400 hover:text-sky-300">Recademics</a> Property</p>
        <div class="flex gap-6 text-xs">
          <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page || 'home';
  const headerEl = document.getElementById('site-header');
  const footerEl = document.getElementById('site-footer');
  if (headerEl) headerEl.innerHTML = renderHeader(page);
  if (footerEl) footerEl.innerHTML = renderFooter();
  document.addEventListener('click', (e) => {
    if (e.target.closest('#mobile-menu-btn')) {
      document.getElementById('mobile-menu')?.classList.toggle('hidden');
    }
  });
});
