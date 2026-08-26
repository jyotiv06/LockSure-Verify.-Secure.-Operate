import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
      
      <h1 className="text-xl font-bold">
        🏦 Bank Locker Portal
      </h1>

      <div className="flex gap-6">
        <Link to="/dashboard" className="hover:text-blue-200">
          Dashboard
        </Link>

        <Link to="/profile" className="hover:text-blue-200">
          Profile
        </Link>

        <Link to="/" className="hover:text-blue-200">
          Logout
        </Link>
      </div>

    </nav>
  );
}

export default Navbar;