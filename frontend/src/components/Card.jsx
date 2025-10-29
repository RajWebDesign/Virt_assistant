import React from "react";

function Card({ image, isSelected }) {
  return (
    <div
      className={`w-[200px] h-[300px] sm:w-[180px] sm:h-[260px] bg-[blue] border-2 ${
        isSelected ? "border-white shadow-2xl shadow-white" : "border-[blue]"
      } rounded-2xl overflow-hidden flex justify-center items-center cursor-pointer transition-all duration-300`}
    >
      <img
        src={image}
        alt="assistant"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export default Card;
