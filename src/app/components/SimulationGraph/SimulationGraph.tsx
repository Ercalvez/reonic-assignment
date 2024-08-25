"use client";

import ResultCard from "../ResultCard/ResultCard";
import "./SimulationGraph.css"
import { SimulationResult } from "@/modules/logic"

export default function SimulationGraph({powerPerHour, maxPower, averageConcurrencyFactor, totalConsumption}: Pick<SimulationResult, "powerPerHour" | "maxPower" | "averageConcurrencyFactor" | "totalConsumption">) {
    const hours = [
        0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23
    ];
    return (
        <div className="simulation-graph">
            <div id="y_unit">{"kW"}</div>
            <div id="y_legend">
                    <label style={{height: "50%"}}>{maxPower}</label>
                    <label>{maxPower / 2} </label>
            </div>
            <div id="data_bars" className="flex flex-row justify-evenly items-end">
                {hours.map(hour => <div className="tooltip data-bar bg-red-600" style={{height: 100 * powerPerHour[hour] / maxPower + "%"}} ><span className="tooltiptext">{powerPerHour[hour].toFixed(2) + "kW"}</span></div>)}
            </div>
            <div id="x_legend" className="flex flex-row justify-evenly w-100">
                {hours.map(hour => <label className="hour-label">{hour}{":00"}</label>)}
            </div>
            <div id="result_cards">
                <ResultCard id="concurrency_factor" title="Average Concurrency Factor: " result={100 * averageConcurrencyFactor} unit="%"/>
                <ResultCard id="energy_used_year" title="Energy Used per Year: " result={totalConsumption} unit="kWh"/>
                <ResultCard id="energy_used_month" title="Energy Used per Month: " result={totalConsumption / 12} unit="kWh"/>
                <ResultCard id="energy_used_week" title="Energy Used per Week: " result={totalConsumption / 52} unit="kWh"/>
                <ResultCard id="energy_used_day" title="Energy Used per Day: " result={totalConsumption / 365} unit="kWh"/>
            </div>
        </div>
    );
}