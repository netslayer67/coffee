import { cn } from '@/lib/utils';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import React from 'react';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Viewport
		ref={ref}
		className={cn(
			'fixed z-[100] flex flex-col gap-3 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] top-0 w-full max-h-screen flex-col-reverse',
			className
		)}
		{...props}
	/>
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const Toast = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
	<ToastPrimitives.Root
		ref={ref}
		className={cn(
			'group relative pointer-events-auto flex w-full items-start justify-between gap-4 overflow-hidden rounded-2xl border p-6 pr-10 shadow-2xl backdrop-blur-xl transition-all duration-500 ease-out will-change-transform bg-gradient-to-br from-white/10 via-white/5 to-white/10 border-white/20',
			'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
			'data-[swipe=cancel]:translate-x-0',
			'data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=end]:animate-out',
			'data-[state=open]:animate-in data-[state=closed]:animate-out',
			'data-[state=open]:fade-in-90 data-[state=closed]:fade-out-80',
			'data-[state=open]:slide-in-from-bottom-full sm:data-[state=open]:slide-in-from-bottom-full',
			'data-[state=closed]:slide-out-to-right-full',
			'bg-white/10 border border-white/20 shadow-[inset_0_0_0.5px_rgba(255,255,255,0.3),0_10px_30px_rgba(0,0,0,0.3)] text-white font-sans',
			className
		)}
		{...props}
	/>
));
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Action
		ref={ref}
		className={cn(
			'inline-flex h-8 items-center justify-center rounded-md border border-white/20 bg-white/10 px-4 text-sm font-medium text-white hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/30',
			className
		)}
		{...props}
	/>
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Close
		ref={ref}
		className={cn(
			'absolute right-3 top-3 text-white/60 hover:text-white transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/40 rounded-full p-1 backdrop-blur-md',
			className
		)}
		toast-close=""
		{...props}
	>
		<X className="h-4 w-4" />
	</ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Title
		ref={ref}
		className={cn('text-sm font-semibold text-white tracking-wide', className)}
		{...props}
	/>
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Description
		ref={ref}
		className={cn('text-sm text-white/80', className)}
		{...props}
	/>
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export {
	Toast,
	ToastAction,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
};
