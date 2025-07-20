import React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ToastProvider wraps the entire toast system and handles lifecycles.
 */
const ToastProvider = ToastPrimitives.Provider;

/**
 * ToastViewport defines where toasts are rendered.
 */
const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Viewport
		ref={ref}
		className={cn(
			'fixed z-[100] flex flex-col-reverse gap-3 p-4',
			'top-0 left-1/2 transform -translate-x-1/2 sm:top-auto sm:right-0 sm:left-auto sm:bottom-0 sm:translate-x-0',
			'w-full max-w-sm sm:max-w-[420px]',
			className
		)}
		{...props}
	/>
));
ToastViewport.displayName = 'ToastViewport';

/**
 * Main Toast Component
 */
const Toast = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
	<ToastPrimitives.Root
		ref={ref}
		className={cn(
			// Base layout and animation
			'relative pointer-events-auto flex w-full items-start justify-between overflow-hidden',
			'rounded-2xl p-6 pr-12 backdrop-blur-[1.5px] shadow-xl transition-transform duration-500 ease-in-out',

			// Swipe gestures
			'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
			'data-[swipe=cancel]:translate-x-0',
			'data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=end]:animate-out',
			'data-[state=open]:animate-in data-[state=closed]:animate-out',
			'data-[state=open]:fade-in-90 data-[state=closed]:fade-out-80',
			'data-[state=open]:slide-in-from-bottom-full sm:data-[state=open]:slide-in-from-bottom-full',
			'data-[state=closed]:slide-out-to-right-full',

			// Glass + Liquid effect
			'bg-neutral-300/20 hover:bg-neutral-300/30 dark:bg-neutral-400/20 dark:hover:bg-neutral-400/30',
			'border border-neutral-400/20',
			'text-neutral-700 dark:text-neutral-200',
			'shadow-[inset_0_0_0.5px_rgba(255,255,255,0.2),0_8px_30px_rgba(0,0,0,0.25)]',

			// Typography
			'font-sans tracking-tight',

			className
		)}
		{...props}
	/>
));
Toast.displayName = 'Toast';

/**
 * Toast Close Button
 */
const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Close
		ref={ref}
		aria-label="Close"
		className={cn(
			'absolute right-3 top-3 rounded-full p-1',
			'text-neutral-700/60 dark:text-neutral-200/60 hover:text-white hover:bg-white/10 dark:hover:bg-white/10',
			'transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100',
			'focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur',
			className
		)}
		{...props}
	>
		<X className="h-4 w-4" />
	</ToastPrimitives.Close>
));
ToastClose.displayName = 'ToastClose';

/**
 * Toast Action (e.g., Undo)
 */
const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Action
		ref={ref}
		className={cn(
			'inline-flex h-8 items-center justify-center rounded-md border px-4 text-sm font-medium',
			'border-white/20 bg-white/10 hover:bg-white/20 text-white',
			'transition-colors focus:outline-none focus:ring-2 focus:ring-white/30',
			className
		)}
		{...props}
	/>
));
ToastAction.displayName = 'ToastAction';

/**
 * Toast Title
 */
const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Title
		ref={ref}
		className={cn('text-base font-semibold leading-snug text-white', className)}
		{...props}
	/>
));
ToastTitle.displayName = 'ToastTitle';

/**
 * Toast Description (subtext)
 */
const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Description
		ref={ref}
		className={cn('text-sm text-white/80 mt-1', className)}
		{...props}
	/>
));
ToastDescription.displayName = 'ToastDescription';

export {
	Toast,
	ToastAction,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
};
