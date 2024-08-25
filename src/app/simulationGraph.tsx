import "./SimulationGraph.css"

export default function SimulationGraph() {
    const hours = [
        0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23
    ];
    return (
        <div className="simulation-graph w-full">
            <div id="y_legend">
                    <label>{11}</label>
            </div>
            <div className="flex flex-row justify-evenly items-end">
                {hours.map(hour => <div className="data-bar bg-red-600" style={{height: 3 * hour + "%"}} ></div>)}
            </div>
            <div id="x_legend" className="flex flex-row justify-evenly w-100">
                {hours.map(hour => <label className="hour-label">{hour}{":00"}</label>)}
            </div>
        </div>
    );
}