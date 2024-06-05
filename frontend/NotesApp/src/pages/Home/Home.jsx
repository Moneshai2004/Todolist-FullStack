import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/cards/NoteCard";
import { useNavigate } from "react-router-dom";
import { MdAdd } from "react-icons/md";
import AddEditNotes from "./AddEditNotes";
import Modal from "react-modal";
import axiosInstance from "../../utils/axiosInstances";

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });
  const [userInfo, setUserInfo] = useState(null);

  const navigate = useNavigate();

  const getUserInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get("get-user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        console.error("Error fetching user info:", error);
      }
    }
  };

  useEffect(() => {
    getUserInfo();
    return () => {};
  }, []);

  // Function to close the modal
  const closeModal = () => {
    setOpenAddEditModal({ isShown: false, type: "add", data: null });
  };

  return (
    <>
      <Navbar userInfo={userInfo} />
      <div className="container mx-auto">
        <div className="grid grid-cols-3 gap-4 mt-8">
          <NoteCard
            title="meeting on 7th may"
            date="3rd apr 2004"
            content="meeting on 7th april meeting on the april"
            tags="#meeting"
            isPinned={true}
            onEdit={() => {
              setOpenAddEditModal({
                isShown: true,
                type: "edit",
                data: {
                  title: "meeting on 7th may",
                  date: "3rd apr 2004",
                  content: "meeting on 7th april meeting on the april",
                  tags: ["#meeting"],
                  isPinned: true,
                },
              });
            }}
            onDelete={() => {}}
            onPinNote={() => {}}
          />
        </div>
      </div>
      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({ isShown: true, type: "add", data: null });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={closeModal}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel="Add/Edit Note"
        className="w-full max-w-lg max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={closeModal}
        />
      </Modal>
    </>
  );
};

export default Home;
