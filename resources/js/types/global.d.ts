import type { AxiosInstance } from 'axios';
// --- ADDED 'Router' to the import below ---
import type { Config as ZiggyConfig, RouteParamsWithQueryOverload, Router } from 'ziggy-js';
import type { Auth } from '@/types/auth';

// 1. Inertia Props
declare module '@inertiajs/core' {
    export interface PageProps {
        name: string;
        auth: Auth;
        sidebarOpen: boolean;
        cart_count: number;
        [key: string]: unknown;
    }
}

// 2. Global Variables
declare global {
    interface Window {
        axios: AxiosInstance;
    }

    // --- UPDATED: Function Overloads for Ziggy ---
    // 1. When called empty, it returns the Ziggy Router (which has .current())
    function route(): Router;
    
    // 2. When called with a name, it returns a string URL
    function route(
        name: string,
        params?: RouteParamsWithQueryOverload,
        absolute?: boolean
    ): string;
    
    var Ziggy: ZiggyConfig;
}