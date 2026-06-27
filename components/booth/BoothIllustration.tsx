"use client";

import { motion, useReducedMotion } from "framer-motion";

export function BoothIllustration() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.svg
      viewBox="0 0 700 690"
      role="img"
      aria-label="An illustrated vintage photo booth with red curtains"
      className="h-auto w-full overflow-visible"
      animate={reduceMotion ? undefined : { transform: ["rotate(-0.3deg)", "rotate(0.35deg)", "rotate(-0.3deg)"] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <filter id="paperShadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="5" dy="8" stdDeviation="0" floodColor="#1c252b" floodOpacity=".14" />
        </filter>
        <pattern id="curtainHatch" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M3 0C9 7 8 12 4 18" fill="none" stroke="#733227" strokeWidth="2" opacity=".45" />
        </pattern>
      </defs>
      <g filter="url(#paperShadow)" stroke="#1c252b" strokeLinecap="round" strokeLinejoin="round">
        <path d="M91 102C232 96 470 100 612 95L626 154C488 163 220 157 74 164Z" fill="#f6f0e2" strokeWidth="7" />
        <path d="M105 115C264 112 476 115 598 109L608 143C449 146 237 143 91 150Z" fill="none" strokeWidth="3" />
        <text x="350" y="140" textAnchor="middle" fontSize="43" fontFamily="Avenir, sans-serif" letterSpacing="8" fill="#1c252b" stroke="none">SNAP BOOTH</text>
        <path d="M95 164C231 159 491 161 610 166L618 625C458 632 253 629 87 625Z" fill="#eee3cc" strokeWidth="8" />
        <path d="M348 172L350 625" fill="none" strokeWidth="6" />
        <path d="M358 180C403 174 516 176 599 182L603 614C522 620 412 616 360 613Z" fill="#8f3f32" strokeWidth="6" />
        <path d="M362 182C388 209 390 264 374 314C360 365 392 405 374 459C357 511 389 565 366 610" fill="none" strokeWidth="7" />
        <path d="M596 184C567 224 577 266 589 309C603 356 569 415 590 463C607 511 574 559 594 613" fill="none" strokeWidth="7" />
        <path d="M431 183C414 235 439 277 421 327C405 374 441 426 424 473C411 518 434 563 420 615" fill="none" stroke="#733227" strokeWidth="5" />
        <path d="M530 181C548 225 520 281 540 327C558 373 526 427 544 476C558 520 532 569 544 616" fill="none" stroke="#733227" strokeWidth="5" />
        <path d="M360 182H601V614H360Z" fill="url(#curtainHatch)" stroke="none" />
        <path d="M382 603C420 574 451 587 474 608C501 577 542 583 584 606" fill="#f2dabc" strokeWidth="6" />
        <path d="M372 353C415 339 552 339 595 353" fill="none" strokeWidth="5" />
        <path d="M139 205C186 199 286 201 323 207L319 382C257 390 177 386 132 378Z" fill="#f7f2e9" strokeWidth="6" />
        <path d="M154 222L305 221L303 337L151 340Z" fill="#1c252b" strokeWidth="4" />
        <g strokeWidth="2">
          {[0, 1, 2, 3].map((index) => (
            <g key={index} transform={`translate(${165 + index * 35} 233) rotate(${index % 2 ? 2 : -2})`}>
              <rect width="25" height="92" fill="#fff9ec" />
              <circle cx="12.5" cy="15" r="8" fill="#c27663" />
              <circle cx="12.5" cy="46" r="8" fill="#dbb78a" />
              <circle cx="12.5" cy="77" r="8" fill="#798171" />
            </g>
          ))}
        </g>
        <path d="M148 356C195 350 266 353 303 349" fill="none" strokeWidth="3" />
        <path d="M264 400C286 387 298 392 300 412C301 428 289 437 274 430" fill="none" strokeWidth="4" />
        <path d="M296 392L300 412L281 408" fill="none" strokeWidth="4" />
        <text x="230" y="442" fontSize="25" fontFamily="Segoe Print, cursive" fill="#1c252b" stroke="none">tiny gallery</text>
        <path d="M179 470L231 468L232 578L177 579Z" fill="#f5efe2" strokeWidth="5" />
        <circle cx="205" cy="492" r="9" fill="#a44d3d" strokeWidth="4" />
        <path d="M190 518L219 518L219 549L190 550ZM189 559L220 559" fill="none" strokeWidth="4" />
        <path d="M449 629C478 618 523 618 552 630L539 657C508 663 480 659 456 651Z" fill="#f3efe5" strokeWidth="6" />
      </g>
      <g fill="none" stroke="#a44d3d" strokeLinecap="round" strokeWidth="4">
        <path d="M59 221H24M41 204V238" />
        <path d="M648 278H678M663 263V293" />
        <path d="M37 529C51 515 68 515 80 530C65 542 50 543 37 529Z" />
      </g>
    </motion.svg>
  );
}
