import { useSyncExternalStore } from "react";

export interface CartItem {
	id: string;
	name: string;
	price: number;
	imageUrl?: string | null;
	quantity: number;
}

export interface WishlistItem {
	id: string;
	name: string;
	price: number;
	imageUrl?: string | null;
}

// In-memory + LocalStorage reactive store
let cartState: CartItem[] = [];
let wishlistState: WishlistItem[] = [];

const listeners = new Set<() => void>();

function notify() {
	if (typeof window !== "undefined") {
		try {
			localStorage.setItem("nord_cart", JSON.stringify(cartState));
			localStorage.setItem("nord_wishlist", JSON.stringify(wishlistState));
		} catch {
			// ignore storage errors
		}
	}
	for (const listener of listeners) {
		listener();
	}
}

// Initial hydration from LocalStorage on browser
if (typeof window !== "undefined") {
	try {
		const savedCart = localStorage.getItem("nord_cart");
		if (savedCart) cartState = JSON.parse(savedCart);
		const savedWish = localStorage.getItem("nord_wishlist");
		if (savedWish) wishlistState = JSON.parse(savedWish);
	} catch {
		// ignore parsing errors
	}
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export const cartStore = {
	get: () => cartState,
	addItem: (product: { id: string; name: string; price: number; imageUrl?: string | null }) => {
		const existing = cartState.find((item) => item.id === product.id);
		if (existing) {
			cartState = cartState.map((item) =>
				item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
			);
		} else {
			cartState = [...cartState, { ...product, quantity: 1 }];
		}
		notify();
	},
	removeItem: (id: string) => {
		cartState = cartState.filter((item) => item.id !== id);
		notify();
	},
	updateQuantity: (id: string, delta: number) => {
		cartState = cartState
			.map((item) => {
				if (item.id === id) {
					const newQty = item.quantity + delta;
					return newQty > 0 ? { ...item, quantity: newQty } : null;
				}
				return item;
			})
			.filter(Boolean) as CartItem[];
		notify();
	},
	clear: () => {
		cartState = [];
		notify();
	},
};

export const wishlistStore = {
	get: () => wishlistState,
	toggle: (product: { id: string; name: string; price: number; imageUrl?: string | null }) => {
		const exists = wishlistState.some((item) => item.id === product.id);
		if (exists) {
			wishlistState = wishlistState.filter((item) => item.id !== product.id);
		} else {
			wishlistState = [...wishlistState, product];
		}
		notify();
	},
	isWishlisted: (id: string) => wishlistState.some((item) => item.id === id),
};

export function useCart() {
	const items = useSyncExternalStore(subscribe, cartStore.get, () => []);
	const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
	const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

	return {
		items,
		totalCount,
		subtotal,
		addItem: cartStore.addItem,
		removeItem: cartStore.removeItem,
		updateQuantity: cartStore.updateQuantity,
		clear: cartStore.clear,
	};
}

export function useWishlist() {
	const items = useSyncExternalStore(subscribe, wishlistStore.get, () => []);

	return {
		items,
		totalCount: items.length,
		toggle: wishlistStore.toggle,
		isWishlisted: (id: string) => items.some((item) => item.id === id),
	};
}
