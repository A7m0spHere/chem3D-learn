import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
  	extend: {
  		colors: {
  			background: '#F7FAF9',
  			surface: '#FFFFFF',
  			primary: {
  				DEFAULT: '#2A9D8F',
  				light: '#DDF3EF',
  				dark: '#1F6F68'
  			},
  			accent: '#F4A261',
  			success: '#10B981',
  			danger: '#EF4444',
			text: {
				primary: '#1F2933',
				secondary: '#334155'
			},
			border: '#C9D8D4'
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'ui-sans-serif',
  				'system-ui',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'sans-serif'
  			]
  		},
  		boxShadow: {
  			panel: '0 14px 36px rgba(31, 41, 51, 0.08)'
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'motion-fade-in var(--motion-base) var(--ease-out-soft) both',
  			'slide-up': 'motion-slide-up var(--motion-base) var(--ease-out-soft) both',
  			'scale-in': 'motion-scale-in var(--motion-base) var(--ease-out-soft) both',
  			'selected-pulse': 'motion-selected-pulse 0.6s var(--ease-out-soft)',
  			'page-enter': 'motion-page-enter var(--motion-slow) var(--ease-out-soft) both',
  			skeleton: 'motion-skeleton 1.2s ease-in-out infinite',
  			float: 'motion-float 15s ease-in-out infinite alternate',
  			'spin-slow': 'motion-spin-slow 8s linear infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'motion-fade-in': {
  				from: {
  					opacity: '0'
  				},
  				to: {
  					opacity: '1'
  				}
  			},
  			'motion-slide-up': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(12px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'motion-scale-in': {
  				from: {
  					opacity: '0',
  					transform: 'scale(0.96)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			'motion-selected-pulse': {
  				'0%': {
  					boxShadow: '0 0 0 0 rgba(42, 157, 143, 0.3)'
  				},
  				'70%': {
  					boxShadow: '0 0 0 6px rgba(42, 157, 143, 0)'
  				},
  				'100%': {
  					boxShadow: '0 0 0 0 rgba(42, 157, 143, 0)'
  				}
  			},
  			'motion-page-enter': {
  				from: {
  					opacity: '0',
  					transform: 'scale(0.98)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			'motion-skeleton': {
  				'0%, 100%': {
  					opacity: '0.35'
  				},
  				'50%': {
  					opacity: '0.65'
  				}
  			},
  			'motion-float': {
  				'0%': {
  					transform: 'translateY(0)'
  				},
  				'100%': {
  					transform: 'translateY(-50px)'
  				}
  			},
  			'motion-spin-slow': {
  				'0%': {
  					transform: 'rotate(0deg)'
  				},
  				'100%': {
  					transform: 'rotate(360deg)'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		transitionDuration: {
  			fast: 'var(--motion-fast)',
  			base: 'var(--motion-base)',
  			slow: 'var(--motion-slow)'
  		},
  		transitionTimingFunction: {
  			'out-soft': 'var(--ease-out-soft)',
  			'in-out-soft': 'var(--ease-in-out-soft)'
  		}
  	}
  },
  plugins: [],
};

export default config;
