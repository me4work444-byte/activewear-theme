(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- PRELOADER + HERO SPLIT ---------- */
  const preloader = $("#preloader");
  const heroTitle = $("#heroTitle");

  function splitHero(title) {
    const words = title.split(" ");
    title = words
      .map((word, w) => {
        const chars = word
          .split("")
          .map(
            (ch, i) =>
              `<span class="char${w === 1 ? " char--accent" : ""}" style="--i:${i}">${ch}</span>`
          )
          .join("");
        return `<span class="word">${chars}</span>`;
      })
      .join(" ");
    heroTitle.innerHTML = title;
  }
  if (heroTitle) {
    splitHero("SCULPT STRONGER");
    heroTitle.setAttribute("aria-label", "SCULPT STRONGER");
  }

  window.addEventListener("load", () => {
    setTimeout(() => {
      if (preloader) preloader.classList.add("is-done");
      document.body.style.overflow = "";
    }, 900);
  });

  /* ---------- NAV ---------- */
  const nav = $("#nav");
  const burger = $("#burger");
  const mobileMenu = $("#mobileMenu");

  const onScroll = () => {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 40);
    const hint = $("#scrollHint");
    if (hint) hint.style.opacity = window.scrollY > 160 ? 0 : 1;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (burger && mobileMenu) {
    burger.addEventListener("click", () => {
      const open = !mobileMenu.classList.contains("is-open");
      mobileMenu.classList.toggle("is-open", open);
      burger.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$(".mobile-menu a, .nav__links a, .nav__cta, .nav__logo").forEach((a) =>
      a.addEventListener("click", () => {
        if (innerWidth <= 900) {
          mobileMenu.classList.remove("is-open");
          burger.classList.remove("is-open");
          document.body.style.overflow = "";
        }
      })
    );
  }

  /* ---------- CURSOR ---------- */
  const cursor = $("#cursor");
  const dot = $("#cursorDot");
  if (!reduced && finePointer && cursor && dot) {
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
    });
    (function loop() {
      cx += (mx - cx) * 0.16;
      cy += (my - cy) * 0.16;
      cursor.style.transform = `translate(${cx - 17}px, ${cy - 17}px)`;
      requestAnimationFrame(loop);
    })();

    document.addEventListener("mouseover", (e) => {
      cursor.classList.toggle(
        "is-hover",
        !!e.target.closest("a, button, .tile, .step, input, .bundle__item")
      );
    });
    document.addEventListener("mouseleave", () => cursor.classList.add("is-hidden"));
    document.addEventListener("mouseenter", () => cursor.classList.remove("is-hidden"));
  }

  /* ---------- MAGNETIC ---------- */
  $$(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.22;
      const y = (e.clientY - r.top - r.height / 2) * 0.38;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener("mouseleave", () => (el.style.translate = "0"));
    el.addEventListener("mouseleave", () => (el.style.transform = ""));
  });

  /* ---------- TILT ---------- */
  $$("[data-tilt]").forEach((img) => {
    img.style.transition = "transform 0.3s ease-out";
    img.addEventListener("mousemove", (e) => {
      if (!finePointer) return;
      const r = img.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      img.style.transform = `rotateY(${px * 10}deg) rotateX(${py * -8}deg) scale(1.02)`;
    });
    img.addEventListener("mouseleave", () => (img.style.transform = ""));
  });

  /* ---------- REVEAL ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            entry.target.style.setProperty("--d", `${Math.min(i * 0.09, 0.45)}s`);
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el, i) => {
      if (i % 3 === 0) el.style.setProperty("--d", "0.08s");
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- TYPE SPLIT (product title) ---------- */
  const splitTitles = $$("[data-split]");
  splitTitles.forEach((el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      node.textContent.split("").forEach((ch) => {
        if (ch === " ") {
          frag.appendChild(document.createTextNode(" "));
          return;
        }
        const span = document.createElement("span");
        span.textContent = ch;
        frag.appendChild(span);
      });
      node.parentNode.replaceChild(frag, node);
    });
    $$("span", el).forEach((s, i) => {
      if (!reduced) {
        s.style.transition =
          "opacity .65s cubic-bezier(.22,1,.36,1), transform .65s cubic-bezier(.22,1,.36,1)";
        s.style.transitionDelay = `${i * 0.03}s`;
      }
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("is-split-in");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
  });

  /* ---------- COUNTERS ---------- */
  const counters = $$("[data-count]");
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || "";
        const t0 = performance.now();
        const dur = 1600;
        const tick = (t) => {
          const p = Math.min((t - t0) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * ease) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => countObserver.observe(el));

  /* ---------- QUOTE ---------- */
  const quotes = [
    ["I forgot I was wearing anything. That's the whole review.", "MARA K., SCULPT COLLECTION — NAVY"],
    ["Squat-proof is an understatement. Zero adjustments mid-workout.", "DANI R., LEG DAY DEVOTEE"],
    ["The waistband never rolls. I repeat: never rolls.", "SAM O., HIIT COACH"],
  ];
  const quoteText = $("#quoteText");
  if (quoteText) {
    let qIdx = 0;
    const quoteCite = $(".quote__cite");
    const swap = (dir) => {
      quoteText.classList.add("is-switching");
      setTimeout(() => {
        qIdx = (qIdx + dir + quotes.length) % quotes.length;
        quoteText.textContent = quotes[qIdx][0];
        quoteCite.textContent = quotes[qIdx][1];
        quoteText.classList.remove("is-switching");
      }, 350);
    };
    $$(".quote__btn").forEach((btn) => {
      btn.addEventListener("click", () => swap(parseInt(btn.dataset.dir, 10) || 1));
    });
    setInterval(() => swap(1), 7000);
  }

  /* ---------- FAQ ---------- */
  $$(".faq__item").forEach((item) => {
    const q = $(".faq__q", item);
    q.addEventListener("click", () => {
      const open = item.classList.contains("is-open");
      $$(".faq__item").forEach((other) => other.classList.remove("is-open"));
      if (!open) item.classList.add("is-open");
    });
  });

  /* ---------- PRODUCT SLIDER (autoplay every 3s) ---------- */
  const sliderTrack = $("#sliderTrack");
  if (sliderTrack) {
    const slider = $("#slider");
    const viewport = $("#sliderViewport");
    const slides = $$(".slide", sliderTrack);
    const dotsWrap = $("#sliderDots");
    const countEl = $("#sliderCount");
    let idx = 0;
    let startX = 0;
    let timer = null;

    slides.forEach((_, i) => {
      const d = document.createElement("button");
      d.className = "slider__dot" + (i === 0 ? " is-active" : "");
      d.setAttribute("aria-label", `Image ${i + 1}`);
      d.addEventListener("click", () => go(i));
      dotsWrap.appendChild(d);
    });
    const dots = $$(".slider__dot", dotsWrap);

    const updateAspect = () => {
      const ar = slides[idx].dataset.ar || "2/3";
      viewport.classList.toggle("is-square", ar === "1/1");
    };

    const stopAuto = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    const startAuto = () => {
      stopAuto();
      if (reduced) return;
      timer = setInterval(() => go(idx + 1), 3000);
    };

    function go(i) {
      idx = (i + slides.length) % slides.length;
      sliderTrack.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d, k) => d.classList.toggle("is-active", k === idx));
      if (countEl) countEl.textContent = `0${idx + 1} / 0${slides.length}`;
      updateAspect();
      startAuto();
    }

    // Arrow click handling (mouse/touch)
    $("#sliderPrev").addEventListener("click", (e) => { e.preventDefault(); go(idx - 1); });
    $("#sliderPrev").addEventListener("pointerup", (e) => { e.preventDefault(); go(idx - 1); });
    $("#sliderNext").addEventListener("click", (e) => { e.preventDefault(); go(idx + 1); });
    $("#sliderNext").addEventListener("pointerup", (e) => { e.preventDefault(); go(idx + 1); });
    // Removed bindArrow helper (now using direct handlers)

    document.addEventListener("keydown", (e) => {
      if (!viewport) return;
      const r = viewport.getBoundingClientRect();
      const onScreen = r.top < innerHeight && r.bottom > 0;
      if (!onScreen) return;
      if (e.key === "ArrowLeft") go(idx - 1);
      if (e.key === "ArrowRight") go(idx + 1);
    });

    let wheelLock = 0;
    viewport.addEventListener("wheel", (e) => {
      const now = Date.now();
      if (now - wheelLock < 350) return;
      const dx = e.deltaX;
      const dy = e.deltaY;
      if (Math.abs(dy) > Math.abs(dx)) return;
      if (Math.abs(dx) < 20) return;
      wheelLock = now;
      go(dx < 0 ? idx - 1 : idx + 1);
    }, { passive: true });

    viewport.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".slider__arrow")) return;
      startX = e.clientX;
      viewport.setPointerCapture(e.pointerId);
    });
    viewport.addEventListener("pointerup", (e) => {
      if (e.target.closest(".slider__arrow")) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
    });

    if (slider) {
      slider.addEventListener("pointerenter", stopAuto);
      slider.addEventListener("pointerleave", startAuto);
    }
    startAuto();
  }

  /* ---------- COLOR SWATCHES (selector only — photos stay original) ---------- */
  const swatches = $$(".swatch");
  if (swatches.length) {
    const colorName = $("#colorName");
    swatches.forEach((btn) => {
      btn.addEventListener("click", () => {
        swatches.forEach((b) => b.classList.toggle("is-active", b === btn));
        const color = btn.dataset.color || "navy";
        if (colorName) colorName.textContent = btn.dataset.name || color;
      });
    });
  }

  /* ---------- VIDEO FRAME FIT (kill black bars via real aspect) ---------- */
  $$(".vid__frame").forEach((frame) => {
    const v = $("video", frame);
    if (!v) return;
    const apply = () => {
      if (v.videoWidth && v.videoHeight) {
        frame.style.aspectRatio = `${v.videoWidth} / ${v.videoHeight}`;
      }
    };
    if (v.readyState >= 1) apply();
    v.addEventListener("loadedmetadata", apply);
  });

  /* ---------- SHOPIFY STOREFRONT API CHECKOUT ---------- */
  const SHOPIFY_DOMAIN = 'YOUR-STORE.myshopify.com';
  const STOREFRONT_TOKEN = 'YOUR-STOREFRONT-ACCESS-TOKEN';
  const VARIANT_IDS = { navy: 'PRODUCT-VARIANT-ID-NAVY', red: 'PRODUCT-VARIANT-ID-RED', white: 'PRODUCT-VARIANT-ID-WHITE', black: 'PRODUCT-VARIANT-ID-BLACK' };

  async function addToCartAndCheckout(color, qty) {
    const variantId = VARIANT_IDS[color] || VARIANT_IDS.navy;
    try {
      const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
        },
        body: JSON.stringify({
          query: `mutation cartCreate($input: CartCreateInput!) { cartCreate(input: $input) { cart { id checkoutUrl lines { merchandise { product { title } variant { title } } quantity } } } }`,
          variables: { input: { lines: [{ merchandiseId: variantId, quantity: qty }] } }
        })
      });
      const data = await res.json();
      if (data.data && data.data.cartCreate && data.data.cartCreate.cart) {
        window.location.href = data.data.cartCreate.cart.checkoutUrl;
      } else {
        window.location.href = `https://${SHOPIFY_DOMAIN}/products/sculpt-collection`;
      }
    } catch (e) {
      console.error('Shopify checkout error:', e);
      window.location.href = `https://${SHOPIFY_DOMAIN}/products/sculpt-collection`;
    }
  }

  // Override all checkout links to trigger Shopify checkout
  document.querySelectorAll('a[href^="checkout.html"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const params = new URLSearchParams(link.href.split('?')[1]);
      const qty = parseInt(params.get('qty'), 10) || 1;
      const color = document.querySelector('.swatch.is-active')?.dataset?.color || 'navy';
      addToCartAndCheckout(color, qty);
    });
  });

  // Override Add to cart link
  const addCartLink = document.querySelector('a[href*="add=1"]');
  if (addCartLink) {
    addCartLink.addEventListener('click', (e) => {
      e.preventDefault();
      const params = new URLSearchParams(addCartLink.href.split('?')[1]);
      const qty = parseInt(params.get('qty'), 10) || 1;
      const color = document.querySelector('.swatch.is-active')?.dataset?.color || 'navy';
      addToCartAndCheckout(color, qty);
    });
  }

  // Override bundle buttons
  document.querySelectorAll('.bundle__btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const params = new URLSearchParams(btn.href.split('?')[1]);
      const qty = parseInt(params.get('qty'), 10) || 1;
      const color = document.querySelector('.swatch.is-active')?.dataset?.color || 'navy';
      addToCartAndCheckout(color, qty);
    });
  });

  /* ---------- SHOPIFY BUY BUTTON (checkout.html) ---------- */
  if (location.pathname.includes("checkout.html")) {
    var client = ShopifyBuy.buildClient({
      domain: SHOPIFY_DOMAIN.replace("https://","").replace(".myshopify.com",""),
      storefrontAccessToken: STOREFRONT_TOKEN,
    });
    ShopifyBuy.Button.install(document.getElementById("shopify-buy-container"), {
      client: client,
      productId: "PRODUCT-ID-FROM-SHOPIFY-ADMIN",
      options: {
        product: { layout: "top" },
        cart: { visibility: "hidden" },
        checkout: {
          branch: "buy",
          shipping: { editable: true },
          destination: { allowedCountries: ["US","GB","CA","AU","DE","FR"] }
        },
        modal: { activated: true }
      }
    });
  }

  /* ---------- NEWSLETTER ---------- */
  const form = $("#newsletter");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = $("button", form);
      btn.textContent = "Thanks — welcome in";
      form.querySelector("input").value = "";
      setTimeout(() => (btn.textContent = "Subscribe →"), 2600);
    });
  }

  /* ---------- MOBILE VIEW PREVIEW ---------- */
  (function () {
    if (new URLSearchParams(location.search).get("mv") === "1") return;

    const btn = document.createElement("button");
    btn.id = "mobileViewBtn";
    btn.className = "mv-btn";
    btn.type = "button";
    // Phone SVG icon (simple line phone)
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M16 1H8a2 2 0 00-2 2v18a2 2 0 002 2h8a2 2 0 002-2V3a2 2 0 00-2-2zm-1 20H9v-1h6v1zm0-3H9V4h6v14z"/></svg>';
    // Hide button on mobile devices (auto-detect)
    if (/Mobi|Android|iPhone|iPad|iPod|Tablet|Mobile/i.test(navigator.userAgent)) {
      btn.style.display = 'none';
    }
    // Insert button after the FAQ link in the navigation bar
    const faqLink = document.querySelector('.nav__links a[href="faq.html"]');
    if (faqLink && faqLink.parentNode) {
      faqLink.insertAdjacentElement('afterend', btn);
    } else {
      // Fallback: append to body if FAQ not found
      document.body.appendChild(btn);
    }

    const frame = document.createElement("div");
    frame.id = "mobilePreview";
    frame.innerHTML =
      '<div class="mv__phone">' +
      '<button class="mv__close" type="button" aria-label="Close mobile view">&times;</button>' +
      "<iframe></iframe>" +
      "</div>";
    document.body.appendChild(frame);

    const nextBtn = document.createElement("button");
    nextBtn.id = "mobileViewNext";
    nextBtn.className = "mv-switch";
    nextBtn.type = "button";
    nextBtn.textContent = "Desktop view";
    document.body.appendChild(nextBtn);

    const phoneIframe = frame.querySelector("iframe");
    let inMobile = false;

    const enter = () => {
      const base = location.href.split("?")[0];
      phoneIframe.src = base + "?mv=1";
      frame.classList.add("is-on");
      nextBtn.classList.add("is-on");
      inMobile = true;
      btn.textContent = "Exit mobile";
    };
    const exit = () => {
      frame.classList.remove("is-on");
      nextBtn.classList.remove("is-on");
      inMobile = false;
      btn.textContent = "Mobile view";
    };

    frame.addEventListener("click", (e) => {
      if (e.target === frame) exit();
    });
    frame.querySelector(".mv__close").addEventListener("click", exit);
    nextBtn.addEventListener("click", exit);
    btn.addEventListener("click", () => (inMobile ? exit() : enter()));

    const reload = () => {
      if (inMobile) {
        const base = location.href.split("?")[0];
        phoneIframe.src = base + "?mv=1";
      }
    };
    window.addEventListener("hashchange", reload);
  })();
})();