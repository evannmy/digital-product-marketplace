/* eslint-disable @typescript-eslint/no-unused-vars */
import type { AxiosInstance } from 'axios';
import type { Config as ZiggyConfig, RouteParamsWithQueryOverload } from 'ziggy-js';
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

    var route: (
        name: string,
        params?: RouteParamsWithQueryOverload,
        absolute?: boolean
    ) => string;
    
    var Ziggy: ZiggyConfig;
}