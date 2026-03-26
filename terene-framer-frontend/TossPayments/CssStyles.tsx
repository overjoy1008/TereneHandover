import React from "react"

const CssStyles: React.FC = () => (
    <style>{`
    body {
      background-color: #e8f3ff;
    }
    .p {
      padding: 0;
      margin: 0;
      font-family: Toss Product Sans, -apple-system, BlinkMacSystemFont,
        Bazier Square, Noto Sans KR, Segoe UI, Apple SD Gothic Neo, Roboto,
        Helvetica Neue, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji,
        Segoe UI Symbol, Noto Color Emoji;
      color: #4e5968;
      word-break: keep-all;
      word-wrap: break-word;
    }
    .wrapper {
      max-width: 800px;
      margin: 0 auto;
    }
    .title {
      margin: 0 0 4px;
      font-size: 24px;
      font-weight: 600;
      color: #4e5968;
    }
    .box_section {
      background-color: white;
      padding: 50px;
      margin: 0px auto 0;
      color: #333d4b;
      align-items: center;
      text-align: center;
      overflow-x: auto;
      white-space: nowrap;
    }
    @media (max-width: 768px) {
      .box_section {
        padding: 10px;
      }
    }
    :root {
      --inverseGrey50: #202027;
      --inverseGrey100: #2c2c35;
      /* ...중략... 모든 --변수들도 여기에 포함하세요 ... */
      --blue900: #194aa6;
    }
    body,
    html {
      font-family: Toss Product Sans, Tossface, -apple-system, BlinkMacSystemFont,
        Bazier Square, Noto Sans KR, Segoe UI, Apple SD Gothic Neo, Roboto,
        Helvetica Neue, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji,
        Segoe UI Symbol, Noto Color Emoji;
      -moz-osx-font-smoothing: grayscale;
      -webkit-font-smoothing: antialiased;
      word-break: keep-all;
      word-wrap: break-word;
    }
    *,
    :after,
    :before {
      box-sizing: border-box;
    }
    .btn {
      color: #f9fafb;
      background-color: #3182f6;
      margin: 30px 15px 0;
      font-size: 15px;
      font-weight: 600;
      line-height: 18px;
      white-space: nowrap;
      text-align: center;
      cursor: pointer;
      border: 0 solid transparent;
      user-select: none;
      transition: background 0.2s ease, color 0.1s ease;
      text-decoration: none;
      border-radius: 7px;
      padding: 11px 16px;
      width: 250px;
    }
    .btn:hover {
      background-color: #1b64da;
    }
    btn:disabled,
    input:disabled {
      opacity: 0.8;
      cursor: not-allowed;
    }
  `}</style>
)

export default CssStyles
