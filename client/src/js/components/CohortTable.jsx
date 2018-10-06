//this view shows absense information by student for a cohort
//can be refactored to show attendance real time

import React from 'React';

const CohortTable = (props) => {
  let tableData = props.students.map(student => {
    let cellStyle = student.absencePoints > 10 ? "negative" : "";
    return (
      <tr className={cellStyle}>
        <td className="collapsing">
          <h4 className="ui image header">
          <img src="https://imgc.allpostersimages.com/img/print/u-g-F8DHY00.jpg?w=400&h=300" className="ui mini rounded image"></img>
            <div className="content">
              {student.name}
              <div className="sub header">{student.github}
            </div>
          </div>
        </h4></td>
        <td>
          {student.absencePoints}
        </td>
      </tr>

    )
  })
  return (
    <div>
    <table className="ui selectable collapsed celled table">
      <thead>
        <tr>
          <th className="ten wide">Student</th>
          <th className="six wide">Absence Points</th>
        </tr>
      </thead>
    <tbody>
      {tableData}
    </tbody>
</table>
</div>
  )
}

export default CohortTable