import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { COLOUR_PRESETS, normalizeColour } from '../colour';

interface ColourPickerProps {
  colour: string | null;
  onChange: (colour: string | null) => void;
  label: string;
  children: React.ReactNode;
  className?: string;
}

type PopoverCoords = { top: number; left: number };

const ColourPicker: React.FC<ColourPickerProps> = ({
  colour,
  onChange,
  label,
  children,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [hexDraft, setHexDraft] = useState(colour ?? '');
  const [coords, setCoords] = useState<PopoverCoords | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (open) setHexDraft(colour ?? '');
  }, [open, colour]);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;

    const place = () => {
      const trigger = rootRef.current!.getBoundingClientRect();
      const panel = panelRef.current;
      const panelWidth = panel?.offsetWidth ?? 196;
      const panelHeight = panel?.offsetHeight ?? 200;
      const gap = 6;
      const margin = 8;

      let top = trigger.bottom + gap;
      if (top + panelHeight > window.innerHeight - margin) {
        top = trigger.top - panelHeight - gap;
      }
      top = Math.max(margin, top);

      let left = trigger.left;
      if (left + panelWidth > window.innerWidth - margin) {
        left = window.innerWidth - panelWidth - margin;
      }
      left = Math.max(margin, left);

      setCoords({ top, left });
    };

    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const applyHex = () => {
    const trimmed = hexDraft.trim();
    if (!trimmed) {
      onChange(null);
      setHexDraft('');
      return;
    }
    const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    const normalized = normalizeColour(withHash);
    if (normalized) {
      onChange(normalized);
      setHexDraft(normalized);
      setOpen(false);
    } else {
      setHexDraft(colour ?? '');
    }
  };

  const triggerLabel = colour === null ? `Add colour for ${label}` : `Colour for ${label}`;

  return (
    <div className={`colour-picker ${className}`.trim()} ref={rootRef}>
      <button
        type="button"
        className="colour-picker-trigger"
        aria-label={triggerLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        data-colour={colour ?? undefined}
        onClick={() => setOpen((value) => !value)}
      >
        {children}
      </button>

      {open &&
        createPortal(
          <div
            id={panelId}
            ref={panelRef}
            className="colour-picker-popover"
            role="dialog"
            aria-label={`Choose colour for ${label}`}
            style={
              coords
                ? { top: coords.top, left: coords.left }
                : { top: -9999, left: -9999, visibility: 'hidden' }
            }
          >
            <div className="colour-swatches" role="listbox" aria-label="Preset colours">
              <button
                type="button"
                className={`colour-swatch colour-swatch-none${colour === null ? ' selected' : ''}`}
                aria-label="No colour"
                aria-selected={colour === null}
                role="option"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                None
              </button>
              {COLOUR_PRESETS.map((preset) => {
                const selected = colour === preset.hex;
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    className={`colour-swatch${selected ? ' selected' : ''}`}
                    style={{ backgroundColor: preset.hex }}
                    aria-label={preset.name}
                    aria-selected={selected}
                    role="option"
                    title={preset.name}
                    onClick={() => {
                      onChange(preset.hex);
                      setOpen(false);
                    }}
                  />
                );
              })}
            </div>

            <div className="colour-hex-row">
              <label className="colour-hex-label" htmlFor={`${panelId}-hex`}>
                Hex
              </label>
              <input
                id={`${panelId}-hex`}
                className="colour-hex-input"
                aria-label={`Custom hex for ${label}`}
                value={hexDraft}
                placeholder="#1e3a5f"
                spellCheck={false}
                autoComplete="off"
                onChange={(event) => setHexDraft(event.target.value)}
                onBlur={applyHex}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    applyHex();
                  }
                }}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ColourPicker;
