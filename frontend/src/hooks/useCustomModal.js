import { useState } from 'react';

const useCustomModal = () => {
  const [modalState, setModalState] = useState({
    visible: false,
    title: '',
    message: '',
    emoji: '',
    buttonText: 'Entendido'
  });

  const showModal = ({ title, message, emoji, buttonText = 'Entendido' }) => {
    setModalState({
      visible: true,
      title,
      message,
      emoji,
      buttonText
    });
  };

  const hideModal = () => {
    setModalState({
      visible: false,
      title: '',
      message: '',
      emoji: '',
      buttonText: 'Entendido'
    });
  };

  return {
    modalState,
    showModal,
    hideModal
  };
};

export default useCustomModal; 