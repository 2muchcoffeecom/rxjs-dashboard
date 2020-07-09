import React from 'react';
import './DisplayObject.css';

interface DisplayObjectProps {
  title: string;
  value?: string;
}

const DisplayObject: React.FC<DisplayObjectProps> = ({value, title}) => (
  <div className='Display-object-wrapper'>
      <span>{title} </span>
      <span>{value}</span>
  </div>
);

export default React.memo(DisplayObject);
