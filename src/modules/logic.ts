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
]

type ArrivalDistribution = (probability: number) => QUARTER; 

type SimulationResult = {
    totalConsumption: number
};

/** Kwh / 100 KM */
const DEFAULT_CONSUMPTION = 18;

/** Kw*/
const DEFAUL_CHARGING_POWER = 11

export class ChargePointDataModel {

    /**
     * 
     * @param probability between 0 and 1
     * @returns exact quarter in the day (from 0 to 96)
     */
    public static defaultArrivalDistribution(probability: number): QUARTER {

        if(probability < 0) {
            throw "Probability cannot be negative: " +  probability;
        }

        if(probability > 1) {
            throw "Probability cannot be above 1: " + probability;
        }

        let selectedHourIndex = null;

        let cumulatedProbability = 0;

        for(let i = 0; i < DEFAULT_ARRIVAL_PROBABILITIES.length; i++) {

            const arrivalProbability = DEFAULT_ARRIVAL_PROBABILITIES[i].probability;

            if(cumulatedProbability + arrivalProbability > probability) {
                selectedHourIndex = i;
                break;
            }
            cumulatedProbability += arrivalProbability;
        }

        if(selectedHourIndex == null) {
            selectedHourIndex = DEFAULT_ARRIVAL_PROBABILITIES.length - 1;
        }

        const nextProbability = DEFAULT_ARRIVAL_PROBABILITIES[selectedHourIndex + 1]?.probability ?? DEFAULT_ARRIVAL_PROBABILITIES[selectedHourIndex].probability;

        return DEFAULT_ARRIVAL_PROBABILITIES[selectedHourIndex].time * 4 + Math.floor(4 * (probability - cumulatedProbability) /  nextProbability);
    }

    constructor(public readonly chargePoints: number) {
    }

    public run() {
        const chargePointQuarters: {taken: boolean}[][] = Array(this.chargePoints).fill(null).map(() => {
            return Array(QUARTER_IN_A_DAY).fill(null).map(() => {
            return {
                taken: false
            }
        })});

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
                const neededQuarters: QUARTER = Math.floor(4 * neededKm * DEFAULT_CONSUMPTION / (100 * DEFAUL_CHARGING_POWER));
                // console.log("quarters: ", neededQuarters);
                const chargingPoint = chargePointQuarters[chargingPointIndex];

                // if charging point is not available, look for the next charging point
                if(chargingPoint[quarter].taken === true) {
                    // console.log("TAKEN");
                    continue;
                }
                // if available, take this spot and the next quarters
                const chosenSpot = chargingPoint.slice(quarter, quarter + neededQuarters);
                
                chosenSpot.forEach(value => {
                    value.taken = true;
                })
            }
        }
        return chargePointQuarters;
    }
}
