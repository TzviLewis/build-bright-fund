/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', './public/**/*.html'],
    theme: {
        extend: {
            fontSize: {
                xs: ['0.75rem', { lineHeight: '1.2', letterSpacing: '0.01em', fontWeight: '400' }],
                sm: ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '400' }],
                base: ['1rem', { lineHeight: '1.6', letterSpacing: '0.01em', fontWeight: '400' }],
                lg: ['1.125rem', { lineHeight: '1.6', letterSpacing: '0.01em', fontWeight: '400' }],
                xl: ['1.25rem', { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '500' }],
                '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' }],
                '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '0.01em', fontWeight: '600' }],
                '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '0.01em', fontWeight: '600' }],
                '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '0.01em', fontWeight: '700' }],
                '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '0.01em', fontWeight: '700' }],
                '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '0.01em', fontWeight: '700' }],
                '8xl': ['6rem', { lineHeight: '1', letterSpacing: '0.01em', fontWeight: '700' }],
                '9xl': ['8rem', { lineHeight: '1', letterSpacing: '0.01em', fontWeight: '700' }],
            },
            fontFamily: {
                heading: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
                paragraph: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
            },
            colors: {
                primary: "#1a1a1a",
                "primary-foreground": "#ffffff",
                secondary: "#0066ff",
                "secondary-foreground": "#ffffff",
                background: "#fafafa",
                foreground: "#1a1a1a",
                destructive: "#ff3b30",
                "destructive-foreground": "#ffffff",
                accent: "#0066ff",
                muted: "#e5e5e5",
                "muted-foreground": "#666666"
            },
            spacing: {
                '128': '32rem',
                '144': '36rem',
            },
            borderRadius: {
                'sm': '4px',
                'md': '8px',
                'lg': '12px',
                'xl': '16px',
                '2xl': '20px',
            }
        },
    },
    future: {
        hoverOnlyWhenSupported: true,
    },
    plugins: [require('@tailwindcss/container-queries'), require('@tailwindcss/typography')],
}
