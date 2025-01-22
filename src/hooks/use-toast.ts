"use client";

// Inspired by react-hot-toast library
import * as React from "react";

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast";

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

/**
 * Generates a unique sequential identifier for toast notifications.
 * 
 * @remarks
 * Increments a global counter and ensures it stays within safe integer range by using modulo operation.
 * 
 * @returns A string representation of the generated unique identifier
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
  case "ADD_TOAST":
    return {
      ...state,
      toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
    };

  case "UPDATE_TOAST":
    return {
      ...state,
      toasts: state.toasts.map((t) =>
        t.id === action.toast.id ? { ...t, ...action.toast } : t
      ),
    };

  case "DISMISS_TOAST": {
    const { toastId } = action;

    // ! Side effects ! - This could be extracted into a dismissToast() action,
    // but I'll keep it here for simplicity
    if (toastId) {
      addToRemoveQueue(toastId);
    } else {
      state.toasts.forEach((toast) => {
        addToRemoveQueue(toast.id);
      });
    }

    return {
      ...state,
      toasts: state.toasts.map((t) =>
        t.id === toastId || toastId === undefined
          ? {
            ...t,
            open: false,
          }
          : t
      ),
    };
  }
  case "REMOVE_TOAST":
    if (action.toastId === undefined) {
      return {
        ...state,
        toasts: [],
      };
    }
    return {
      ...state,
      toasts: state.toasts.filter((t) => t.id !== action.toastId),
    };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

/**
 * Dispatches an action to update the toast notification state.
 * 
 * @remarks
 * This function updates the global memory state by applying the given action through the reducer,
 * and then notifies all registered listeners with the new state.
 * 
 * @param action - The action to be dispatched for modifying the toast state
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, "id">

/**
 * Creates and manages a new toast notification.
 *
 * @remarks
 * Generates a unique toast with customizable properties and provides methods to update or dismiss it.
 *
 * @param props - Configuration options for the toast notification
 * @returns An object containing the toast's unique identifier, and methods to dismiss or update the toast
 *
 * @example
 * const myToast = toast({
 *   title: "Success",
 *   description: "Operation completed successfully",
 *   variant: "success"
 * });
 * 
 * // Later, if needed
 * myToast.update({ description: "Updated message" });
 * myToast.dismiss();
 */
function toast({ ...props }: Toast) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

/**
 * Provides access to the toast notification system and its state.
 *
 * @remarks
 * This hook manages the current state of toast notifications and provides methods
 * to interact with toasts. It synchronizes with a global memory state and allows
 * components to subscribe to toast updates.
 *
 * @returns An object containing:
 * - Current toast state (toasts array)
 * - `toast` function for creating new toasts
 * - `dismiss` method to close specific or all toasts
 *
 * @example
 * ```typescript
 * const { toasts, toast, dismiss } = useToast();
 * 
 * // Create a new toast
 * toast({ title: 'Success', description: 'Operation completed' });
 * 
 * // Dismiss a specific toast
 * dismiss(toastId);
 * 
 * // Dismiss all toasts
 * dismiss();
 * ```
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };
