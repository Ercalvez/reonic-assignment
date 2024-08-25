"use client";

import { useEffect, useState } from "react";
import { ChargePointDataModel } from "@/modules/logic" 
import SimulationInput from "@/app/components/simulationInput"
import SimulationGraph from "@/app/components/simulationGraph";

export default function Home() {
  
  const [chargePoints, setChargePoints] = useState(20);
  const [arrivalFactor, setArrivalFactor] = useState(100);
  const [carConsumption, setCarConsumption] = useState(18);
  const [chargingPower, setChargingPower] = useState(11);
  const [result, setResult] = useState(ChargePointDataModel.run(chargePoints, {chargingPower, consumption: carConsumption, arrivalFactor: arrivalFactor / 100}));

  useEffect(() => {
    setResult(ChargePointDataModel.run(chargePoints, {chargingPower, consumption: carConsumption, arrivalFactor: arrivalFactor / 100}));
  }, [chargePoints, chargingPower, carConsumption, arrivalFactor]);

  return (
    <main className="flex min-h-screen justify-between p-24">
      <aside className="flex flex-col space-y-1">
          <SimulationInput title="Chargepoints" inputValue = { chargePoints } setValue={setChargePoints} min={1} max={30}/>
          <SimulationInput title="Arrival Probability" inputValue = { arrivalFactor } unit = "%" setValue={setArrivalFactor} min={20} max={200}/>
          <SimulationInput title="Car Consumption" inputValue = { carConsumption } unit = "kWh / 100km" setValue={setCarConsumption} min={9} max={72}/>
          <SimulationInput title="Charging Power per Chargepoint" inputValue = { chargingPower } unit = "kW" setValue={setChargingPower} min={3} max={100}/>
      </aside>
      <SimulationGraph powerPerHour={result.powerPerHour} maxPower={result.maxPower} averageConcurrencyFactor={result.averageConcurrencyFactor}/>
    
    </main>
  );
}
