import { ChargePointDataModel, QUARTER_IN_A_DAY } from "./logic";



const cgdm = new ChargePointDataModel(20);
let consumptionAverage = 0;
let maxPowerAverage = 0;
for(let i = 0; i< 365; i++) {
    const result = cgdm.run();
    consumptionAverage += result.reduce((sum, chargingPoint) => {
        return sum + chargingPoint.reduce((s, current) => {
            return s + (current.taken ? 1 : 0);
        }, 0 );
    }, 0) * 11 / 4;

    const powerPerQuarter: number[] = [];

    for(let j = 0; j < QUARTER_IN_A_DAY; j++) {
        powerPerQuarter.push(result.map(chargingStation => chargingStation[j]).reduce((s, current) => s + (current.taken ? 1 : 0), 0));
    }

    maxPowerAverage += Math.max(...powerPerQuarter) * 11;
}

console.log(consumptionAverage / 365);
console.log(maxPowerAverage / 365);