import React, { Component } from 'react';
import CohortChart from './CohortChart';
import CohortTable from './CohortTable';
import CohortCards from './CohortCards';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      cohort:
        {name: 'RPT07', students: [
          {id: 1, name: "Andrew Wiggin", github: "ender", absencePoints: 4, health: 86},
          {id: 2,name: "Cheese Tart", github: "cheeziest", absencePoints: 8, health: 30},
          {id: 3,name: "Captain Picard", github: "betterThanKirk", absencePoints: 11, health: 86},
          {id: 4,name: "Great Like", github: "chicken", absencePoints: 0, health: 90},
          {id: 5,name: "Kaladin Stormblessed", github: "protects", absencePoints: 15, health: 45},
          {id: 6,name: "Cheese Cake", github: "toCakeOrToTart", absencePoints: 1, health: 68},
          {id: 7,name: "Cheddar Kit", github: "poopsJellyBeans", absencePoints: 2, health: 72},
          {id: 8,name: "Wa-Wa Dog", github: "wawaDogwawaDog", absencePoints: 4, health: 90},
          {id: 9,name: "Honeystripe", github: "iEatBadgers", absencePoints: 6, health: 79},
          {id: 10,name: "Chris P. Bacon", github: "goGreen", absencePoints: 8, health: 86},
          {id: 11,name: "Kaladin Stormblessed", github: "protects", absencePoints: 3, health: 86},
          {id: 12,name: "Cheese Cake", github: "toCakeOrToTart", absencePoints: 0, health: 86},
          {id: 13,name: "Andrew Wiggin", github: "ender", absencePoints: 7, health: 86},
          {id: 14,name: "Cheese Tart", github: "cheeziest", absencePoints: 21, health: 86},
          {id: 15,name: "Captain Picard", github: "betterThanKirk", absencePoints: 18, health: 86},
          {id: 16,name: "Great Like", github: "chicken", absencePoints: 6, health: 86},
          {id: 17,name: "Kaladin Stormblessed", github: "protects", absencePoints: 8, health: 86},
          {id: 18,name: "Cheese Cake", github: "toCakeOrToTart", absencePoints: 12, health: 86},

        ]}

    };
  }

  render() {
    return (
    <div className="ui container">
      {/* <div className="ui stackable stretched four column grid"> */}
        {/* <div className="column">
          <div className="ui header cohort-title">{this.state.cohort.name}</div>
          <CohortTable students={this.state.cohort.students} name={this.state.cohort.name}/>
        </div> */}

          <div className="ui header cohort-title">{this.state.cohort.name}</div>
          <CohortCards students={this.state.cohort.students} name={this.state.cohort.name}/>

      </div>
  //  </div>
    )
  }
}

export default App