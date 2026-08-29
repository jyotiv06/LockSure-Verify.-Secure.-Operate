function Button({ children, onClick, type = "button", variant = "primary" }) {
  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-gray-200 text-gray-800 hover:bg-gray-300";

  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-5 py-2 rounded-lg font-medium transition ${styles}`}
    >
      {children}
    </button>
  );
}

export default Button;