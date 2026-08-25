import { useEffect, useRef } from 'react';

/**
 * useModalA11y - 모달 컴포넌트 공통 접근성 훅
 *
 * 제공하는 기능:
 * 1. ESC 키로 모달 닫기
 * 2. 모달이 열릴 때 내부 첫 포커스 가능 요소로 포커스 이동
 * 3. Tab / Shift+Tab 키가 모달 내부에서만 순환하도록 포커스 트랩
 * 4. 모달이 닫히면 모달을 열기 전 포커스였던 요소로 되돌림
 *
 * 사용법:
 *   const panelRef = useModalA11y(isOpen, onClose);
 *   <div ref={panelRef}> ...모달 내용... </div>
 */
export function useModalA11y(isOpen: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement | null;

    const getFocusableElements = (): HTMLElement[] => {
      if (!panelRef.current) return [];
      const selector =
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const nodeList = panelRef.current.querySelectorAll<HTMLElement>(selector);
      const elements: HTMLElement[] = [];
      nodeList.forEach((el) => {
        if (el.offsetParent !== null) {
          elements.push(el);
        }
      });
      return elements;
    };

    // 모달이 열리면 내부 첫 포커스 가능 요소로 이동 (없으면 패널 자체로)
    const focusables = getFocusableElements();
    if (focusables.length > 0) {
      focusables[0].focus();
    } else {
      panelRef.current?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const items = getFocusableElements();
        if (items.length === 0) return;

        const first = items[0];
        const last = items[items.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // 모달을 열기 전 포커스였던 요소로 복원 (버튼을 눌러 모달을 연 경우가 대부분)
      previouslyFocusedElement.current?.focus?.();
    };
  }, [isOpen, onClose]);

  return panelRef;
}
