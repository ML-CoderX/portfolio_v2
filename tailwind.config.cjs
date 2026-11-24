module.exports = {
  content: ["./index.html","./src/**/*.{ts,tsx}"],
  plugins: [require('@tailwindcss/forms')],
  theme: {
    "extend": {
      "colors": {
        "surface-dim": "#dbd8e3",
        "on-primary-container": "#fffbff",
        "secondary-fixed": "#e5deff",
        "secondary": "#5228e6",
        "on-error-container": "#93000a",
        "on-primary-fixed-variant": "#8e0046",
        "on-tertiary-fixed": "#201c00",
        "on-tertiary-container": "#484000",
        "tertiary-container": "#c0ad00",
        "outline": "#8f6f76",
        "primary-container": "#e20773",
        "surface-variant": "#e4e1ec",
        "on-secondary-fixed": "#1a0063",
        "on-secondary-container": "#f3edff",
        "background": "#fcf8ff",
        "tertiary-fixed-dim": "#dec800",
        "on-tertiary-fixed-variant": "#504700",
        "surface-bright": "#fcf8ff",
        "error-container": "#ffdad6",
        "on-surface": "#1b1b22",
        "tertiary-fixed": "#fde400",
        "on-background": "#1b1b22",
        "on-secondary-fixed-variant": "#4302d8",
        "surface-container": "#f0ecf7",
        "primary": "#b6005b",
        "surface-container-lowest": "#ffffff",
        "on-primary-fixed": "#3f001b",
        "on-secondary": "#ffffff",
        "surface-container-high": "#eae7f1",
        "outline-variant": "#e3bdc5",
        "inverse-surface": "#303038",
        "secondary-fixed-dim": "#c9bfff",
        "inverse-primary": "#ffb1c5",
        "primary-fixed-dim": "#ffb1c5",
        "surface-container-low": "#f5f2fd",
        "on-primary": "#ffffff",
        "on-error": "#ffffff",
        "surface-tint": "#ba005d",
        "on-tertiary": "#ffffff",
        "primary-fixed": "#ffd9e1",
        "surface": "#fcf8ff",
        "error": "#ba1a1a",
        "tertiary": "#6a5f00",
        "inverse-on-surface": "#f2effa",
        "surface-container-highest": "#e4e1ec",
        "secondary-container": "#6b4afe",
        "on-surface-variant": "#5b3f46"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "space-xl": "3.5rem",
        "margin": "2.5rem",
        "space-xs": "0.375rem",
        "gutter": "1.5rem",
        "space-md": "1.25rem",
        "gutter-mobile": "1rem",
        "margin-mobile": "1rem",
        "space-sm": "0.75rem",
        "space-lg": "2rem"
      },
      "fontFamily": {
        "label-badge": [
          "Space Mono"
        ],
        "display-hero": [
          "Bebas Neue"
        ],
        "headline-md": [
          "Bebas Neue"
        ],
        "headline-lg": [
          "Bebas Neue"
        ],
        "headline-lg-mobile": [
          "Bebas Neue"
        ],
        "body-sm": [
          "Plus Jakarta Sans"
        ],
        "body-md": [
          "Plus Jakarta Sans"
        ],
        "code-inline": [
          "Space Mono"
        ],
        "headline-sm": [
          "Bebas Neue"
        ],
        "display-hero-mobile": [
          "Bebas Neue"
        ],
        "chapter-index": [
          "Space Mono"
        ],
        "body-lg": [
          "Plus Jakarta Sans"
        ]
      },
      "fontSize": {
        "label-badge": [
          "11px",
          {
            "lineHeight": "14px",
            "letterSpacing": "0.08em",
            "fontWeight": "700"
          }
        ],
        "display-hero": [
          "84px",
          {
            "lineHeight": "84px",
            "letterSpacing": "0.04em",
            "fontWeight": "400"
          }
        ],
        "headline-md": [
          "32px",
          {
            "lineHeight": "34px",
            "letterSpacing": "0.02em",
            "fontWeight": "400"
          }
        ],
        "headline-lg": [
          "48px",
          {
            "lineHeight": "48px",
            "letterSpacing": "0.03em",
            "fontWeight": "400"
          }
        ],
        "headline-lg-mobile": [
          "36px",
          {
            "lineHeight": "36px",
            "letterSpacing": "0.03em",
            "fontWeight": "400"
          }
        ],
        "body-sm": [
          "13px",
          {
            "lineHeight": "20px",
            "fontWeight": "500"
          }
        ],
        "body-md": [
          "15px",
          {
            "lineHeight": "24px",
            "fontWeight": "500"
          }
        ],
        "code-inline": [
          "14px",
          {
            "lineHeight": "20px",
            "fontWeight": "400"
          }
        ],
        "headline-sm": [
          "24px",
          {
            "lineHeight": "26px",
            "letterSpacing": "0.02em",
            "fontWeight": "400"
          }
        ],
        "display-hero-mobile": [
          "48px",
          {
            "lineHeight": "48px",
            "letterSpacing": "0.04em",
            "fontWeight": "400"
          }
        ],
        "chapter-index": [
          "13px",
          {
            "lineHeight": "18px",
            "letterSpacing": "0.12em",
            "fontWeight": "700"
          }
        ],
        "body-lg": [
          "18px",
          {
            "lineHeight": "28px",
            "fontWeight": "500"
          }
        ]
      }
    }
  }
}
