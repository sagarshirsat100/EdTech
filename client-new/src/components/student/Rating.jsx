import React, { useEffect } from "react"

const Rating = ({initalRating, onRate}) => {

  const [rating, setRating] = React.useState(initalRating || 0);
  
  const handleRating = (value) => {
    setRating(value);
    if(onRate) onRate(value);
  }

  useEffect(() => {
    if(initalRating) setRating(initalRating);
  } , [initalRating]);

  return (
    <div>
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        return (
          <span key={index} className={`text-xl sm:text-2x1 cursor-pointer transition-colors ${starValue <= rating ? "text-yellow-500" : "text-gray-400"}`}
          onClick={()=> handleRating(starValue)}>
            &#9733;
          </span>
        )
      })}
    </div>
  )
};

export default Rating;
