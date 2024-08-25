"use client";

import { Dispatch, SetStateAction } from "react";

interface SimulationInputProps { 
    title: string,
    inputValue: number,
    setValue: Dispatch<SetStateAction<number>>,
    min: number, 
    max: number,
    unit?: string
}

export default function SimulationInput({title, inputValue, setValue, min, max, unit}: SimulationInputProps) {
    return (
        <div className="simulation-input">
            <h3>{ title }</h3>
            <h4>{ inputValue } { unit ?? ''}</h4>
            <input type="range" onChange= {e => setValue(Number(e.target.value))} value={inputValue} min={min} max={max}></input>
        </div>
    )
}