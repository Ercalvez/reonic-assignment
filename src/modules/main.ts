import { ChargePointDataModel } from "./logic";

const nbChargingPoints = 20;

const result = ChargePointDataModel.run(nbChargingPoints, {time: {year: 0, days: 365}});

console.log("Total Consumption:",result.totalConsumption, "kWh");
console.log("Max Power:",result.maxPower, "kW");
console.log("Max Concurrency Factor:",100 * result.maxConcurrencyFactor, "%");
console.log("Average Concurrency Factor:",100 * result.averageConcurrencyFactor, "%");