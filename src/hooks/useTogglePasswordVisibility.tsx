import { useState } from "react";

export const useTogglePasswordVisibility = () => {
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [rightIcon, setRightIcon] = useState<"eye" | "eye-off">("eye");

  const handlePasswordVisibility = () => {
    setRightIcon(rightIcon === "eye" ? "eye-off" : "eye");
    setPasswordVisibility(!passwordVisibility);
  };

  return {
    passwordVisibility,
    rightIcon,
    handlePasswordVisibility,
  };
};
