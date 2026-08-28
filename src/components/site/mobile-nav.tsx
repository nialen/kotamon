'use client';

import { List, X } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

import type { PublicNavigationGroup } from '@/content/routes';

type MobileNavProps = {
  readonly groups: readonly PublicNavigationGroup[];
};

export function MobileNav({ groups }: MobileNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return;
      }

      setIsOpen(false);
      triggerRef.current?.focus();
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div className="mobile-nav" ref={containerRef}>
      <button
        aria-controls="mobile-navigation-panel"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        className="icon-button mobile-nav__trigger"
        onClick={() => setIsOpen((open) => !open)}
        ref={triggerRef}
        type="button"
      >
        {isOpen ? (
          <X aria-hidden="true" size={22} weight="bold" />
        ) : (
          <List aria-hidden="true" size={22} weight="bold" />
        )}
      </button>

      <div
        className="mobile-nav__panel"
        hidden={!isOpen}
        id="mobile-navigation-panel"
      >
        <nav aria-label="Mobile navigation">
          {groups.map((group) => (
            <section className="mobile-nav__group" key={group.label}>
              <h2>{group.label}</h2>
              <ul>
                {group.items.map((item) => (
                  <li key={item.href}>
                    <a aria-current={pathname === item.href ? 'page' : undefined} href={item.href} onClick={() => setIsOpen(false)}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </div>
    </div>
  );
}
