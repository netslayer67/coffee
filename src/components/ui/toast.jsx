'use client';

import { cn } from '@/lib/utils';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import React from 'react';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Viewport
		ref={ref}
		className={cn(
			'fixed z-[100] top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 max-w-[90%] sm:max-w-sm flex flex-col gap-3 p-2',
			className
		)}
		{...props}
	/>
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
	'group relative pointer-events-auto w-full rounded-xl border p-5 pr-8 shadow-xl backdrop-blur-md bg-white/10 border-white/20 text-white transition-all overflow-hidden ring-1 ring-white/10',
	{
		variants: {
			variant: {
				default:
					'bg-white/10 text-white hover:ring-white/20 hover:shadow-2xl',
				destructive:
					'bg-red-600/20 text-red-100 border-red-300/30 ring-red-400/20 hover:bg-red-600/30',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	}
);

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => (
	<ToastPrimitives.Root
		ref={ref}
		className={cn(toastVariants({ variant }), className)}
		{...props}
	/>
));
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Action
		ref={ref}
		className={cn(
			'inline-flex items-center justify-center rounded-md border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50',
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
			'absolute top-2 right-2 text-white/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded-md p-1 transition-opacity',
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
		className={cn('text-base font-semibold tracking-wide', className)}
		{...props}
	/>
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Description
		ref={ref}
		className={cn('text-sm opacity-80 mt-1', className)}
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
