import React from "react";
import { forwardRef } from "react";

type BaseProps = {
  className?: string;
  label?: string;
  type?: "text" | "password" | "email" | "number" | "textarea";
};

type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;

type TextareaProps = BaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type Props = InputProps | TextareaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  ({ label, type = "text", className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block font-semibold text-gray-300 mb-1">
            {label}
          </label>
        )}

        {type === "textarea" ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className="w-full outline-none border border-gray-300 rounded-md p-2 bg-transparent text-white "
            {...(props as TextareaProps)}
          />
        ) : (
          <input
            type={type}
            ref={ref as React.Ref<HTMLInputElement>}
            className="w-full outline-none border border-gray-300 rounded-md p-2 bg-black text-white "
            {...(props as InputProps)}
          />
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;