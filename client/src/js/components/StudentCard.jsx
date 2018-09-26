//this shows overall health and stats, including attendance points
//clicking through shows a detailed Student view
import React from 'react';

const StudentCard = (props) => {
  let style = props.student.absencePoints > 14 ? "right floated danger" : "right floated";
  let buttonStyle = props.student.health >= 85 ? "right floated green circular ui button"
    : props.student.health >=65 ? "right floated yellow circular ui button"
    : "right floated red circular ui button";
  return (
    <div className="card" key={props.student.id}>
      <div className="image">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6EpTlrdIgGTmIcrEv6R1lPl9zrye-_vqITcWiAcmv81ViaCKm"></img>
      </div>
    <div className="content">
      <div className={buttonStyle}>{props.student.health}</div>
      <div className="header">{props.student.name}</div>

      <div className="meta">
        <a target="_blank" href="http://www.github.com/michellelockett">{props.student.github}</a>
      </div>
    </div>
    <div className="extra content">
      <span className={style}>
        {props.student.absencePoints + ' absence points'}
      </span>
      <a>
        <i className="user icon"></i>
        Student Details
      </a>
    </div>
  </div>

  )
};

export default StudentCard

