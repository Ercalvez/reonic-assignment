"use client";

import { ChargePointDataModel } from "@/modules/logic" 
import SimulationInput from "@/app/simulationInput"
import { useState } from "react";

export default function Home() {
  const chargingPointDataModel = new ChargePointDataModel(20);
  const text = chargingPointDataModel.run();

  const [chargePoints, setChargePoints] = useState(20);
  const [arrivalFactor, setArrivalFactor] = useState(100);
  const [carConsumption, setCarConsumption] = useState(18);
  const [chargingPower, setChargingPower] = useState(11);

  return (
    <main className="flex min-h-screen flex-col items-left justify-between p-24">

          <SimulationInput title="Chargepoints" inputValue = { chargePoints } setValue={setChargePoints} min={1} max={30}/>
          <SimulationInput title="Arrival Probability" inputValue = { arrivalFactor } unit = "%" setValue={setArrivalFactor} min={20} max={200}/>
          <SimulationInput title="Car Consumption" inputValue = { carConsumption } unit = "kWh / 100km" setValue={setCarConsumption} min={9} max={72}/>
          <SimulationInput title="Charging Power per Chargepoint" inputValue = { chargingPower } unit = "kW" setValue={setChargingPower} min={3} max={100}/>
          <button className="bg-red-400 h-8 px-2 my-2 rounded-md">Run simulation</button>
    
    </main>
  );
}
