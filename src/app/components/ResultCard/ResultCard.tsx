"use client";

import "./ResultCard.css"

export default function ResultCard({ id, title, result, unit }: { id: string, title: string, result: number, unit?: string }) {
    return (
        <div id={id} className="result-card">
            <h3 className="font-bold">{title}</h3>
            <h4 suppressHydrationWarning>{result.toFixed(2)} {unit ?? ""}</h4>
        </div>
    );
}