import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/about">About Us</Link>
        <Link to="/concerns">Concerns⌄</Link>
        <Link to="/careers">Careers</Link>
      </div>

      <div className="nav-right">
        <Link to="/login">Log In</Link>
      </div>
    </nav>
  );
}

export default Navbar;