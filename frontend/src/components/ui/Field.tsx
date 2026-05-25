"use client";

import React, {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
  useId,
} from "react";
import { tokens } from "@/styles/tokens";
import { cn } from "@/lib/cn";
import { Caption, BodySm } from "./typography";

interface FieldShellProps {
  label?: ReactNode;
  helper?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** Wraps the input with leading/trailing slots (e.g., icon, button). */
  leading?: ReactNode;
  trailing?: ReactNode;
}

interface InputFieldProps
  extends InputHTMLAttributes<HTMLInputElement>,
    FieldShellProps {
  /** Renders as a standard text input by default. */
  multiline?: false;
}

interface TextareaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    FieldShellProps {
  multiline: true;
}

type FieldProps = InputFieldProps | TextareaFieldProps;

/**
 * <Field>
 * Unified input/textarea with label + helper + error states.
 * One focus ring style across the whole app.
 */
export const Field = (props: FieldProps) => {
  const reactId = useId();
  const id = props.id ?? reactId;
  const {
    label,
    helper,
    error,
    required,
    leading,
    trailing,
    className,
    multiline,
    ...rest
  } = props as FieldShellProps & {
    multiline?: boolean;
    className?: string;
    id?: string;
  } & Record<string, unknown>;

  const hasError = Boolean(error);

  return (
    <div
      className={cn("ui-field", hasError && "ui-field--error", className)}
      style={{ display: "flex", flexDirection: "column", gap: tokens.space[2] }}
    >
      {label && (
        <label
          htmlFor={id}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: tokens.space[1],
          }}
        >
          <Caption tone="muted">{label}</Caption>
          {required && (
            <span style={{ color: tokens.color.danger }} aria-hidden>
              *
            </span>
          )}
        </label>
      )}
      <div className={cn("ui-field__shell", hasError && "ui-field__shell--error")}>
        {leading && <span className="ui-field__slot">{leading}</span>}
        {multiline ? (
          <textarea
            id={id}
            className="ui-field__input"
            aria-invalid={hasError || undefined}
            aria-describedby={
              helper || error ? `${id}-helper` : undefined
            }
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={id}
            className="ui-field__input"
            aria-invalid={hasError || undefined}
            aria-describedby={
              helper || error ? `${id}-helper` : undefined
            }
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {trailing && <span className="ui-field__slot">{trailing}</span>}
      </div>
      {(error || helper) && (
        <BodySm
          id={`${id}-helper`}
          tone={hasError ? "default" : "muted"}
          style={{ color: hasError ? tokens.color.danger : undefined }}
        >
          {error ?? helper}
        </BodySm>
      )}
    </div>
  );
};
