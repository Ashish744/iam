/* Form validation + demo authentication (login, create account, contact, settings). */
(function() {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* Each validator returns '' when valid, otherwise the error message */
  const V = {
    name: v => /^[A-Za-z]+$/.test(v.trim()) ? '' : 'Please use letters only (no numbers or special characters).',
    email: v => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
    password: v => v.length >= 8 ? '' : 'Password must contain at least 8 characters.',
    required: v => v.trim() ? '' : 'This field is required.'
  };

  function mark(field, msg) {
    field.classList.toggle('bad', !!msg);
    field.classList.toggle('ok', !msg);
    $('.err', field).textContent = msg;
    if (msg && typeof gsap !== 'undefined') gsap.fromTo(field, {
      x: -6
    }, {
      x: 0,
      duration: .4,
      ease: 'elastic.out(1,.3)'
    });
    return !msg;
  }

  function check(field) {
    const input = $('input,textarea', field),
      type = input.dataset.v;
    if (!type) return true;
    let msg = V.required(input.value);
    if (!msg) msg = type === 'confirm' ? (input.value === $('#password').value ? '' : 'Passwords do not match.') : V[type](input.value);
    return mark(field, msg);
  }

  /* Authentication service: replace these methods with real API calls later */
  const AuthService = {
    async login({
      role
    }) {
      return {
        ok: true,
        role,
        token: 'demo-' + Date.now()
      };
    },
    async register(user) {
      try {
        localStorage.setItem('stackly_user', JSON.stringify({
          email: user.email,
          role: user.role
        }));
      } catch (e) {
        /* storage unavailable */ }
      return {
        ok: true
      };
    }
  };

  const form = $('form[data-form]');
  if (!form) return;
  const kind = form.dataset.form;
  const needRole = !['contact', 'settings', 'newsletter'].includes(kind);
  let role = '';

  /* Admin / Public selection */
  $$('.role').forEach(btn => btn.addEventListener('click', () => {
    role = btn.dataset.role;
    $$('.role').forEach(b => {
      b.classList.toggle('on', b === btn);
      b.setAttribute('aria-pressed', b === btn);
    });
    $('#roleErr').textContent = '';
    if (typeof gsap !== 'undefined') gsap.fromTo(btn, {
      scale: .93
    }, {
      scale: 1,
      duration: .5,
      ease: 'back.out(3)'
    });
  }));

  /* Live validation: on blur, then on every keystroke once a field has been checked */
  $$('.fld', form).forEach(field => {
    const input = $('input,textarea', field);
    if (!input || !input.dataset.v) return;
    input.addEventListener('blur', () => check(field));
    input.addEventListener('input', () => {
      if (field.classList.contains('bad') || field.classList.contains('ok')) check(field);
      /* changing the password re-checks an already-filled confirm field */
      if (input.id === 'password') {
        const c = $('#confirm');
        if (c && c.value) check(c.closest('.fld'));
      }
    });
  });

  /* Show / Hide password */
  $$('.pw button').forEach(btn => btn.addEventListener('click', () => {
    const input = btn.previousElementSibling,
      hidden = input.type === 'password';
    input.type = hidden ? 'text' : 'password';
    btn.textContent = hidden ? 'Hide' : 'Show';
    btn.setAttribute('aria-label', hidden ? 'Hide password' : 'Show password');
  }));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const allValid = $$('.fld', form).map(check).every(Boolean); // map first so every field shows its error
    if (needRole && !role) {
      $('#roleErr').textContent = 'Choose Admin or Public to continue.';
      if (typeof gsap !== 'undefined') gsap.fromTo('.roles', {
        x: -8
      }, {
        x: 0,
        duration: .5,
        ease: 'elastic.out(1,.3)'
      });
      return;
    }
    if (!allValid) return;

    const data = Object.fromEntries(new FormData(form));
    data.role = role;

    if (kind === 'login') {
      const res = await AuthService.login(data);
      if (res.ok) {
        try {
          sessionStorage.setItem('stackly_role', res.role);
        } catch (err) {
          /* ignore */ }
        location.href = res.role === 'admin' ? 'admin-dashboard.html' : 'public-dashboard.html';
      }
    } else if (kind === 'register') {
      await AuthService.register(data);
      form.style.display = 'none';
      const ok = $('.ok-msg');
      ok.style.display = 'block';
      if (typeof gsap !== 'undefined') gsap.from(ok, {
        scale: .6,
        opacity: 0,
        duration: .8,
        ease: 'back.out(2)'
      });
      setTimeout(() => location.href = 'login.html', 2200);
    } else { // contact + settings: show inline confirmation for 2s before clearing the form
      const ok = $('.ok-msg.inline', form);
      ok.style.display = 'block';
      if (typeof gsap !== 'undefined') gsap.from(ok, {
        y: 10,
        opacity: 0
      });

      setTimeout(() => {
        form.reset();
        $$('.fld', form).forEach(f => {
          f.classList.remove('ok', 'bad');
          const err = $('.err', f);
          if (err) err.textContent = '';
        });
        ok.style.display = 'none';
      }, 2000);
    }
  });
})();