"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { cn } from "@/components/ui/cn";
import { useLocale } from "@/lib/i18n/locale-context";
import { customSkill } from "@/lib/skills";
import type { Skill, SkillRef } from "@/types";

const MAX_RESULTS = 6;

interface Option {
  key: string;
  skill: SkillRef;
  /** The alias the query matched, when it is not the skill's own name. */
  alias?: string;
  custom?: boolean;
}

interface SkillPickerProps {
  label: string;
  catalogue: Skill[];
  /** Skill ids already used in any tier; they are not offered again. */
  takenIds: Set<string>;
  onAdd: (skill: SkillRef) => void;
}

function normalise(text: string): string {
  return text.trim().toLowerCase();
}

/**
 * Skill autocomplete (ARIA combobox). Searches names in both languages and aliases, so
 * "ReactJS" finds React. Text that matches nothing can be added as a custom skill, flagged for review.
 */
export function SkillPicker({ label, catalogue, takenIds, onAdd }: SkillPickerProps) {
  const { t, l } = useLocale();
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const options = useMemo<Option[]>(() => {
    const q = normalise(query);
    if (!q) return [];
    const found: Option[] = [];
    for (const skill of catalogue) {
      if (takenIds.has(skill.id)) continue;
      const names = [skill.name.en, skill.name.ar ?? ""].map(normalise);
      const alias = skill.aliases.find((item) => normalise(item).includes(q));
      if (names.some((name) => name.includes(q)) || alias) {
        const viaAlias = !names.some((name) => name.includes(q)) ? alias : undefined;
        found.push({ key: skill.id, skill: { id: skill.id, name: skill.name }, alias: viaAlias });
      }
      if (found.length === MAX_RESULTS) break;
    }
    const exact = catalogue.some(
      (skill) => normalise(skill.name.en) === q || normalise(skill.name.ar ?? "") === q,
    );
    if (!exact) {
      const custom = customSkill(query);
      if (!takenIds.has(custom.id)) found.push({ key: custom.id, skill: custom, custom: true });
    }
    return found;
  }, [query, catalogue, takenIds]);

  function choose(option: Option) {
    onAdd(option.skill);
    setQuery("");
    setOpen(false);
    setActive(0);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((current) => Math.min(options.length - 1, current + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(0, current - 1));
    } else if (event.key === "Enter" && open && options[active]) {
      event.preventDefault();
      choose(options[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const listId = `${id}-list`;
  const expanded = open && options.length > 0;

  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        role="combobox"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={expanded ? `${id}-option-${active}` : undefined}
        autoComplete="off"
        value={query}
        placeholder={t("skillPicker.placeholder")}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
        onBlur={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        className="h-10 w-full rounded-lg border border-border-default bg-surface px-3 text-base text-text-primary transition-colors duration-150 placeholder:text-text-disabled hover:border-text-disabled focus-visible:outline-2 focus-visible:outline-border-focus"
      />
      {expanded && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute inset-x-0 top-full z-20 mt-1 animate-fade-up overflow-hidden rounded-lg border border-border-default bg-surface py-1 shadow-lg"
        >
          {options.map((option, index) => (
            <li
              key={option.key}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={index === active}
              // mousedown (not click) so the input doesn't blur and close the list first.
              onMouseDown={(event) => {
                event.preventDefault();
                choose(option);
              }}
              onMouseEnter={() => setActive(index)}
              className={cn(
                "flex cursor-pointer flex-col px-3 py-2 text-base",
                index === active ? "bg-primary/10 text-primary" : "text-text-primary",
              )}
            >
              <span className="font-semibold">
                {option.custom ? t("skillPicker.addCustom", { text: option.skill.name.en }) : l(option.skill.name)}
              </span>
              {option.alias && (
                <span className="text-sm text-text-secondary">{t("skillPicker.alias", { alias: option.alias })}</span>
              )}
              {option.custom && (
                <span className="text-sm text-text-secondary">{t("skillPicker.customNote")}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
