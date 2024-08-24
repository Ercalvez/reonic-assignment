type KM = number;
type HOUR = number;

/** from 0 to 96 */
export type QUARTER = number;

export const QUARTER_IN_A_DAY = 24 * 4;

const DEFAULT_ARRIVAL_PROBABILITIES = [
    {
        time: 3, probability: 0.0094
    },{
        time: 4, probability: 0.0094
    },{
        time: 5, probability: 0.0094
    },{
        time: 6, probability: 0.0094
    },{
        time: 7, probability: 0.0094
    },{
        time: 8, probability: 0.0283
    },{
        time: 9, probability: 0.0283
    },{
        time: 10, probability: 0.0566
    },{
        time: 11, probability: 0.0566
    },{
        time: 12, probability: 0.0566
    },{
        time: 13, probability: 0.0755
    },{
        time: 14, probability: 0.0755
    },{
        time: 15, probability: 0.0755
    },{
        time: 16, probability: 0.1038
    },{
        time: 17, probability: 0.1038
    },{
        time: 18, probability: 0.1038
    },{
        time: 19, probability: 0.0472
    },{
        time: 20, probability: 0.0472
    },{
        time: 21, probability: 0.0472
    },{
        time: 22, probability: 0.0094
    },{
        time: 23, probability: 0.0094
    }
] as const;

const DEFAULT_DEMAND_PROBABILITIES = [
    {
        km: 0, probability: 0.3431
    },
    {
        km: 5, probability: 0.049
    },
    {
        km: 10, probability: 0.098
    },
    {
        km: 20, probability: 0.1176
    },
    {
        km: 30, probability: 0.0882
    },
    {
        km: 50, probability: 0.1176
    },
    {
        km: 100, probability: 0.1078
    },
    {
        km: 200, probability: 0.049
    },
    {
        km: 300, probability: 0.0294
    }
] as const;

type ArrivalDistribution = (probability: number) => QUARTER; 

type SimulationResult = {
    totalConsumption: number,
    theoreticalMaxPower: number,
    maxPower: number,
    maxConcurrencyFactor: number,
    averageConcurrencyFactor: number
};

/** Kwh / 100 KM */
const DEFAULT_CONSUMPTION = 18;

/** Kw */
const DEFAULT_CHARGING_POWER = 11

export class ChargePointDataModel {

    private static sumTakenIntervals(intervals: {taken: boolean}[]) {
        return intervals.reduce((sum, currentInterval) => sum + Number(currentInterval.taken), 0);
    }

    constructor(public readonly chargePoints: number) {
    }

    public run(time?:{year: number, days: number}): SimulationResult {

        const totalDays = time ? time.year + time.days : 365;

        let totalConsumption = 0;
        let maxPower = 0;
        let aggregatedMaxPower = 0;

        for(let day = 0; day < totalDays; day++) {
            const chargePointQuarters: {taken: boolean}[][] = Array(this.chargePoints).fill(null)
            .map(() => {
                return Array(QUARTER_IN_A_DAY).fill(null)
                        .map(() => {
                            return {
                                taken: false
                            };
                        });
            });
    
            for (let quarter = 0; quarter < QUARTER_IN_A_DAY; quarter++) {
                
                const hour = Math.floor(quarter / 4); 
                // console.log(`${hour}:${(quarter - hour*4) * 15}`);
                const {probability: quarterProbability} = DEFAULT_ARRIVAL_PROBABILITIES.find(({time}) => time === hour) ?? {};
                if(quarterProbability == null) continue;
                for(let chargingPointIndex = 0; chargingPointIndex < this.chargePoints; chargingPointIndex++) {
                    const arrivedProbability = Math.random();
                    if(arrivedProbability > quarterProbability) continue;
                    const demandProbability = Math.random();
                    let neededKm: KM = 0;
                    let cumulatedKmProbability = 0;
                    for (const {km, probability: kmProbability}  of DEFAULT_DEMAND_PROBABILITIES) {
                        cumulatedKmProbability += kmProbability;
                        if(cumulatedKmProbability >= demandProbability) {
                            neededKm = km;
                            break;
                        }
                    }
                    // console.log("KM: ", neededKm);
                    const neededQuarters: QUARTER = Math.floor(4 * neededKm * DEFAULT_CONSUMPTION / (100 * DEFAULT_CHARGING_POWER));
                    // console.log("quarters: ", neededQuarters);
    
                    // Look for any available charging point at this quarter (can be another one)
                    const availableChargingPoint = chargePointQuarters.find(chargingPoint => chargingPoint[quarter].taken === false);
                    if(availableChargingPoint == null) {
                        continue;
                    }

                    // if available, take this spot and the next quarters
                    const chosenSpot = availableChargingPoint.slice(quarter, quarter + neededQuarters);
                    
                    chosenSpot.forEach(value => {
                        value.taken = true;
                    })
                }
            }
            
            totalConsumption += chargePointQuarters.reduce((sum, chargingPoint) => {
                return sum + ChargePointDataModel.sumTakenIntervals(chargingPoint);
            }, 0) * DEFAULT_CHARGING_POWER / 4;
        
            let maxNbUsedChargingPoint = 0;
        
            for(let quarter = 0; quarter < QUARTER_IN_A_DAY; quarter++) {
                maxNbUsedChargingPoint = Math.max(maxNbUsedChargingPoint, ChargePointDataModel.sumTakenIntervals(chargePointQuarters.map(chargingStation => chargingStation[quarter])));
            }

            const maxPowerDay = maxNbUsedChargingPoint * DEFAULT_CHARGING_POWER;

            aggregatedMaxPower += maxPowerDay;
        
            maxPower = Math.max(maxPowerDay, maxPower);
        }

        const theoreticalMaxPower = this.chargePoints * DEFAULT_CHARGING_POWER;

        return {
            totalConsumption,
            theoreticalMaxPower,
            maxPower,
            maxConcurrencyFactor: maxPower / theoreticalMaxPower,
            averageConcurrencyFactor: aggregatedMaxPower / (theoreticalMaxPower * totalDays)
        };

    }
}
