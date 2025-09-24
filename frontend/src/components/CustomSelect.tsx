// src/components/CustomSelect.tsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import downSharp from "../assets/downSharp.svg";

export type Option = { value: string; label: string };

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
};

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  id = "custom-select",
  className = "",
  onFocus,
  onBlur,
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement | null>(null); // containing wrapper
  const controlRef = useRef<HTMLDivElement | null>(null); // the clickable control
  const itemsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const panelRef = useRef<HTMLUListElement | null>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  // track whether last interaction was keyboard
  const lastInteractionWasKeyboard = useRef<boolean>(false);
  useEffect(() => {
    const onKey = () => (lastInteractionWasKeyboard.current = true);
    const onMouse = () => (lastInteractionWasKeyboard.current = false);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("mousedown", onMouse, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("mousedown", onMouse, true);
    };
  }, []);

  // compute panel position & width based on control bounding rect
  const computePanelPosition = () => {
    const ctrl = controlRef.current;
    if (!ctrl) return;
    const rect = ctrl.getBoundingClientRect();
    // position the top just below the control (+9px gap like you used earlier)
    const top = rect.bottom + 9 + window.scrollY;
    const left = rect.left + window.scrollX;
    // prefer using control width — but cap to 376px if control is wider (keeps Figma width)
    const width = Math.min(Math.max(rect.width, 0), 376);
    setPanelStyle({
      position: "absolute",
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      zIndex: 9999,
    });
  };

  // update panel position on open, resize, scroll
  useEffect(() => {
    if (!open) return;
    computePanelPosition();
    const onWin = () => computePanelPosition();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true); // capture scrolling in ancestors
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // close on outside click — but account that panel lives in body
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapperRef.current && wrapperRef.current.contains(target)) return;
      if (panelRef.current && panelRef.current.contains(target)) return;
      setOpen(false);
      onBlur?.();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onBlur]);

  // when opening: set active index and only programmatically focus items for keyboard opens
  useEffect(() => {
    if (open) {
      const idx = options.findIndex((o) => o.value === value);
      const start = idx >= 0 ? idx : 0;
      setActiveIndex(start);
      // focus only if opened via keyboard (prevents mouse flicker)
      if (lastInteractionWasKeyboard.current) {
        setTimeout(() => itemsRef.current[start]?.focus(), 0);
      }
    }
  }, [open, options, value]);

  // keyboard handler for control
  const onControlKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((s) => !s);
      if (!open) {
        computePanelPosition();
        onFocus?.();
      } else onBlur?.();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      computePanelPosition();
      setTimeout(() => itemsRef.current[0]?.focus(), 0);
      onFocus?.();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      computePanelPosition();
      setTimeout(() => itemsRef.current[options.length - 1]?.focus(), 0);
      onFocus?.();
    }
  };

  // keyboard nav inside list
  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => {
        const next = Math.min(i + 1, options.length - 1);
        itemsRef.current[next]?.focus();
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => {
        const prev = Math.max(i - 1, 0);
        itemsRef.current[prev]?.focus();
        return prev;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < options.length) {
        const opt = options[activeIndex];
        onChange(opt.value);
        setOpen(false);
        controlRef.current?.blur();
        onBlur?.();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      controlRef.current?.blur();
      onBlur?.();
    }
  };

  // render the dropdown panel into a portal
  const panelNode = (
    <ul
      ref={panelRef}
      id={`${id}-listbox`}
      role="listbox"
      tabIndex={-1}
      onKeyDown={onListKey}
      style={panelStyle}
      className="max-h-[192px] overflow-auto bg-white rounded-[10px] shadow-[0_0_14px_rgba(147,147,147,0.25)] p-0 flex flex-col items-start"
    >
      {options.map((opt, i) => {
        const selected = opt.value === value;
        const isFirst = i === 0;
        const isLast = i === options.length - 1;
        return (
          <li
            key={opt.value}
            role="option"
            aria-selected={selected}
            className="w-full"
          >
            <button
              ref={(el) => {
                itemsRef.current[i] = el;
              }}
              // prevent mouse click from focusing this button (avoid focus flicker)
              onMouseDown={(e) => e.preventDefault()}
              type="button"
              className={`list-btn w-full text-left px-4 h-[48px] flex items-center text-[16px] font-[500] ${
                selected
                  ? "bg-[#EFEFEF] text-[#222222]"
                  : "bg-white text-[#222222]"
              } hover:bg-[#F4F4F4] ${isFirst ? "rounded-t-[10px]" : ""} ${
                isLast ? "rounded-b-[10px]" : ""
              }`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
                controlRef.current?.blur();
                onBlur?.();
              }}
            >
              {opt.label}
            </button>
          </li>
        );
      })}
      {/* local CSS overrides to ensure no UA outline box appears */}
      <style>{`
        /* remove Firefox inner focus border for these option buttons only */
        #${id}-listbox button::-moz-focus-inner { border: 0; padding: 0; }
        /* remove any browser outline/box-shadow for these option buttons (targeted) */
        #${id}-listbox button:focus, #${id}-listbox button:focus-visible {
          outline: none !important;
          box-shadow: none !important;
        }
        /* tiny scrollbar nicety */
        #${id}-listbox::-webkit-scrollbar { height: 8px; width: 8px; }
        #${id}-listbox::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 8px; }
        #${id}-listbox { -webkit-overflow-scrolling: touch; }
      `}</style>
    </ul>
  );

  return (
    <>
      {/* wrapper used to determine control position and provide a non-portal anchor */}
      <div ref={wrapperRef} className={`relative w-full ${className}`}>
        <div
          ref={controlRef}
          role="button"
          tabIndex={0}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          className={`w-full h-full pl-4 pr-[20px] flex items-center justify-between cursor-pointer select-none
                      transition-colors duration-150 ${
                        value ? "text-[#222222]" : "text-[#BCBCBC]"
                      }`}
          onClick={() => {
            // clicking is a mouse interaction so lastInteractionWasKeyboard will be false
            setOpen((s) => !s);
            if (!open) {
              computePanelPosition();
              onFocus?.();
            } else onBlur?.();
          }}
          onKeyDown={onControlKey}
          onFocus={() => onFocus?.()}
          onBlur={() => {
            if (!open) onBlur?.();
          }}
          style={{ outline: "none" }}
        >
          <span className="truncate text-[16px] pt-[17px] pb-[17px]">
            {options.find((o) => o.value === value)?.label ?? placeholder}
          </span>
          <img src={downSharp} alt="v" />
        </div>
      </div>

      {/* portal: render panel into body so it's never clipped by ancestors */}
      {open &&
        createPortal(
          panelNode,
          // append to body
          document.body
        )}
    </>
  );
}
