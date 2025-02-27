import React from 'react';
import Image from 'next/image';

type PropType = {
  selected: boolean
  onClick: () => void
  index: string
}

export const Thumb: React.FC<PropType> = (props) => {
  const { selected, onClick, index } = props;

  return (
    <div
      className={`embla-thumbs__slide ${selected ? 'is-selected' : ''}`}
      onClick={onClick}
    >
      <Image 
        className={`embla-thumbs__slide-img border-2 ${selected ? 'border-primary' : 'border-transparent'}`}
        src={index}
        alt="Product thumbnail"
        width={120}
        height={80}
        objectFit="cover"
      />
    </div>
  );
};
