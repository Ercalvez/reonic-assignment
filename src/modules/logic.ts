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

export type SimulationResult = {
    totalConsumption: number,
    theoreticalMaxPower: number,
    powerPerHour: number[],
    maxPower: number,
    maxConcurrencyFactor: number,
    averageConcurrencyFactor: number
};

/** Kwh / 100 KM */
const DEFAULT_CONSUMPTION = 18;

/** Kw */
const DEFAULT_CHARGING_POWER = 11;

export class ChargePointDataModel {

    private static sumTakenIntervals(intervals: {taken: boolean}[]) {
        return intervals.reduce((sum, currentInterval) => sum + Number(currentInterval.taken), 0);
    }

    /** generate a random probability and return the corresponding km */
    private static getNeededKm() {
        const demandProbability = Math.random();
        let neededKm = 0;
        let cumulatedKmProbability = 0;

        for (const {km, probability: kmProbability}  of DEFAULT_DEMAND_PROBABILITIES) {
            cumulatedKmProbability += kmProbability;
            if(cumulatedKmProbability >= demandProbability) {
                neededKm = km;
                break;
            }
        }
        return neededKm;
    }

    public static run(chargePoints: number, options?: {chargingPower?: number, consumption?: number, arrivalFactor?: number, time?:{year: number, days: number}}): SimulationResult {
        
        const arrivalFactor = options?.arrivalFactor ?? 1;
        const consumption = options?.consumption ?? DEFAULT_CONSUMPTION;
        const chargingPower = options?.chargingPower ?? DEFAULT_CHARGING_POWER;
        const totalDays = options?.time ? options.time.year + options.time.days : 365;

        /** Total consumption in kWh */
        let totalConsumption = 0;

        /** Max Power in kW */
        let maxPower = 0;

        /** Accumulated Max Power in kW, needs to be divided by totalDays to get the average max power */
        let accumulatedMaxPower = 0;

        const powerPerHour: number[] = Array(24).fill(0);

        for(let day = 0; day < totalDays; day++) {

            /** contains info for every quarter of every chargepoint.
             * Dimension: chargepoints * QUARTER_IN_A_DAY */
            const chargePointQuarters: {taken: boolean}[][] = Array.from({length: chargePoints},
                () => Array.from({length: QUARTER_IN_A_DAY}, () => ({taken:false}))
            );
    
            for (let quarter = 0; quarter < QUARTER_IN_A_DAY; quarter++) {
                
                const hour = Math.floor(quarter / 4); 
                const arrivalInfo = DEFAULT_ARRIVAL_PROBABILITIES.find(({time}) => time === hour);
                const quarterProbability = arrivalInfo ? arrivalFactor * arrivalInfo.probability : null;
                if(quarterProbability == null) continue;
                
                for(let chargingPointIndex = 0; chargingPointIndex < chargePoints; chargingPointIndex++) {
                    const arrivedProbability = Math.random();
                    if(arrivedProbability > quarterProbability) continue;
                    
                    const neededKm = ChargePointDataModel.getNeededKm();

                    const neededQuarters: QUARTER = Math.floor(4 * neededKm * consumption / (100 * chargingPower));
    
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
            }, 0) * chargingPower / 4;
        
            let maxNbChargePoint = 0;
        
            /** at the end of the day, compute powerPerHour
             * and the maximum number of chargepoints used at the same time */
            for(let quarter = 0; quarter < QUARTER_IN_A_DAY; quarter++) {
                const quarterChargePoints = ChargePointDataModel.sumTakenIntervals(chargePointQuarters.map(chargingStation => chargingStation[quarter]));
                const hour = Math.floor(quarter / 4);
                if(powerPerHour[hour] != null) {
                    powerPerHour[hour] += quarterChargePoints * chargingPower / 4;
                }
                else {
                    console.error("This quarter does not match any valid hour: ", quarter, "hour:", hour);
                }
                maxNbChargePoint = Math.max(maxNbChargePoint, quarterChargePoints);
            }

            const maxPowerDay = maxNbChargePoint * chargingPower;

            accumulatedMaxPower += maxPowerDay;
        
            maxPower = Math.max(maxPowerDay, maxPower);
        }

        const theoreticalMaxPower = chargePoints * chargingPower;

        return {
            totalConsumption,
            theoreticalMaxPower,
            powerPerHour: powerPerHour.map(power => power / totalDays),
            maxPower,
            maxConcurrencyFactor: maxPower / theoreticalMaxPower,
            averageConcurrencyFactor: accumulatedMaxPower / (theoreticalMaxPower * totalDays)
        };

    }
}
