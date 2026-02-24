
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { translations } from './translations';
import { PLAYER_DATA } from './data';
import { 
  Language, Category, SubSport, SubCategory, Year, GameState 
} from './types';

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const shuffleArray = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const IS_LEGEND_PACK = (sub: SubCategory) => [
  SubCategory.LEGENDS_FOOTBALL, SubCategory.LEGENDS_TENNIS, 
  SubCategory.LEGENDS_F1, SubCategory.LEGENDS_NBA, SubCategory.LEGENDS_NFL,
  SubCategory.LEGENDS_PADEL,
  SubCategory.LEGENDS_ARTISTS, SubCategory.LEGENDS_GAMES, 
  SubCategory.LEGENDS_STREAMERS, SubCategory.LEGENDS_CARS
].includes(sub);

const GET_LEGEND_EXAMPLES = (sub: SubCategory): string => {
  switch(sub) {
    case SubCategory.LEGENDS_FOOTBALL: return "Pelé and Beckenbauer";
    case SubCategory.LEGENDS_TENNIS: return "Federer and Sampras";
    case SubCategory.LEGENDS_F1: return "Schumacher and Senna";
    case SubCategory.LEGENDS_NBA: return "Jordan and Kobe";
    case SubCategory.LEGENDS_NFL: return "Tom Brady and Jerry Rice";
    case SubCategory.LEGENDS_PADEL: return "Fernando Belasteguín and Juan Martín Díaz";
    case SubCategory.LEGENDS_ARTISTS: return "Michael Jackson and The Beatles";
    case SubCategory.LEGENDS_GAMES: return "Elden Ring and Skyrim";
    case SubCategory.LEGENDS_STREAMERS: return "Ninja and PewDiePie";
    case SubCategory.LEGENDS_CARS: return "Ferrari F40 and DeLorean";
    default: return "Legendary Icons";
  }
};

const UNLOCK_DURATION = 24 * 60 * 60 * 1000; // 24 Hours
const INTERSTITIAL_DELAY = 12000; // 12 seconds
// AdMob configuration — set your real unit IDs here.
const ADMOB_APP_ID = 'ca-app-pub-2332552147534581~4542934482'; // your provided App ID
// Use Google's sample/test IDs when testing:
const ADMOB_TEST_INTERSTITIAL = 'ca-app-pub-3940256099942544/1033173712';
const ADMOB_TEST_REWARDED = 'ca-app-pub-3940256099942544/5224354917';
// Replace the placeholders below with your real Ad Unit IDs when ready.
const INTERSTITIAL_AD_UNIT_ID = ADMOB_TEST_INTERSTITIAL;
const REWARDED_AD_UNIT_ID = ADMOB_TEST_REWARDED;
// Toggle to make the invisible input-capturing overlay visible for debugging
// Set to `false` for regular testing / release builds
const DEBUG_SHOW_OVERLAY = false;

export default function App() {
  const [lang, setLang] = useState<Language>('en');

  // Explicitly initialize AdMob plugin on mount
  useEffect(() => {
    const admob = (window as any).AdMob || (window as any).admob || (window as any).Capacitor?.plugins?.AdMob;
    if (admob && admob.initialize) {
      admob.initialize({
        requestTrackingAuthorization: true,
        initializeForTesting: true, // set to false for production
      })
        .then(() => {
          console.log('AdMob plugin initialized');
        })
        .catch((err: any) => {
          console.error('AdMob initialization failed', err);
        });
    } else {
      console.warn('AdMob plugin not found for initialization');
    }
  }, []);
  const [setupStep, setSetupStep] = useState(0); 
  const [gameState, setGameState] = useState<GameState>({
    players: ['', '', ''], 
    impostorCount: 1,
    category: Category.SPORTS,
    selectedSport: undefined,
    subCategory: undefined as any,
    year: 2025,
    status: 'SETUP',
    revealedCount: 0,
    playerRoles: [],
    firstTurnPlayer: '',
    usedPlayers: new Set<string>()
  });
  
  const [unlockedPacks, setUnlockedPacks] = useState<Record<string, number>>({});
  const [adsRemoved, setAdsRemoved] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showUnlockPromptFor, setShowUnlockPromptFor] = useState<SubCategory | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isWatchingRewardedAd, setIsWatchingRewardedAd] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [adTimer, setAdTimer] = useState(30);
  const [isAdBlocking, setIsAdBlocking] = useState(false); // blocks UI when real ad is playing
  // When user presses "Start Playing" we show an interstitial after a short delay
  // and must prevent navigation/back until the ad completes. `startAdActive`
  // tracks that state so we can block hardware back and browser back navigation.
  const [startAdActive, setStartAdActive] = useState(false);
  const [startAdCountdown, setStartAdCountdown] = useState(0);
  const [pendingStarter, setPendingStarter] = useState<string>('');
  
  // Debug overlay removed for stability in device builds

  // Interstitial Ad States
  const interstitialTimeoutRef = useRef<number | null>(null);
  const lastAdShownRef = useRef<number | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const unlockModalRef = useRef<HTMLDivElement | null>(null);
  const unlockOverlayRef = useRef<HTMLDivElement | null>(null);
  const pendingClickRef = useRef<EventTarget | null>(null);

  const t = translations[lang];
  const validPlayersCount = gameState.players.filter(p => p.trim() !== "").length;

  // When payment modal is open, block all drag/scroll/pointer moves at the document level
  useEffect(() => {
    if (!showPaymentModal) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const prevent = (e: Event) => {
      try {
        e.preventDefault();
        // stop propagation on pointer events
        (e as any).stopPropagation?.();
      } catch (err) {}
      return false;
    };

    const opts: AddEventListenerOptions = { passive: false, capture: true };
    ['touchmove', 'pointermove', 'mousemove', 'dragstart', 'selectstart'].forEach(evt =>
      document.addEventListener(evt, prevent as EventListener, opts)
    );

    return () => {
      document.body.style.overflow = '';
      ['touchmove', 'pointermove', 'mousemove', 'dragstart', 'selectstart'].forEach(evt =>
        document.removeEventListener(evt, prevent as EventListener, opts)
      );
    };
  }, [showPaymentModal]);

  // Strong lock: fix body position while modal open to prevent any panning/scrolling
  useEffect(() => {
    if (!showPaymentModal) return;
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const scrollX = window.scrollX || document.documentElement.scrollLeft || 0;
    document.documentElement.style.setProperty('overscroll-behavior', 'none', 'important');
    try {
      document.body.style.setProperty('position', 'fixed', 'important');
      document.body.style.setProperty('top', `-${scrollY}px`, 'important');
      document.body.style.setProperty('left', `0`, 'important');
      document.body.style.setProperty('right', `0`, 'important');
      document.body.style.setProperty('width', '100%', 'important');
      document.body.style.setProperty('overflow', 'hidden', 'important');
    } catch (err) {}

    const restore = () => {
      try {
        document.body.style.removeProperty('position');
        document.body.style.removeProperty('top');
        document.body.style.removeProperty('left');
        document.body.style.removeProperty('right');
        document.body.style.removeProperty('width');
        document.body.style.removeProperty('overflow');
        document.documentElement.style.removeProperty('overscroll-behavior');
        window.scrollTo(scrollX, scrollY);
      } catch (err) {}
    };

    return restore;
  }, [showPaymentModal]);

  // Additional locking: hide horizontal overflow, force overlay styles and remove animation transforms
  useEffect(() => {
    if (!showPaymentModal) {
      try { document.documentElement.style.removeProperty('overflow-x'); } catch {}
      try { document.body.style.removeProperty('overflow-x'); } catch {}
      return;
    }

    try { document.documentElement.style.setProperty('overflow-x', 'hidden', 'important'); } catch {}
    try { document.body.style.setProperty('overflow-x', 'hidden', 'important'); } catch {}

    // Force overlay/modal styles after render to avoid animation transforms shifting the modal
    const t = setTimeout(() => {
      try {
        const overlay = overlayRef.current;
        if (overlay) {
          overlay.style.setProperty('transform', 'none', 'important');
          overlay.style.setProperty('touch-action', 'pan-y', 'important');
          overlay.classList.remove('animate-in','fade-in','zoom-in');
        }
        const el = modalRef.current;
        if (el) {
          el.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
          el.style.setProperty('left', '50%', 'important');
          el.style.setProperty('top', '50%', 'important');
        }
      } catch (err) {}
    }, 50);

    return () => {
      clearTimeout(t);
      try { document.documentElement.style.removeProperty('overflow-x'); } catch {}
      try { document.body.style.removeProperty('overflow-x'); } catch {}
    };
  }, [showPaymentModal]);


  // Note: do not disable pointer-events on the modal itself — keep interactive elements clickable.

  // Enforce modal centered position while open (override any attempted dragging)
  useEffect(() => {
    if (!showPaymentModal || !modalRef.current) return;

    const enforce = () => {
      const el = modalRef.current as HTMLDivElement | null;
      if (!el) return;
      try {
        el.style.setProperty('position', 'fixed', 'important');
        el.style.setProperty('top', '50%', 'important');
        el.style.setProperty('left', '50%', 'important');
        el.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
        el.style.setProperty('margin', '0', 'important');
        el.style.setProperty('touch-action', 'none', 'important');
        el.style.setProperty('user-select', 'none', 'important');
        el.style.setProperty('-webkit-user-drag', 'none', 'important');
      } catch (err) {}
    };

    // run immediately and on moves
    enforce();
    const evs = ['mousedown','pointerdown','mousemove', 'pointermove', 'touchmove', 'mouseup', 'pointerup', 'touchend'];
    evs.forEach(e => document.addEventListener(e, enforce, { passive: false, capture: true }));

    // as extra safety, enforce every 100ms while open
    const iv = setInterval(enforce, 100);

    return () => {
      evs.forEach(e => document.removeEventListener(e, enforce as EventListener, { capture: true } as any));
      clearInterval(iv);
    };
  }, [showPaymentModal]);

  // Persistence and Time
  useEffect(() => {
    const savedPlayers = localStorage.getItem('impostorz_players');
    const savedPacks = localStorage.getItem('impostorz_packs');
    const savedAds = localStorage.getItem('impostorz_ads_removed');
    
    if (savedPlayers) {
      const p = JSON.parse(savedPlayers);
      if (p.length >= 3) setGameState(s => ({ ...s, players: p }));
    }
    if (savedPacks) setUnlockedPacks(JSON.parse(savedPacks));
    if (savedAds === 'true') setAdsRemoved(true);

    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Create a top-level modal host in document.body so modals render outside app transforms
  const [modalHost, setModalHost] = useState<HTMLElement | null>(null);
  const adModalRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let host = document.getElementById('impostorz-modal-host') as HTMLElement | null;
    let created = false;
    if (!host) {
      host = document.createElement('div');
      host.id = 'impostorz-modal-host';
      document.body.appendChild(host);
      created = true;
    }
    // ensure the host is fixed and on top to avoid app transforms
    try {
      host.style.position = 'fixed';
      host.style.inset = '0px';
      host.style.zIndex = '99999';
      // keep host non-interactive by default; enable only while modal open
      host.style.pointerEvents = 'none';
      host.style.display = 'flex';
      host.style.alignItems = 'center';
      host.style.justifyContent = 'center';
    } catch (err) {}
    setModalHost(host);
    return () => {
      setModalHost(null);
      if (created && host && host.parentNode) host.parentNode.removeChild(host);
    };
  }, []);

  // (Removed visualViewport positioning — rely on overlay grid centering)

  // Inject a global override when unlock modal is open to disable animations/transforms
  useEffect(() => {
    if (!showUnlockPromptFor || !modalHost) {
      try {
        document.documentElement.classList.remove('impostorz-modal-open');
        const existing = document.getElementById('impostorz-modal-lock-style');
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
      } catch (err) {}
      return;
    }

    // add class to root
    try { document.documentElement.classList.add('impostorz-modal-open'); } catch (err) {}

    // create style element with high-specificity rules to neutralize transforms/animations
    const styleId = 'impostorz-modal-lock-style';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    // rules: disable animations/transitions/transforms globally while allowing the app to remain interactive
    // note: the modal host pointer-events will be enabled while open so the modal can receive input
    styleEl.innerHTML = `
      .impostorz-modal-open * { transition: none !important; animation: none !important; will-change: auto !important; }
      #impostorz-modal-host, #impostorz-modal-host * { transform: none !important; transition: none !important; animation: none !important; }
      .impostorz-modal-open, .impostorz-modal-open html, .impostorz-modal-open body { overscroll-behavior: none !important; }
    `;

    // enable pointer events on the host while modal is open
    try { modalHost.style.pointerEvents = 'auto'; } catch (err) {}

    return () => {
      try {
        document.documentElement.classList.remove('impostorz-modal-open');
        const existing = document.getElementById(styleId);
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
        modalHost && (modalHost.style.pointerEvents = 'none');
      } catch (err) {}
    };
  }, [showUnlockPromptFor, modalHost]);

  useEffect(() => {
    localStorage.setItem('impostorz_players', JSON.stringify(gameState.players));
  }, [gameState.players]);

  useEffect(() => {
    localStorage.setItem('impostorz_packs', JSON.stringify(unlockedPacks));
  }, [unlockedPacks]);

  useEffect(() => {
    localStorage.setItem('impostorz_ads_removed', adsRemoved.toString());
  }, [adsRemoved]);

  // Interstitial Ad Logic - Only if ads are not removed
  useEffect(() => {
    if (gameState.status === 'PLAYING' && !adsRemoved) {
      // no in-app announcement: keep behavior silent here
      if (interstitialTimeoutRef.current) {
        clearTimeout(interstitialTimeoutRef.current);
        interstitialTimeoutRef.current = null;
      }
    } else {
      if (interstitialTimeoutRef.current) {
        clearTimeout(interstitialTimeoutRef.current);
      }
    }
    return () => {
      if (interstitialTimeoutRef.current) clearTimeout(interstitialTimeoutRef.current);
    };
  }, [gameState.status, adsRemoved]);

  // Enforce unlock modal fixed position and block dragging while it's open
  useEffect(() => {
    if (!showUnlockPromptFor) return;

    // prevent scrolling while modal open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const prevent = (e: Event) => {
      try { e.preventDefault(); (e as any).stopPropagation?.(); } catch (err) {}
      return false;
    };
    const opts: AddEventListenerOptions = { passive: false, capture: true };
    ['touchmove','pointermove','mousemove','dragstart','selectstart'].forEach(evt =>
      document.addEventListener(evt, prevent as EventListener, opts)
    );

    // measure and lock the modal to true pixel center using ResizeObserver and resize/orientation listeners
    const measureAndLock = () => {
      const el = unlockModalRef.current;
      const overlay = unlockOverlayRef.current;
      try {
        if (overlay) {
          overlay.style.setProperty('transform', 'none', 'important');
          overlay.style.setProperty('touch-action', 'none', 'important');
          overlay.style.setProperty('pointer-events', 'auto', 'important');
          overlay.classList.remove('animate-in','fade-in','zoom-in');
        }
        if (!el) return;
        el.style.setProperty('position', 'fixed', 'important');
        el.style.setProperty('transform', 'none', 'important');
        el.style.setProperty('transition', 'none', 'important');
        el.style.setProperty('webkitTransition', 'none', 'important');
        el.style.setProperty('msTransition', 'none', 'important');
        el.style.setProperty('pointer-events', 'auto', 'important');
        el.style.setProperty('user-select', 'none', 'important');
        el.style.setProperty('-webkit-user-drag', 'none', 'important');
        el.style.setProperty('touch-action', 'none', 'important');

        // Wait one frame to ensure layout is stable, then measure
          requestAnimationFrame(() => {
          try {
            const rect = el.getBoundingClientRect();
            // Use visualViewport when available to account for Android viewport offsets
            const vv: any = (window as any).visualViewport;
            const vWidth = vv?.width || window.innerWidth || document.documentElement.clientWidth;
            const vHeight = vv?.height || window.innerHeight || document.documentElement.clientHeight;
            const vLeft = vv?.offsetLeft || 0;
            const vTop = vv?.offsetTop || 0;
            const centerX = Math.round(vLeft + vWidth / 2);
            const centerY = Math.round(vTop + vHeight / 2);
            const left = Math.round(centerX - rect.width / 2);
            const top = Math.round(centerY - rect.height / 2);
            el.style.setProperty('left', `${left}px`, 'important');
            el.style.setProperty('top', `${top}px`, 'important');
            el.style.setProperty('right', 'auto', 'important');
            el.style.setProperty('bottom', 'auto', 'important');
            el.style.setProperty('margin', '0', 'important');
            el.style.setProperty('transform-origin', 'center center', 'important');
          } catch (err) {}
        });
      } catch (err) {}
    };

    measureAndLock();

    let ro: ResizeObserver | null = null;
    try {
      if ((window as any).ResizeObserver) {
        ro = new (window as any).ResizeObserver(() => measureAndLock());
        if (unlockModalRef.current) ro.observe(unlockModalRef.current);
      }
    } catch (err) { ro = null; }

    const onResize = () => measureAndLock();
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });
    window.addEventListener('load', onResize);
    if ((document as any).fonts && (document as any).fonts.ready) {
      (document as any).fonts.ready.then?.(() => measureAndLock()).catch(()=>{});
    }

    // block only move/drag events originating from modal (allow clicks/downs to pass)
    const blockIfFromModal = (e: Event) => {
      try {
        const target = e.target as Node;
        const el = unlockModalRef.current;
        if (!el || !target) return;
        // only block pointer/touch/mouse move and dragstart events
        const t = (e as any).type;
        if (!['pointermove', 'touchmove', 'mousemove', 'dragstart'].includes(t)) return;
        if (el.contains(target)) {
          e.preventDefault?.();
          e.stopImmediatePropagation?.();
          return false;
        }
      } catch (err) {}
    };

    ['pointermove','touchmove','mousemove','dragstart'].forEach(evt =>
      document.addEventListener(evt, blockIfFromModal as EventListener, { capture: true })
    );

    return () => {
      document.body.style.overflow = prevOverflow;
      ['touchmove','pointermove','mousemove','dragstart','selectstart'].forEach(evt =>
        document.removeEventListener(evt, prevent as EventListener, opts)
      );
      ['pointermove','touchmove','mousemove','dragstart'].forEach(evt =>
        document.removeEventListener(evt, blockIfFromModal as EventListener, { capture: true } as any)
      );
      try { window.removeEventListener('resize', onResize as any); } catch {}
      try { window.removeEventListener('orientationchange', onResize as any); } catch {}
      try { window.removeEventListener('load', onResize as any); } catch {}
      try { ro && ro.disconnect(); } catch {}
    };
  }, [showUnlockPromptFor]);

  const handleCategorySelect = (cat: Category) => {
    const defaultYear = 2025;
    setGameState(s => ({
      ...s, 
      category: cat, 
      selectedSport: undefined, 
      subCategory: undefined as any,
      year: defaultYear as Year
    }));
    
    if (cat === Category.VIDEO_GAMES || cat === Category.STREAMERS || cat === Category.CARS) {
      setSetupStep(3); 
    } else if (cat === Category.SPORTS) {
      setSetupStep(1);
    } else {
      setSetupStep(2);
    }
  };

  const handleSportSelect = (sport: SubSport) => {
    setGameState(s => ({...s, selectedSport: sport}));
    if (sport === SubSport.PADEL) {
      setGameState(s => ({...s, year: 2025}));
      setSetupStep(3);
    } else {
      setSetupStep(2);
    }
  };

  const handleEraSelect = (y: Year) => {
    setGameState(s => ({...s, year: y}));
    setSetupStep(3);
  };

  const checkIsPackUnlocked = (sub: SubCategory) => {
    if (adsRemoved) return true; // Premium users have all packs
    if (!IS_LEGEND_PACK(sub)) return true;
    
    if (gameState.category === Category.ARTISTS) {
      const artistExpiry = unlockedPacks['ARTISTS_CATEGORY_UNLOCK'] || 0;
      if (currentTime < artistExpiry) return true;
    }

    const expiry = unlockedPacks[sub] || 0;
    return currentTime < expiry;
  };

  const handleTopicSelect = (sub: SubCategory) => {
    if (!checkIsPackUnlocked(sub)) {
      setShowUnlockPromptFor(sub);
      return;
    }

    setGameState(s => ({...s, subCategory: sub}));
    setSetupStep(4);
  };

  const startReveal = () => {
    const playersInSub = PLAYER_DATA[gameState.subCategory]?.[gameState.year] || [];
    if (playersInSub.length < 2) return alert("Not enough data for this category.");

    const pool = playersInSub.filter(p => !gameState.usedPlayers.has(p)).length >= 2 
      ? playersInSub.filter(p => !gameState.usedPlayers.has(p)) 
      : playersInSub;
      
    const secretWord = getRandomElement(pool);
    const validPlayers = gameState.players.filter(p => p.trim() !== "");
    const indices = shuffleArray(validPlayers.map((_, i) => i));
    const impostors = indices.slice(0, gameState.impostorCount);

    const roles = validPlayers.map((name, i) => ({
      name,
      role: (impostors.includes(i) ? 'IMPOSTOR' : 'CREWMATE') as 'IMPOSTOR' | 'CREWMATE',
      secret: impostors.includes(i) ? 'IMPOSTOR' : secretWord
    }));

    setGameState(s => ({
      ...s,
      status: 'REVEAL',
      playerRoles: roles,
      revealedCount: 0,
      usedPlayers: new Set([...s.usedPlayers, secretWord])
    }));
  };

  const handleUnlockLegends = () => {
    // Try to show a rewarded ad via a Capacitor AdMob plugin if available.
    const showRewarded = async () => {
      try {
        setIsAdBlocking(true);
        // Example: window.AdMob or (window as any).AdMob depending on plugin
        const admob = (window as any).AdMob || (window as any).admob || (window as any).Capacitor?.plugins?.AdMob;
        if (admob && admob.showRewarded) {
          // Replace with your AdMob Rewarded Ad unit id
          await admob.showRewarded({ adUnitId: REWARDED_AD_UNIT_ID });
        } else {
          // Fallback: show the in-app simulated 30s rewarded overlay
          setIsWatchingRewardedAd(true);
          setAdTimer(30);
          await new Promise<void>(res => {
            const interval = setInterval(() => {
              setAdTimer(prev => {
                if (prev <= 1) {
                  clearInterval(interval);
                  res();
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          });
          setIsWatchingRewardedAd(false);
        }

        const expiry = Date.now() + UNLOCK_DURATION;
        if (gameState.category === Category.ARTISTS) {
          setUnlockedPacks(p => ({ ...p, ['ARTISTS_CATEGORY_UNLOCK']: expiry }));
        } else {
          setUnlockedPacks(p => ({ ...p, [showUnlockPromptFor!]: expiry }));
        }

        setGameState(s => ({...s, subCategory: showUnlockPromptFor!}));
        setSetupStep(4);
        setShowUnlockPromptFor(null);
      } catch (e) {
        console.error('Rewarded ad failed or cancelled', e);
      } finally {
        setIsAdBlocking(false);
      }
    };

    showRewarded();
  };

  // Show an interstitial (or simulated) ad 10s after user clicks Start Playing.
  const handleAttemptStartPlaying = () => {
    // Ensure we have a valid starting player name. If `pendingStarter` is empty
    // pick a random name from `gameState.playerRoles` or `gameState.players`.
    let starter = pendingStarter && pendingStarter.trim() ? pendingStarter : '';
    if (!starter) {
      if (gameState.playerRoles && gameState.playerRoles.length > 0) {
        const r = gameState.playerRoles[Math.floor(Math.random() * gameState.playerRoles.length)];
        starter = r && r.name ? r.name : '';
      }
      if (!starter) {
        const validPlayers = gameState.players.filter(p => p && p.trim() !== '');
        starter = validPlayers.length > 0 ? validPlayers[Math.floor(Math.random() * validPlayers.length)] : '';
      }
      // persist chosen starter
      setPendingStarter(starter);
    }

    if (adsRemoved) {
      setGameState(s => ({...s, status: 'PLAYING', firstTurnPlayer: starter}));
      return;
    }

    // Set the starting player immediately and enter STARTING state.
    setGameState(s => ({ ...s, firstTurnPlayer: starter, status: 'STARTING' }));

    // Block UI and start 8s pre-ad countdown then show interstitial
    setStartAdActive(true);
    setStartAdCountdown(8);

    setTimeout(async () => {
      try {
        // Right before showing the ad, mark ad playback active so we can block UI and show spinner
        setIsAdBlocking(true);
        const admob = (window as any).AdMob || (window as any).admob || (window as any).Capacitor?.plugins?.AdMob;
        // record that an ad is being shown (real or simulated)
        lastAdShownRef.current = Date.now();
        if (admob && admob.showInterstitial) {
          await admob.showInterstitial({ adUnitId: INTERSTITIAL_AD_UNIT_ID });
        } else {
          // Fallback: simulate ad playback duration (8s)
          await new Promise<void>(res => setTimeout(res, 8000));
        }
      } catch (err) {
        console.error('Interstitial failed', err);
      } finally {
        setIsAdBlocking(false);
        setStartAdActive(false);
        setGameState(s => ({...s, status: 'PLAYING'}));
      }
    }, 8000);
  };

  // While the start interstitial is active, block Android hardware back and browser back navigation.
  useEffect(() => {
    if (!startAdActive) return;

    const onBackButton = (e: any) => {
      try { e.preventDefault?.(); e.stopImmediatePropagation?.(); } catch (err) {}
      return false;
    };

    const onPop = () => {
      try { history.pushState(null, '', location.href); } catch (err) {}
    };

    // Push a history state so back navigation triggers popstate
    try { history.pushState(null, '', location.href); } catch (err) {}

    document.addEventListener('backbutton', onBackButton as EventListener, { capture: true });
    window.addEventListener('popstate', onPop);

    // Countdown for the pre-ad interval
    setStartAdCountdown(prev => (prev > 0 ? prev : 8));
    const iv = setInterval(() => {
      setStartAdCountdown(s => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => {
      try { document.removeEventListener('backbutton', onBackButton as EventListener, { capture: true } as any); } catch (err) {}
      try { window.removeEventListener('popstate', onPop); } catch (err) {}
      clearInterval(iv);
    };
  }, [startAdActive]);

  const handleSimulatePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setAdsRemoved(true);
      setIsProcessingPayment(false);
      setShowPaymentModal(false);
    }, 2500);
  };

  /* -------- Google Play Billing (Client-side scaffold) --------
            setGameState(s => ({...s, status: 'PLAYING'}));
   in-app-purchase / billing plugins and provides `purchaseGoAdFree` and
   `restorePurchases` hooks. For security you MUST verify receipts
   server-side (see docs below). The scaffold persists the purchase in
   `localStorage` and updates `adsRemoved` accordingly.
  */

  const BILLING_PRODUCT_ID = 'go_ad_free'; // replace with your Play Console product id

  const persistPurchase = (payload: any) => {
    try {
      localStorage.setItem('impostorz_ads_removed', 'true');
      localStorage.setItem('impostorz_purchase_payload', JSON.stringify(payload || {}));
      if (payload && payload.serverToken) {
        localStorage.setItem('impostorz_jwt', payload.serverToken);
      }
    } catch (err) {}
    setAdsRemoved(true);
  };

  const verifyTokenWithServer = async (token: string) => {
    try {
      const res = await fetch(`${VERIFY_SERVER_URL}/verify-token`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token })
      });
      if (!res.ok) return { valid: false };
      return await res.json();
    } catch (err) {
      console.error('verifyTokenWithServer error', err);
      return { valid: false };
    }
  };

  // Development helper: request a test token from local verification server
  const [devFetchDebug, setDevFetchDebug] = useState<string | null>(null);

  const issueDevToken = async () => {
    if (!VERIFY_SERVER_URL) return alert('No verification server configured');

    const baseCandidates = [VERIFY_SERVER_URL, 'http://10.0.2.2:3000', 'http://127.0.0.1:3000', 'http://localhost:3000'];
    // Unique and keep order
    const candidates = Array.from(new Set(baseCandidates.filter(Boolean)));

    const results: string[] = [];
    let successJson: any = null;
    let successUrl: string | null = null;

    for (const base of candidates) {
      const url = `${base.replace(/\/$/, '')}/issue-test-token`;
      setDevFetchDebug(`Trying ${url} ...`);
      console.log('issueDevToken trying', url);
      try {
        const ac = new AbortController();
        const timer = setTimeout(() => ac.abort(), 5000);
        const res = await fetch(url, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: BILLING_PRODUCT_ID, packageName: (window as any).PACKAGE_NAME || 'com.yourcompany.impostorz' }),
          signal: ac.signal
        });
        clearTimeout(timer);
        const text = await res.text();
        let j: any = null;
        try { j = JSON.parse(text); } catch (e) { /* ignore */ }
        if (!res.ok) {
          results.push(`${url} -> HTTP ${res.status}: ${text.substring(0,200)}`);
          setDevFetchDebug(results.join('\n'));
          continue;
        }
        if (!j) {
          results.push(`${url} -> invalid JSON: ${text.substring(0,200)}`);
          setDevFetchDebug(results.join('\n'));
          continue;
        }
        // success
        successJson = j;
        successUrl = url;
        results.push(`${url} -> OK`);
        setDevFetchDebug(results.join('\n'));
        break;
      } catch (err: any) {
        const msg = err && err.name === 'AbortError' ? 'timeout' : String(err);
        results.push(`${url} -> error: ${msg}`);
        setDevFetchDebug(results.join('\n'));
        console.error('issueDevToken attempt failed', url, err);
        continue;
      }
    }

    if (!successJson) {
      alert('All attempts failed. See debug info in header.');
      return;
    }

    try {
      const j = successJson;
      if (j && j.token) {
        console.log('issueDevToken got token from', successUrl, j.token.substring(0,32) + '...');
        localStorage.setItem('impostorz_jwt', j.token);
        const v = await verifyTokenWithServer(j.token);
        if (v && v.valid) {
          localStorage.setItem('impostorz_ads_removed', 'true');
          setAdsRemoved(true);
          alert('Issued and verified dev token — ads removed');
        } else {
          console.warn('Token verification failed', v);
          alert('Token issued but verification failed: ' + (v?.error || JSON.stringify(v)));
        }
      } else {
        alert('No token returned from server');
      }
    } catch (err) {
      console.error('issueDevToken post-success error', err);
      alert('issueDevToken failed after fetch: ' + String(err));
    }
  };

  const VERIFY_SERVER_URL = ((): string => {
    // For emulator testing use 10.0.2.2:3000. Replace with your production server URL.
    if (typeof window !== 'undefined' && (window as any).location && (window as any).location.hostname === 'localhost') {
      return 'http://localhost:3000';
    }
    // Android emulator host mapping
    return 'http://10.0.2.2:3000';
  })();

  const verifyPurchaseWithServer = async (purchaseToken: string, productId?: string) => {
    try {
      const res = await fetch(`${VERIFY_SERVER_URL}/verify-purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: purchaseToken, productId: productId || BILLING_PRODUCT_ID, packageName: (window as any).PACKAGE_NAME || 'com.yourcompany.impostorz' })
      });
      if (!res.ok) return { valid: false, detail: 'server-error' };
      const j = await res.json();
      return j;
    } catch (err) {
      console.error('verifyPurchaseWithServer error', err);
      return { valid: false, detail: 'network-error' };
    }
  };

  const purchaseGoAdFree = async () => {
    try {
      setIsProcessingPayment(true);

      // Try common plugin entry points
      const win = window as any;

      // 1) Capacitor Community / custom plugin attempt
      const capBilling = win.Capacitor?.plugins?.InAppPurchase || win.Capacitor?.plugins?.Billing || win.Capacitor?.plugins?.InAppPurchases;
      if (capBilling && capBilling.purchase) {
        const res = await capBilling.purchase({ productId: BILLING_PRODUCT_ID });
        // typical shape: { purchaseToken, productId, orderId }
        if (res?.purchaseToken) {
          const verified = await verifyPurchaseWithServer(res.purchaseToken, res.productId || BILLING_PRODUCT_ID);
          if (verified?.valid) {
            persistPurchase({ ...res, serverToken: verified.token });
            setShowPaymentModal(false);
            return;
          } else {
            console.warn('Server verification failed', verified);
          }
        }
        // Fallback: persist only if plugin indicates success (less secure)
        persistPurchase(res);
        setShowPaymentModal(false);
        return;
      }

      // 2) Cordova-plugin-purchase (store) flow
      const store = win.store || (win.cordova && win.cordova.plugins && win.cordova.plugins.purchase);
      if (store && store.order) {
        // register product if not already
        try { store.register({ id: BILLING_PRODUCT_ID, type: store.NON_CONSUMABLE }); } catch (e) {}
        store.order(BILLING_PRODUCT_ID);
        store.when(BILLING_PRODUCT_ID).approved(async (p: any) => {
          p.finish && p.finish();
          const token = p.transaction?.purchaseToken || p.purchaseToken || p.token;
          if (token) {
            const verified = await verifyPurchaseWithServer(token, BILLING_PRODUCT_ID);
            if (verified?.valid) persistPurchase({ ...p, serverToken: verified.token });
            else console.warn('Server verification failed for cordova store purchase', verified);
          } else {
            persistPurchase(p);
          }
          setShowPaymentModal(false);
          setIsProcessingPayment(false);
        });
        store.when(BILLING_PRODUCT_ID).error((err: any) => {
          console.error('Purchase error', err);
          setIsProcessingPayment(false);
        });
        return;
      }

      // 3) Fallback: open Play Store product URL or show instructions
      alert('In-app purchases are not available in this build. To test purchases run the Play Store build on a device with a test account.');
    } catch (err) {
      console.error('purchaseGoAdFree failed', err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const restorePurchases = async () => {
    try {
      const win = window as any;
      const capBilling = win.Capacitor?.plugins?.InAppPurchase || win.Capacitor?.plugins?.Billing || win.Capacitor?.plugins?.InAppPurchases;
      if (capBilling && capBilling.restore) {
        const res = await capBilling.restore();
        // res should contain list of purchases
        const found = res?.find((p: any) => p.productId === BILLING_PRODUCT_ID);
        if (found) {
          const token = found.purchaseToken || found.transaction?.purchaseToken || found.token;
          if (token) {
            const verified = await verifyPurchaseWithServer(token, BILLING_PRODUCT_ID);
            if (verified?.valid) {
              persistPurchase({ ...found, serverToken: verified.token });
            }
          } else {
            persistPurchase(found);
          }
        }
        return;
      }

      const store = win.store || (win.cordova && win.cordova.plugins && win.cordova.plugins.purchase);
      if (store && store.refresh) {
        store.refresh();
        store.when(BILLING_PRODUCT_ID).loaded(async (p: any) => {
          if (p && (p.owned || p.state === store.APPROVED || p.productId === BILLING_PRODUCT_ID)) {
            const token = p.transaction?.purchaseToken || p.purchaseToken || p.token;
            if (token) {
              const verified = await verifyPurchaseWithServer(token, BILLING_PRODUCT_ID);
              if (verified?.valid) persistPurchase({ ...p, serverToken: verified.token });
            } else {
              persistPurchase(p);
            }
          }
        });
        return;
      }

      // If nothing available, attempt local verification of stored payload
      // If we have a server-issued JWT stored, validate it with the server
      const savedToken = localStorage.getItem('impostorz_jwt');
      if (savedToken) {
        const verified = await verifyTokenWithServer(savedToken);
        if (verified?.valid) {
          try { localStorage.setItem('impostorz_ads_removed', 'true'); setAdsRemoved(true); } catch {};
          return;
        }
      }

      const payload = localStorage.getItem('impostorz_purchase_payload');
      if (payload) {
        persistPurchase(JSON.parse(payload));
      }
    } catch (err) { console.error('restorePurchases failed', err); }
  };

  // On startup, try to restore from localStorage or plugin
  useEffect(() => {
    const saved = localStorage.getItem('impostorz_ads_removed');
    if (saved === 'true') {
      setAdsRemoved(true);
    } else {
      // quick best-effort restore
      restorePurchases();
    }
  }, []);

  const formatCountdown = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  const getSubCategories = () => {
    const cat = gameState.category;
    if (cat === Category.SPORTS) {
      if (gameState.selectedSport === SubSport.FOOTBALL) return [SubCategory.PREMIER_LEAGUE, SubCategory.LA_LIGA, SubCategory.BUNDESLIGA, SubCategory.LEGENDS_FOOTBALL];
      if (gameState.selectedSport === SubSport.TENNIS) return [SubCategory.ATP, SubCategory.WTA, SubCategory.LEGENDS_TENNIS];
      if (gameState.selectedSport === SubSport.PADEL) return [SubCategory.PADEL_PROS, SubCategory.LEGENDS_PADEL];
      if (gameState.selectedSport === SubSport.F1) return [SubCategory.F1_DRIVERS, SubCategory.LEGENDS_F1];
      if (gameState.selectedSport === SubSport.BASKETBALL) return [SubCategory.NBA_STARS, SubCategory.LEGENDS_NBA];
      if (gameState.selectedSport === SubSport.AM_FOOTBALL) return [SubCategory.NFL_STARS, SubCategory.LEGENDS_NFL];
    }
    if (cat === Category.ARTISTS) return [SubCategory.POP, SubCategory.RAP, SubCategory.KPOP, SubCategory.LATIN, SubCategory.LEGENDS_ARTISTS];
    if (cat === Category.VIDEO_GAMES) return [SubCategory.GAMES_SOCIAL, SubCategory.GAMES_ACTION, SubCategory.GAMES_SHOOTER, SubCategory.GAMES_RPG, SubCategory.LEGENDS_GAMES];
    if (cat === Category.STREAMERS) return [SubCategory.STREAM_EN, SubCategory.STREAM_ES, SubCategory.STREAM_FR, SubCategory.LEGENDS_STREAMERS];
    if (cat === Category.CARS) return [SubCategory.CARS_NORMAL, SubCategory.CARS_SUPERCARS, SubCategory.CARS_LUXURY, SubCategory.LEGENDS_CARS];
    return [];
  };

  return (
    <div className="app-root relative">
      {/* --- PAYMENT MODAL --- */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-0 m-0 bg-black/95 backdrop-blur-xl animate-in fade-in zoom-in duration-300 modal-overlay"
          style={{touchAction: 'none'}}
          onDragStart={e => e.preventDefault()}
          onPointerMove={e => e.preventDefault()}
          onTouchMove={e => e.preventDefault()}
        >
          <div
            ref={overlayRef}
            className="fixed inset-0"
            style={{zIndex: 149, background: DEBUG_SHOW_OVERLAY ? 'rgba(255,0,0,0.08)' : 'transparent', pointerEvents: 'none', border: DEBUG_SHOW_OVERLAY ? '1px dashed rgba(255,0,0,0.2)' : 'none'}}
          />
          <div
            ref={modalRef}
            className="glass-card w-full max-w-md modal-content p-8 rounded-[40px] text-center space-y-8 relative overflow-hidden shadow-2xl"
            style={{position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', margin: 0, userSelect: 'none', WebkitUserSelect: 'none', msUserSelect: 'none', WebkitUserDrag: 'none', touchAction: 'none', zIndex: 151}}
            draggable={false}
            onDragStart={e => e.preventDefault()}
            onPointerDown={(e:any) => {
              try { modalRef.current?.setPointerCapture?.(e.pointerId); } catch (err) {}
            }}
            onPointerMove={e => { try { e.preventDefault(); } catch{} }}
            onPointerUp={(e:any) => {
              try { modalRef.current?.releasePointerCapture?.(e.pointerId); } catch (err) {}
            }}
            onMouseDown={e => { /* allow clicks */ }}
            onTouchStart={e => { /* allow clicks */ }}
            onTouchMove={e => { try { e.preventDefault(); } catch{} }}
          >
            
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#eab308]/20 overflow-hidden">
               {isProcessingPayment && <div className="h-full bg-[#eab308] animate-pulse w-full" />}
            </div>
            
            <div className="text-6xl">💳</div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-white leading-tight">Remove All Ads</h3>
              <p className="text-slate-400 text-sm leading-relaxed px-2">
                Get the permanent <span className="text-[#eab308] font-bold">Premium Experience</span>. No more interstitials, no more rewards - just pure game.
              </p>
            </div>

            <div className="bg-slate-900/50 rounded-3xl p-6 border border-white/5 space-y-2">
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Price</p>
               <p className="text-4xl font-black text-[#eab308] drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">2.99€</p>
               <p className="text-[8px] text-slate-600 font-bold uppercase italic mt-1">One-time purchase</p>
            </div>

            <div className="space-y-4 pt-2">
              <button 
                onClick={purchaseGoAdFree}
                disabled={isProcessingPayment}
                className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all uppercase flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isProcessingPayment ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : "⚡ Pay Now"}
              </button>
              <button 
                onClick={() => setShowPaymentModal(false)} 
                disabled={isProcessingPayment}
                className="text-slate-500 font-black text-xs uppercase tracking-widest hover:text-slate-300 disabled:opacity-30"
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* --- REWARDED AD OVERLAY (30 SECONDS) --- */}
      {isWatchingRewardedAd && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 modal-overlay">
          <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
            <div className="bg-white/10 px-3 py-1 rounded-full border border-white/5">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Rewarded Ad</span>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-[#eab308]/40 flex items-center justify-center font-black text-white bg-slate-900 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
              {adTimer}
            </div>
          </div>
          
          <div className="w-full max-w-xs space-y-12 text-center modal-content">
            <div className="space-y-4">
              <h2 className="text-4xl font-bungee text-[#eab308] animate-pulse drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">LEGENDS UNLOCK</h2>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-[4px]">Access the greats</p>
            </div>

            <div className="relative aspect-video w-full bg-slate-900 rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-[#eab308]/10 to-transparent" />
               <div className="flex flex-col items-center gap-4">
                 <div className="w-16 h-16 rounded-full border-4 border-[#eab308]/20 flex items-center justify-center">
                    <div className="w-4 h-4 bg-[#eab308] rounded-sm animate-bounce" />
                 </div>
                 <span className="text-slate-700 font-black text-[10px] uppercase tracking-[3px] animate-pulse">Playing Sponsor Clip...</span>
               </div>
               <div className="scan-line !bg-[#eab308]" />
            </div>

            <div className="space-y-4">
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#eab308] transition-all duration-1000 ease-linear shadow-[0_0_10px_#eab308]" 
                  style={{ width: `${((30-adTimer)/30) * 100}%` }} 
                />
              </div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic opacity-50">
                Reward unlocks in {adTimer}s
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interstitial in-app announcement removed. */}

      {/* --- App Content --- */}
      <div className="flex justify-between items-center mb-6" style={{paddingTop: 'calc(env(safe-area-inset-top, 24px) + 18px)'}}>
        {!adsRemoved ? (
          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            draggable={false}
            className="px-4 py-2 rounded-xl bg-[#eab308]/10 border border-[#eab308]/30 text-[#eab308] font-black text-[10px] uppercase tracking-widest hover:bg-[#eab308]/20 transition-all flex items-center gap-2"
            style={{userSelect: 'none', WebkitUserSelect: 'none', msUserSelect: 'none', WebkitUserDrag: 'none'}}
          >
            👑 Go Ad-Free
          </button>
        ) : (
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
            ✨ Premium Active
          </div>
        )}
        {/* Dev helper: request a signed test token from local server */}
        {(VERIFY_SERVER_URL.includes('10.0.2.2') || VERIFY_SERVER_URL.includes('localhost') || process.env.NODE_ENV !== 'production') && (
          <>
            <button onClick={issueDevToken} className="ml-3 px-3 py-1 rounded bg-white/5 text-white text-xs">Dev: Issue Test Token</button>
            <button
              onClick={() => {
                if (!confirm('Clear dev/local state? This will remove tokens and premium flags.')) return;
                try {
                  localStorage.removeItem('impostorz_jwt');
                  localStorage.removeItem('impostorz_ads_removed');
                  localStorage.removeItem('impostorz_purchase_payload');
                  // keep players/packs untouched to avoid losing test data, but reset ads state
                  setAdsRemoved(false);
                  setDevFetchDebug(null);
                } catch (e) { console.error('clearDevState failed', e); }
              }}
              className="ml-2 px-2 py-1 rounded bg-red-600/20 text-rose-200 text-xs"
            >Clear Dev State</button>
          </>
        )}
        {devFetchDebug && (
          <div className="ml-3 text-[10px] text-rose-400 font-mono whitespace-pre-wrap max-w-xs break-words">
            {devFetchDebug}
          </div>
        )}
        <div className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Ver. 2025.1</div>
      </div>

      <div className="text-center mb-10 mt-2">
        <h1 className="font-bungee text-5xl text-[#22d3ee] tracking-tighter neon-glow-text uppercase">
          {t.title}
        </h1>
        <p className="text-slate-500 font-bold text-[10px] tracking-[5px] mt-1 opacity-60 uppercase">Game Lobby</p>
      </div>

      {gameState.status === 'SETUP' && (
        <div className="space-y-6">
          {/* Players Input Card */}
          <div className="glass-card p-6 rounded-[32px] holographic space-y-6">
            <div className="space-y-4">
              <h2 className="text-[10px] font-black text-slate-500 tracking-[3px] uppercase">Players</h2>
              <div className="space-y-3 no-scrollbar max-h-64 overflow-y-auto pr-1">
                {gameState.players.map((p, i) => (
                  <div key={i} className="flex gap-2 group animate-in slide-in-from-left-2 duration-300">
                    <input 
                      className="flex-1 bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold placeholder-slate-600 focus:border-[#22d3ee] transition-all outline-none"
                      value={p}
                      placeholder={`Player ${i + 1}`}
                      onChange={(e) => {
                        const next = [...gameState.players];
                        next[i] = e.target.value;
                        setGameState(s => ({...s, players: next}));
                      }}
                    />
                    {gameState.players.length > 3 && (
                      <button 
                        onClick={() => setGameState(s => ({...s, players: s.players.filter((_, idx) => idx !== i)}))}
                        className="w-14 bg-red-500/10 text-red-500 rounded-2xl font-black hover:bg-red-500/20 transition-colors"
                      >✕</button>
                    )}
                  </div>
                ))}
                <button 
                  onClick={() => setGameState(s => ({...s, players: [...s.players, ""]}))}
                  className="w-full py-4 rounded-2xl border-2 border-dashed border-white/10 text-slate-500 font-black text-[10px] tracking-widest hover:border-white/20 transition-colors uppercase"
                >+ Add Player</button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h2 className="text-[10px] font-black text-slate-500 tracking-[3px] uppercase mb-4">How many impostors?</h2>
              <div className="flex gap-3">
                {Array.from({ length: Math.min(Math.max(1, validPlayersCount - 1), 4) }, (_, i) => i + 1).map(num => (
                  <button 
                    key={num}
                    onClick={() => setGameState(s => ({ ...s, impostorCount: num }))}
                    className={`flex-1 py-4 rounded-2xl border-2 font-black transition-all ${gameState.impostorCount === num ? 'border-[#22d3ee] bg-[#22d3ee]/10 text-[#22d3ee] shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-white/5 bg-white/5 text-slate-500'}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Setup Steps Card */}
          <div className="glass-card p-6 rounded-[32px] space-y-8 relative overflow-hidden">
            <div className="flex justify-center gap-2">
              {[0,1,2,3].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= setupStep ? 'bg-[#22d3ee] w-8 shadow-[0_0_8px_#22d3ee]' : 'bg-white/10 w-4'}`} />
              ))}
            </div>

            {/* STEP 1: CATEGORY */}
            <div className="space-y-4">
              <h2 className="text-[10px] font-black text-slate-500 tracking-[3px] uppercase">1. Choose Category</h2>
              <div className="grid grid-cols-2 gap-3">
                {[Category.SPORTS, Category.ARTISTS, Category.VIDEO_GAMES, Category.STREAMERS, Category.CARS].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gameState.category === cat ? 'border-[#22d3ee] bg-[#22d3ee]/10 text-[#22d3ee] scale-[1.05]' : 'border-white/5 bg-white/5 text-slate-400'}`}
                  >
                    <span className="text-2xl">{cat === 'Sports' ? '🏆' : cat === 'Artists' ? '🎤' : cat === 'Video Games' ? '🎮' : cat === 'Streamers' ? '🎥' : '🏎️'}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider">{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 2: SPORT (Only for Sports) */}
            {setupStep >= 1 && gameState.category === Category.SPORTS && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-[10px] font-black text-slate-500 tracking-[3px] uppercase">2. Choose Sport</h2>
                <div className="grid grid-cols-3 gap-2">
                  {[SubSport.FOOTBALL, SubSport.TENNIS, SubSport.PADEL, SubSport.F1, SubSport.BASKETBALL, SubSport.AM_FOOTBALL].map(sport => (
                    <button 
                      key={sport}
                      onClick={() => handleSportSelect(sport)}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${gameState.selectedSport === sport ? 'border-[#22d3ee] bg-[#22d3ee]/10 text-[#22d3ee]' : 'border-white/5 bg-white/5 text-slate-400'}`}
                    >
                      <span className="text-xl">
                        {sport === 'Football' ? '⚽' : sport === 'Tennis' ? '🎾' : sport === 'Padel' ? '🎾' : sport === 'F1' ? '🏎️' : sport === 'Basketball' ? '🏀' : '🏈'}
                      </span>
                      <span className="text-[8px] font-black uppercase">{sport}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: ERA YEAR (Hidden for Padel since it only has 2025) */}
            {setupStep >= 2 && 
             (gameState.category === Category.ARTISTS || 
              (gameState.category === Category.SPORTS && gameState.selectedSport !== SubSport.PADEL)) && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-[10px] font-black text-slate-500 tracking-[3px] uppercase">3. {gameState.category === Category.ARTISTS ? 'Era Decade' : 'Era Year'}</h2>
                <div className="grid grid-cols-4 gap-2">
                  {(gameState.category === Category.ARTISTS ? [1990, 2000, 2010, 2020] : [2018, 2022, 2025]).map(y => (
                    <button 
                      key={y}
                      onClick={() => handleEraSelect(y as Year)}
                      className={`py-3 rounded-xl border-2 transition-all font-black text-[12px] ${gameState.year === y ? 'border-[#22d3ee] bg-[#22d3ee]/10 text-[#22d3ee]' : 'border-white/5 bg-white/5 text-slate-400'}`}
                    >
                      {gameState.category === Category.ARTISTS ? (y === 1990 ? "90's" : y === 2000 ? "00's" : y === 2010 ? "10's" : "20's") : y}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: TOPIC SELECTION */}
            {setupStep >= 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-[10px] font-black text-slate-500 tracking-[3px] uppercase">4. Choose Topic</h2>
                <div className="grid grid-cols-2 gap-3">
                  {getSubCategories().map(sub => {
                    const isLegend = IS_LEGEND_PACK(sub);
                    let timeLeft = 0;
                    if (isLegend) {
                      const expiry = (gameState.category === Category.ARTISTS) 
                        ? (unlockedPacks['ARTISTS_CATEGORY_UNLOCK'] || 0)
                        : (unlockedPacks[sub] || 0);
                      timeLeft = expiry - currentTime;
                    }
                    const isUnlocked = adsRemoved || !isLegend || timeLeft > 0;
                    
                    return (
                      <button 
                        key={sub}
                        onClick={() => handleTopicSelect(sub)}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-center items-center min-h-[80px] text-center relative overflow-hidden ${isLegend ? 'premium-legend-btn' : ''} ${gameState.subCategory === sub ? 'border-[#22d3ee] bg-[#22d3ee]/10 scale-[1.02]' : 'border-white/5 bg-white/5'}`}
                      >
                        {isLegend && !adsRemoved && timeLeft > 0 && (
                          <span className="absolute top-1 text-[7px] text-[#eab308] font-black uppercase bg-[#eab308]/10 px-2 rounded-full border border-[#eab308]/20">{formatCountdown(timeLeft)} LEFT</span>
                        )}
                        {isLegend && adsRemoved && (
                          <span className="absolute top-1 text-[7px] text-[#eab308] font-black uppercase bg-[#eab308]/10 px-2 rounded-full border border-[#eab308]/20">UNLOCKED</span>
                        )}
                        <div className="flex items-center gap-1">
                          {isLegend && <span className="spark-icon text-xs">✨</span>}
                          <span className={`text-[10px] font-black uppercase leading-tight ${gameState.subCategory === sub ? 'text-[#22d3ee]' : 'text-slate-400'}`}>{sub}</span>
                          {!isUnlocked && !adsRemoved && <span className="text-[10px] ml-1">🔒</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* START BUTTON */}
          {setupStep >= 3 && validPlayersCount >= 3 && gameState.subCategory && (
            <button 
              onClick={startReveal}
              className="w-full btn-primary py-6 rounded-[24px] font-black text-lg tracking-tight uppercase animate-in zoom-in shadow-[0_0_30px_#22d3ee44]"
            >Check Roles</button>
          )}
        </div>
      )}

      {/* REVEAL PHASE */}
      {gameState.status === 'REVEAL' && (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
          <div className="text-center mb-10">
            <p className="text-[#22d3ee] text-[10px] font-black tracking-[4px] uppercase">Game Setup</p>
            <h2 className="text-3xl font-black text-white mt-1">Reveal your role</h2>
          </div>
          
          <div className="space-y-4">
            {gameState.playerRoles.map((role, i) => (
              <RevealCard key={i} player={role} onReveal={() => setGameState(s => ({...s, revealedCount: s.revealedCount + 1}))} />
            ))}
          </div>

          {gameState.revealedCount === gameState.playerRoles.length && (
            <button 
              onClick={() => {
                const randomRole = gameState.playerRoles[Math.floor(Math.random() * gameState.playerRoles.length)];
                const starter = randomRole ? randomRole.name : '';
                setPendingStarter(starter);
                handleAttemptStartPlaying();
              }}
              disabled={isAdBlocking}
              className="w-full btn-primary py-6 rounded-[24px] font-black text-lg tracking-tight uppercase mt-8 disabled:opacity-50"
            >Start Playing ⚡</button>
          )}
        </div>
      )}

      {/* PLAYING PHASE */}
      {gameState.status === 'STARTING' && (
        <div className="flex flex-col items-center py-12 space-y-12 animate-in zoom-in duration-500">
          <div className="relative">
            <div className="w-56 h-56 rounded-full border-[10px] border-[#22d3ee]/10 flex items-center justify-center p-4">
              <div className="w-full h-full rounded-full bg-slate-900 border-4 border-[#22d3ee] flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                <span className="text-8xl font-black text-[#22d3ee] drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] uppercase">
                  {gameState.firstTurnPlayer ? gameState.firstTurnPlayer[0] : '?'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-[#22d3ee] font-black text-xs tracking-[5px] uppercase">Starting Player</p>
            <h2 className="text-5xl font-black text-white mt-2 drop-shadow-lg">{gameState.firstTurnPlayer}</h2>
            <p className="text-slate-400 mt-2 text-sm">Preparing game — ad will show shortly.</p>
            <div className="mt-4 flex items-center justify-center">
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-black text-slate-200">Ad in <span className="text-[#eab308]">{startAdCountdown}s</span></div>
            </div>
          </div>

          <div className="w-full space-y-3">
            <button disabled className="w-full btn-primary py-6 rounded-[24px] font-black uppercase shadow-lg opacity-50">Play</button>
            <button disabled className="w-full text-slate-600 font-black text-[10px] underline uppercase tracking-widest">Main Menu</button>
          </div>
        </div>
      )}

      {gameState.status === 'PLAYING' && (
        <div className="flex flex-col items-center py-12 space-y-12 animate-in zoom-in duration-500">
          <div className="relative">
            <div className="w-56 h-56 rounded-full border-[10px] border-[#22d3ee]/10 flex items-center justify-center p-4">
              <div className="w-full h-full rounded-full bg-slate-900 border-4 border-[#22d3ee] flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                <span className="text-8xl font-black text-[#22d3ee] drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] uppercase">
                  {gameState.firstTurnPlayer ? gameState.firstTurnPlayer[0] : '?'}
                </span>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-[#22d3ee] px-4 py-2 rounded-xl rotate-12 shadow-xl border-2 border-slate-900">
              <span className="text-[#020617] font-black text-[10px] uppercase tracking-tighter">First Turn</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-[#22d3ee] font-black text-xs tracking-[5px] uppercase">Starting Player</p>
            <h2 className="text-5xl font-black text-white mt-2 drop-shadow-lg">{gameState.firstTurnPlayer}</h2>
          </div>

          <div className="glass-card p-8 rounded-[32px] text-center max-w-xs border-[#22d3ee]/20 relative">
            <p className="text-slate-400 text-sm font-medium leading-relaxed italic">
              "Crewmates describe the topic without naming it. Impostors must blend in. Vote to kick the impostor."
            </p>
          </div>

          <div className="w-full space-y-3">
            <button onClick={() => setGameState(s => ({...s, status: 'SETUP'}))} disabled={isAdBlocking} className="w-full btn-primary py-6 rounded-[24px] font-black uppercase shadow-lg disabled:opacity-50">Play Again</button>
            <button onClick={() => setGameState(s => ({...s, status: 'SETUP'}))} disabled={isAdBlocking} className="w-full text-slate-600 font-black text-[10px] underline uppercase tracking-widest hover:text-slate-400 transition-colors disabled:opacity-50">Main Menu</button>
          </div>
        </div>
      )}

      {/* UNLOCK MODAL (Only if ads are not removed) - rendered via portal to document.body */}
      {modalHost && showUnlockPromptFor && !isWatchingRewardedAd && !adsRemoved && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md transition-all modal-overlay" style={{touchAction: 'none'}}>
          <div
            ref={unlockOverlayRef}
            className="fixed inset-0"
            style={{zIndex: 49, background: DEBUG_SHOW_OVERLAY ? 'rgba(255,0,0,0.04)' : 'transparent', pointerEvents: 'auto'}}
            onPointerDown={(e:any) => { try { if (e.currentTarget === e.target) { e.preventDefault(); e.stopPropagation?.(); } } catch{} }}
          />
          <div
            ref={unlockModalRef}
            className="glass-card w-full modal-content p-10 rounded-[40px] text-center space-y-8"
            style={{
              position: 'fixed',
              // will be measured and locked by effect
              left: '0px',
              top: '0px',
              transform: 'none',
              margin: 0,
              userSelect: 'none',
              WebkitUserSelect: 'none',
              msUserSelect: 'none',
              WebkitUserDrag: 'none',
              touchAction: 'none',
              pointerEvents: 'auto',
              zIndex: 51
            }}
            draggable={false}
            onDragStart={e => e.preventDefault()}
            onPointerDown={(e:any) => { try { unlockModalRef.current?.setPointerCapture?.(e.pointerId); } catch (err) {} }}
            onPointerMove={(e:any) => { try { e.preventDefault(); e.stopPropagation?.(); } catch{} }}
            onPointerUp={(e:any) => { try { unlockModalRef.current?.releasePointerCapture?.(e.pointerId); } catch (err) {} }}
          >
            <div className="text-7xl floating">👑</div>
              <div className="space-y-4">
              <h3 className="text-2xl font-black text-white">Unlock Icons?</h3>
              <p className="text-slate-400 text-sm leading-relaxed px-4">
                Watch a 30s ad to play with legends like <span className="text-[#eab308] font-bold">{GET_LEGEND_EXAMPLES(showUnlockPromptFor)}</span> for 24 hours.
              </p>
            </div>
            <div className="space-y-4">
              <button 
                onClick={handleUnlockLegends}
                className="w-full bg-[#eab308] text-black py-5 rounded-2xl font-black text-lg shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:scale-[1.02] transition-transform uppercase"
              >▶️ Watch Ad & Unlock</button>
              <button 
                onClick={() => setShowPaymentModal(true)}
                className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-black text-xs hover:bg-white/10 transition-all uppercase"
              >✨ Remove Ads for 2.99€</button>
              <button onClick={() => setShowUnlockPromptFor(null)} className="text-slate-500 font-black text-xs uppercase tracking-widest hover:text-slate-300">Maybe Later</button>
            </div>
          </div>
        </div>,
        modalHost
      )}
      {/* GLOBAL AD-BLOCKING OVERLAY (prevents interaction while ad plays) */}
      {isAdBlocking && (
        modalHost ? createPortal(
          <div style={{display: 'grid', placeItems: 'center', padding: 0}} className="fixed inset-0 z-[200] bg-black/70 modal-overlay">
            <div ref={adModalRef} className="glass-card modal-content p-6 rounded-2xl text-center" style={{position: 'relative', left: '0', top: '0', transform: 'none'}}>
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto animate-spin" />
              <p className="mt-4 text-slate-300 font-black">Please wait — ad is playing</p>
            </div>
            {/* debug overlay removed */}
          </div>,
          modalHost
        ) : (
          <div style={{display: 'grid', placeItems: 'center', padding: 0}} className="fixed inset-0 z-[200] bg-black/70 modal-overlay">
            <div ref={adModalRef} className="glass-card modal-content p-6 rounded-2xl text-center" style={{position: 'relative', left: '0', top: '0', transform: 'none'}}>
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto animate-spin" />
              <p className="mt-4 text-slate-300 font-black">Please wait — ad is playing</p>
            </div>
            {/* debug overlay removed */}
          </div>
        )
      )}
    </div>
  );
}

interface RevealCardProps {
  player: { name: string; role: 'CREWMATE' | 'IMPOSTOR'; secret: string };
  onReveal: () => void;
  key?: React.Key;
}

function RevealCard({ player, onReveal }: RevealCardProps) {
  const [state, setState] = useState<'HIDDEN' | 'VISIBLE' | 'DONE'>('HIDDEN');

  if (state === 'DONE') {
    return (
      <div className="glass-card p-4 rounded-3xl flex justify-between items-center opacity-40 grayscale animate-in fade-in duration-300">
        <div>
          <p className="text-[8px] font-black text-slate-500 tracking-widest uppercase">Confirmed</p>
          <p className="text-lg font-black text-slate-400">{player.name}</p>
        </div>
        <div className="px-3 py-1 border border-[#22d3ee]/30 rounded-full">
          <span className="text-[8px] font-black text-[#22d3ee] uppercase">Secret Read</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`glass-card p-6 rounded-[32px] cursor-pointer transition-all duration-500 relative overflow-hidden group ${state === 'VISIBLE' ? 'border-[#22d3ee]/50 scale-[1.02] bg-slate-900/80 shadow-[0_0_20px_#22d3ee22]' : 'hover:border-white/20 active:scale-[0.98]'}`}
      onClick={() => {
        if (state === 'HIDDEN') {
          setState('VISIBLE');
          onReveal();
        } else {
          setState('DONE');
        }
      }}
    >
      {state === 'HIDDEN' ? (
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[8px] font-black text-slate-500 tracking-widest uppercase">Tap to reveal role</p>
            <p className="text-xl font-black text-white">{player.name}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl group-hover:bg-[#22d3ee]/10 transition-all border border-white/5">👁️</div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[8px] font-black text-slate-500 tracking-widest uppercase">Identity</p>
              <p className={`text-4xl font-black uppercase tracking-tighter ${player.role === 'IMPOSTOR' ? 'text-red-500 drop-shadow-[0_0_10px_#ef4444]' : 'text-[#22d3ee] drop-shadow-[0_0_10px_#22d3ee]'}`}>{player.role}</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{player.name}</span>
            </div>
          </div>
          <div className="bg-black/60 rounded-3xl p-6 border border-white/10 text-center relative overflow-hidden group/box">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <p className="text-[8px] font-black text-slate-600 tracking-[3px] mb-2 uppercase">Subject Secret</p>
            <p className="text-3xl font-black text-white tracking-tight uppercase group-hover/box:scale-[1.05] transition-transform">{player.secret}</p>
            <div className="scan-line opacity-20" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] animate-ping" />
            <p className="text-center text-[8px] font-black text-slate-600 uppercase tracking-widest">Tap again to hide from others</p>
          </div>
        </div>
      )}
      {state === 'VISIBLE' && <div className="scan-line" />}
    </div>
  );
}
