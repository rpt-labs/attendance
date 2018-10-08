import React from 'react';
import StudentCard from './StudentCard';

const CohortCards = (props) => {
  let cards = props.students.map(student => <StudentCard handleSelect={props.handleSelect} student={student} key={student.id}/>);
  return (
    <div className="ui three cards">
      {cards}
    </div>
  )
}

export default CohortCards