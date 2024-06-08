import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/cards/NoteCard";
import { useNavigate } from "react-router-dom";
import { MdAdd } from "react-icons/md";
import AddEditNotes from "./AddEditNotes";
import Modal from "react-modal";
import axiosInstance from "../../utils/axiosInstances.js"; // Corrected import path

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });
  const [userInfo, setUserInfo] = useState(null);
  const [allNotes, setAllNotes] = useState([]);
  const [error, setError] = useState(null); // Added error state

  const navigate = useNavigate();

  const getUserInfo = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.get("/get-user", {
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

  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");
      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log("An unexpected error occurred:", error);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const response = await axiosInstance.delete(`/delete-notes/${noteId}`);
      if (response.data && response.data.success) {
        getAllNotes();
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        console.log("An unexpected error occurred:", error);
      }
    }
  };

  useEffect(() => {
    getUserInfo();
    getAllNotes();
    return () => {};
  }, []);

  const closeModal = () => {
    setOpenAddEditModal({ isShown: false, type: "add", data: null });
  };

  const handleEdit = (note) => {
    setOpenAddEditModal({
      isShown: true,
      type: "edit",
      data: note,
    });
  };

  return (
    <>
      <Navbar userInfo={userInfo} />
      <div className="container mx-auto">
        <div className="grid grid-cols-3 gap-4 mt-8">
          {allNotes.map((item) => (
            <NoteCard
              key={item._id}
              title={item.title}
              date={item.createdOn}
              content={item.content}
              tags={item.tags}
              isPinned={item.isPinned}
              onEdit={() => handleEdit(item)}
              onDelete={() => deleteNote(item._id)}
              onPinNote={() => {}}
            />
          ))}
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
          getAllNotes={getAllNotes}
        />
      </Modal>
    </>
  );
};

export default Home;
