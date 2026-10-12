/* About, Services and Blog page behaviour.
   Interactions (tabs, filters, read-more) work without GSAP; scroll animation needs GSAP + ScrollTrigger. */
(function() {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const animate = hasGsap && !reduce;

  /* ---------- About: mission / vision / promise tabs ---------- */
  $$('.swap').forEach(box => {
    const panel = $('.swap-panel', box),
      no = $('.swap-no', panel),
      title = $('h3', panel),
      text = $('p', panel);
    const tabs = $$('.swap-tabs button', box);
    tabs.forEach(tab => tab.addEventListener('click', () => {
      if (tab.classList.contains('on')) return;
      tabs.forEach(t => {
        t.classList.toggle('on', t === tab);
        t.setAttribute('aria-selected', t === tab);
      });
      no.textContent = tab.dataset.no;
      title.textContent = tab.dataset.title;
      text.textContent = tab.dataset.text;
      if (animate) gsap.fromTo([no, title, text], {
        y: 24,
        opacity: 0,
        filter: 'blur(8px)'
      }, {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: .6,
        stagger: .08,
        ease: 'power3.out'
      });
    }));
  });

  /* ---------- Services: auto-playing explorer ---------- */
  const tabs = $$('.xt'),
    panes = $$('.xp-pane');
  if (tabs.length) {
    const show = i => {
      tabs.forEach((t, k) => {
        t.classList.toggle('on', k === i);
        t.setAttribute('aria-selected', k === i);
        t.tabIndex = k === i ? 0 : -1;
        const bar = $('i', t);
        bar.style.animation = 'none';
        void bar.offsetWidth;
        bar.style.animation = ''; // restart progress bar
      });
      panes.forEach((p, k) => {
        p.classList.toggle('on', k === i);
        p.hidden = k !== i;
      });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => show(i));
      $('i', t).addEventListener('animationend', () => show((i + 1) % tabs.length)); // next service when the bar fills
      t.addEventListener('keydown', e => {
        const d = {
          ArrowDown: 1,
          ArrowRight: 1,
          ArrowUp: -1,
          ArrowLeft: -1
        } [e.key];
        if (d) {
          e.preventDefault();
          const n = (i + d + tabs.length) % tabs.length;
          show(n);
          tabs[n].focus();
        }
      });
    });
    show(0);
  }

  /* ---------- Blog: topic filter + read more ---------- */
  const chips = $$('.fchip'),
    posts = $$('.bp');
  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => {
      c.classList.toggle('on', c === chip);
      c.setAttribute('aria-pressed', c === chip);
    });
    const f = chip.dataset.f,
      shown = [];
    posts.forEach(p => {
      const match = f === 'all' || p.dataset.cat === f;
      p.hidden = !match;
      if (match) shown.push(p);
    });
    $('#fcount').textContent = 'Showing ' + shown.length + (shown.length === 1 ? ' article' : ' articles');
    if (animate) gsap.fromTo(shown, {
      y: 40,
      opacity: 0,
      scale: .94
    }, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: .5,
      stagger: .07,
      ease: 'power3.out',
      overwrite: true,
      clearProps: 'transform'
    });
  }));
  $$('[data-read]').forEach(btn => {
    const box = btn.nextElementSibling,
      label = btn.textContent;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open);
      btn.textContent = open ? 'Show less' : label;
      if (hasGsap) gsap.to(box, {
        height: open ? 'auto' : 0,
        duration: .5,
        ease: 'power3.inOut'
      });
      else box.style.height = open ? 'auto' : '0';
    });
  });

  if (!animate) return;

  /* ---------- Scroll animation ---------- */
  /* children of [data-stagger] pop in one after another */
  $$('[data-stagger]').forEach(box => gsap.from(box.children, {
    y: 50,
    scale: .92,
    opacity: 0,
    duration: .8,
    stagger: .1,
    ease: 'power3.out',
    clearProps: 'transform,opacity',
    scrollTrigger: {
      trigger: box,
      start: 'top 82%'
    }
  }));

  /* About: the zig-zag line draws as you scroll, milestones slide in from alternate sides */
  $$('.zz').forEach(zz => {
    gsap.to($('.zz-line i', zz), {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: zz,
        start: 'top 60%',
        end: 'bottom 70%',
        scrub: true
      }
    });
    $$('.zi', zz).forEach(item => gsap.from(item, {
      x: item.classList.contains('r') ? 80 : -80,
      opacity: 0,
      duration: .9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 85%'
      }
    }));
  });

  /* Services: the roll-out line fills and the numbered steps pop */
  $$('.fl').forEach(fl => {
    gsap.to($('.fl-line i', fl), {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: fl,
        start: 'top 70%',
        end: 'bottom 70%',
        scrub: true
      }
    });
    gsap.from($$('.fs', fl), {
      y: 40,
      opacity: 0,
      duration: .7,
      stagger: .18,
      ease: 'back.out(1.6)',
      scrollTrigger: {
        trigger: fl,
        start: 'top 80%'
      }
    });
  });

  /* Blog: featured shapes drift with scroll; cards rise as they enter */
  $$('.fa span').forEach((s, i) => gsap.to(s, {
    y: (i + 1) * -40,
    ease: 'none',
    scrollTrigger: {
      trigger: '.feat',
      scrub: true,
      start: 'top bottom',
      end: 'bottom top'
    }
  }));
  if (posts.length) {
    gsap.set(posts, {
      opacity: 0,
      y: 60
    });
    ScrollTrigger.batch(posts, {
      start: 'top 92%',
      once: true,
      onEnter: batch => gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: .7,
        stagger: .12,
        ease: 'power3.out',
        overwrite: 'auto',
        clearProps: 'transform'
      })
    });
  }
})();