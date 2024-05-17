import React from "react";

const NoteCard = ({
  title,
  date,
  content,
  tags,
  isPinned,
  onEdit,
  onDelete,
  onPinNote,
}) => {
  return (
    <div className="">
        <div>
            <h6 className="text-sm font-medium">{title}</h6>
            <span ></span>
        </div>
    </div>
  )
};

export default NoteCard;
