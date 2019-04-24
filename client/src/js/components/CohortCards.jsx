import React from 'react';
import StudentCard from './StudentCard';

const CohortCards = props => {
  const cards = props.students.map(student => <StudentCard student={student} key={student.id} />);
  return <div className="ui three cards">{cards}</div>;
};

export default CohortCards;
