import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HexColorPicker } from 'react-colorful';
import { PiCaretLeft, PiPlus } from 'react-icons/pi';
import { COLOUR_PRESETS, normalizeColour } from '../colour';

interface ColourPickerProps {
  colour: string | null;
  onChange: (colour: string | null) => void;
  label: string;
  children: React.ReactNode;
  className?: string;
}

type PopoverCoords = { top: number; left: number };
type PanelView = 'presets' | 'custom';

const PRESET_HEXES = new Set(COLOUR_PRESETS.map((preset) => preset.hex));
const DEFAULT_CUSTOM = '#808080';

const ColourPicker: React.FC<ColourPickerProps> = ({
  colour,
  onChange,
  label,
  children,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<PanelView>('presets');
  const [hexDraft, setHexDraft] = useState(colour ?? DEFAULT_CUSTOM);
  const [coords, setCoords] = useState<PopoverCoords | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const isCustomSelected = colour !== null && !PRESET_HEXES.has(colour);
  const pickerColour = normalizeColour(hexDraft) ?? colour ?? DEFAULT_CUSTOM;

  // Only reset panel state when the popover opens — not when colour changes while picking.
  useEffect(() => {
    if (!open) return;
    setView('presets');
    setHexDraft(
      colour !== null && !PRESET_HEXES.has(colour) ? colour : DEFAULT_CUSTOM
    );
    // colour intentionally omitted: live custom picks would bounce back to presets
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;

    const place = () => {
      const trigger = rootRef.current!.getBoundingClientRect();
      const panel = panelRef.current;
      const panelWidth = panel?.offsetWidth ?? 200;
      const panelHeight = panel?.offsetHeight ?? 220;
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
  }, [open, view]);

  useEffect(() => {
    if (!open) return;

    const isInsidePicker = (event: Event) => {
      const target = event.target;
      if (
        target instanceof Node &&
        (rootRef.current?.contains(target) || panelRef.current?.contains(target))
      ) {
        return true;
      }
      const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
      return path.some(
        (node) => node === rootRef.current || node === panelRef.current
      );
    };

    const onPointerDown = (event: PointerEvent) => {
      if (isInsidePicker(event)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (view === 'custom') setView('presets');
        else setOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, view]);

  const openCustomView = () => {
    setHexDraft(isCustomSelected && colour ? colour : DEFAULT_CUSTOM);
    setView('custom');
  };

  const applyCustomColour = (value: string) => {
    const normalized = normalizeColour(value);
    if (!normalized) return;
    setHexDraft(normalized);
    onChange(normalized);
  };

  const commitHexDraft = (close = false) => {
    const trimmed = hexDraft.trim();
    const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    const normalized = normalizeColour(withHash);
    if (normalized) {
      applyCustomColour(normalized);
      if (close) setOpen(false);
    } else {
      setHexDraft(colour ?? DEFAULT_CUSTOM);
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
            {view === 'presets' ? (
              <>
                <div className="colour-swatches" role="listbox" aria-label="Preset colours">
                  <button
                    type="button"
                    className={`colour-swatch colour-swatch-none${colour === null ? ' selected' : ''}`}
                    aria-label="No colour"
                    aria-selected={colour === null}
                    role="option"
                    title="No colour"
                    onClick={() => {
                      onChange(null);
                      setOpen(false);
                    }}
                  >
                    <span className="colour-swatch-none-slash" aria-hidden />
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
                <button
                  type="button"
                  className={`colour-custom-trigger${isCustomSelected ? ' selected' : ''}`}
                  aria-label="Custom colour"
                  onClick={openCustomView}
                >
                  <span
                    className="colour-custom-trigger-swatch"
                    style={isCustomSelected ? { backgroundColor: colour! } : undefined}
                  >
                    {!isCustomSelected && <PiPlus aria-hidden />}
                  </span>
                  Custom colour
                </button>
              </>
            ) : (
              <div className="colour-custom-panel">
                <div className="colour-custom-header">
                  <button
                    type="button"
                    className="colour-custom-back"
                    onClick={() => setView('presets')}
                  >
                    <PiCaretLeft aria-hidden />
                    Colours
                  </button>
                  <span
                    className="colour-custom-preview"
                    style={{ backgroundColor: pickerColour }}
                    aria-hidden
                  />
                </div>
                <HexColorPicker color={pickerColour} onChange={applyCustomColour} />
                <div className="colour-hex-row">
                  <input
                    id={`${panelId}-hex`}
                    className="colour-hex-input"
                    aria-label={`Custom colour for ${label}`}
                    value={hexDraft}
                    placeholder="#808080"
                    spellCheck={false}
                    autoComplete="off"
                    onChange={(event) => setHexDraft(event.target.value)}
                    onBlur={() => commitHexDraft(false)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        commitHexDraft(true);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="colour-custom-done"
                    onClick={() => commitHexDraft(true)}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

export default ColourPicker;
