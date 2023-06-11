import React, { useEffect, useState } from "react";
import Modal from "../Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListDots } from "@fortawesome/free-solid-svg-icons";

export interface TourModalProps {}

function TourModal({}: TourModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem("lightwand-tour-shown");
    if (!hasSeen) {
      setIsVisible(true);
    }
  }, []);

  const handleAck = () => {
    localStorage.setItem("lightwand-tour-shown", "true");
    setIsVisible(false);
  };

  return (
    <Modal
      visible={isVisible}
      onClose={handleAck}
      title="Welcome to Lightwand!"
      blackout
      content={
        <div className="text-slate-600">
          The Lightwand Editor lets you build React/Tailwind front-ends with the
          help of an LLM. There's a few basics to know before you start
          building:
          <ul className="list-disc list-inside p-4 space-y-2 text-slate-800 font-semibold">
            <li>
              Hover over an element in the Browser Preview Window to see the
              component name, and click to edit the component.
            </li>
            <li>
              When editing a component, you can <b>either</b> provide a
              description for the change you'd like in the "Describe changes..."
              text box to have the LLM make edits for you, <b>or</b> edit the
              JSX code directly.
            </li>
            <li>
              Click <FontAwesomeIcon icon={faListDots} /> to view a list of all
              components.
            </li>
          </ul>
          Happy building!
        </div>
      }
      actions={[
        <button
          className="w-full bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-300 shadow-md p-2 rounded-lg disabled:opacity-20 font-semibold mt-4"
          onClick={handleAck}
        >
          Got it!
        </button>,
      ]}
    />
  );
}

export default TourModal;